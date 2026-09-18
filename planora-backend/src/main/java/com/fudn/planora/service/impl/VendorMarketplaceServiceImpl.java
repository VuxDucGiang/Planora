package com.fudn.planora.service.impl;

import com.fudn.planora.dto.response.*;
import com.fudn.planora.entity.*;
import com.fudn.planora.repository.*;
import com.fudn.planora.service.VendorMarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorMarketplaceServiceImpl implements VendorMarketplaceService {

    private final VendorRepository vendorRepository;
    private final VendorShortlistRepository shortlistRepository;
    private final VendorMatchesRepository matchesRepository;
    private final WeddingPlanRepository weddingPlanRepository;

    @Override
    public Page<VendorResponse> getVendors(
            String query, Long categoryId, String city,
            Long styleId, Double priceFrom, Double priceTo, Pageable pageable
    ) {
        Page<Vendor> vendors = vendorRepository.filterVendors(
                query, categoryId, city, styleId, priceFrom, priceTo, pageable
        );
        return vendors.map(this::mapToVendorResponse);
    }

    @Override
    public VendorDetailResponse getVendorDetail(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp có ID: " + vendorId));

        List<PortfolioResponse> portfolios = vendor.getPortfolios().stream()
                .map(p -> PortfolioResponse.builder()
                        .id(p.getId())
                        .imageUrl(p.getImageUrl())
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList());

        List<PackageResponse> packages = vendor.getServices().stream()
                .flatMap(s -> s.getPackages().stream())
                .map(pkg -> PackageResponse.builder()
                        .id(pkg.getId())
                        .packageName(pkg.getPackageName())
                        .description(pkg.getDescription())
                        .price(pkg.getPrice())
                        .build())
                .collect(Collectors.toList());

        Set<String> styles = vendor.getWeddingStyles().stream()
                .map(WeddingStyle::getName)
                .collect(Collectors.toSet());

        return VendorDetailResponse.builder()
                .id(vendor.getId())
                .businessName(vendor.getBusinessName())
                .description(vendor.getDescription())
                .experienceYears(vendor.getExperienceYears())
                .city(vendor.getCity())
                .district(vendor.getDistrict())
                .verified(vendor.getVerified())
                .ratingAverage(vendor.getRatingAverage())
                .totalReviews(vendor.getTotalReviews())
                .styles(styles)
                .portfolios(portfolios)
                .packages(packages)
                .build();
    }

    @Override
    public List<VendorResponse> getShortlist(Long planId, Long currentUserId) {
        validateWeddingPlanOwner(planId, currentUserId);
        return shortlistRepository.findByWeddingPlanId(planId).stream()
                .map(shortlist -> mapToVendorResponse(shortlist.getVendor()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addToShortlist(Long planId, Long vendorId, Long currentUserId) {
        WeddingPlan plan = validateWeddingPlanOwner(planId, currentUserId);
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp"));

        if (shortlistRepository.existsByWeddingPlanIdAndVendorId(planId, vendorId)) {
            throw new RuntimeException("Nhà cung cấp này đã nằm trong danh sách yêu thích");
        }

        VendorShortlist shortlist = VendorShortlist.builder()
                .weddingPlan(plan)
                .vendor(vendor)
                .build();

        shortlistRepository.save(shortlist);
    }

    @Override
    @Transactional
    public void removeFromShortlist(Long planId, Long vendorId, Long currentUserId) {
        validateWeddingPlanOwner(planId, currentUserId);
        VendorShortlist shortlist = shortlistRepository.findByWeddingPlanIdAndVendorId(planId, vendorId)
                .orElseThrow(() -> new RuntimeException("Nhà cung cấp không nằm trong danh sách yêu thích"));

        shortlistRepository.delete(shortlist);
    }

    @Override
    @Transactional
    public List<VendorMatchResponse> getMatches(Long planId, Long currentUserId) {
        WeddingPlan plan = validateWeddingPlanOwner(planId, currentUserId);
        List<VendorMatches> existingMatches = matchesRepository.findByWeddingPlanIdOrderByMatchingScoreDesc(planId);
        
        if (existingMatches.isEmpty()) {
            List<Vendor> allVendors = vendorRepository.findAll();
            List<VendorMatches> newMatches = new java.util.ArrayList<>();
            
            for (Vendor vendor : allVendors) {
                double score = 0.5;
                String reason = "Nhà cung cấp dịch vụ cưới được đánh giá tốt.";
                
                boolean cityMatches = false;
                if (plan.getLocation() != null && vendor.getCity() != null && 
                    plan.getLocation().trim().equalsIgnoreCase(vendor.getCity().trim())) {
                    score += 0.3;
                    cityMatches = true;
                }
                
                boolean styleMatches = false;
                String matchedStyleName = "";
                if (plan.getWeddingStyles() != null && vendor.getWeddingStyles() != null) {
                    for (WeddingStyle planStyle : plan.getWeddingStyles()) {
                        for (WeddingStyle vendorStyle : vendor.getWeddingStyles()) {
                            if (planStyle.getId().equals(vendorStyle.getId())) {
                                score += 0.15;
                                styleMatches = true;
                                matchedStyleName = planStyle.getName();
                                break;
                            }
                        }
                        if (styleMatches) break;
                    }
                }
                
                if (vendor.getVerified() != null && vendor.getVerified()) {
                    score += 0.05;
                }
                
                if (cityMatches && styleMatches) {
                    reason = "Phù hợp hoàn hảo với địa điểm cưới tại " + vendor.getCity() + " và phong cách " + matchedStyleName + " bạn chọn.";
                } else if (cityMatches) {
                    reason = "Phù hợp với địa điểm tổ chức đám cưới của bạn tại " + vendor.getCity() + ".";
                } else if (styleMatches) {
                    reason = "Phù hợp với phong cách cưới " + matchedStyleName + " mà bạn yêu thích.";
                } else {
                    reason = "Nhà cung cấp nổi bật với " + (vendor.getExperienceYears() != null ? vendor.getExperienceYears() : 3) + " năm kinh nghiệm và đánh giá " + (vendor.getRatingAverage() != null ? vendor.getRatingAverage() : 4.8) + " sao.";
                }
                
                if (score >= 0.6) {
                    VendorMatches match = VendorMatches.builder()
                            .weddingPlan(plan)
                            .vendor(vendor)
                            .matchingScore(score)
                            .reason(reason)
                            .build();
                    newMatches.add(match);
                }
            }
            
            if (!newMatches.isEmpty()) {
                matchesRepository.saveAll(newMatches);
                existingMatches = matchesRepository.findByWeddingPlanIdOrderByMatchingScoreDesc(planId);
            }
        }
        
        return existingMatches.stream()
                .map(match -> VendorMatchResponse.builder()
                        .id(match.getId())
                        .vendor(mapToVendorResponse(match.getVendor()))
                        .matchingScore(match.getMatchingScore())
                        .reason(match.getReason())
                        .build())
                .collect(Collectors.toList());
    }

    private WeddingPlan validateWeddingPlanOwner(Long planId, Long userId) {
        WeddingPlan plan = weddingPlanRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Kế hoạch đám cưới"));
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền truy cập vào kế hoạch đám cưới này");
        }
        return plan;
    }

    private VendorResponse mapToVendorResponse(Vendor vendor) {
        Set<String> styles = vendor.getWeddingStyles().stream()
                .map(WeddingStyle::getName)
                .collect(Collectors.toSet());

        return VendorResponse.builder()
                .id(vendor.getId())
                .businessName(vendor.getBusinessName())
                .description(vendor.getDescription())
                .experienceYears(vendor.getExperienceYears())
                .city(vendor.getCity())
                .district(vendor.getDistrict())
                .verified(vendor.getVerified())
                .ratingAverage(vendor.getRatingAverage())
                .totalReviews(vendor.getTotalReviews())
                .styles(styles)
                .build();
    }
}