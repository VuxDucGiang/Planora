package com.fudn.planora.service.impl;

import com.fudn.planora.dto.vendor.VendorDTO;
import com.fudn.planora.model.*;
import com.fudn.planora.exceptions.PlanoraException;
import com.fudn.planora.exceptions.ResourceNotFoundException;
import com.fudn.planora.repository.*;
import com.fudn.planora.service.VendorMarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fudn.planora.model.Vendor.VendorMatches;
import com.fudn.planora.utils.SecurityUtils;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorMarketplaceServiceImpl implements VendorMarketplaceService {

    private final VendorRepository vendorRepository;
    private final VendorMatchesRepository matchesRepository;
    private final WeddingPlanRepository weddingPlanRepository;
    private final UserRepository userRepository;

    @Override
    public Page<VendorDTO.VendorResponse> getVendors(
            String query, Long categoryId, String city,
            Long styleId, Double priceFrom, Double priceTo, Pageable pageable
    ) {
        Page<Vendor> vendors = vendorRepository.filterVendors(
                query, categoryId, city, styleId, priceFrom, priceTo, pageable
        );
        return vendors.map(this::mapToVendorResponse);
    }

    @Override
    public VendorDTO.VendorDetailResponse getVendorDetail(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Nhà cung cấp có ID: " + vendorId));

        List<VendorDTO.PortfolioResponse> portfolios = vendor.getPortfolios().stream()
                .map(p -> VendorDTO.PortfolioResponse.builder()
                        .id(p.getId())
                        .imageUrl(p.getImageUrl())
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList());

        List<VendorDTO.PackageResponse> packages = vendor.getServices().stream()
                .flatMap(s -> s.getPackages().stream())
                .map(pkg -> VendorDTO.PackageResponse.builder()
                        .id(pkg.getId())
                        .packageName(pkg.getPackageName())
                        .description(pkg.getDescription())
                        .price(pkg.getPrice())
                        .build())
                .collect(Collectors.toList());

        Set<String> styles = vendor.getWeddingStyles() != null
                ? vendor.getWeddingStyles().stream()
                        .filter(Objects::nonNull)
                        .map(style -> style.getName())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        return VendorDTO.VendorDetailResponse.builder()
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
    public List<VendorDTO.VendorResponse> getShortlist(Long planId, String userEmail) {
        WeddingPlan plan = validateWeddingPlanOwner(planId, userEmail);
        Set<Vendor> shortlisted = plan.getShortlistedVendors();
        if (shortlisted == null) {
            return Collections.emptyList();
        }
        return shortlisted.stream()
                .map(this::mapToVendorResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addToShortlist(Long planId, Long vendorId, String userEmail) {
        WeddingPlan plan = validateWeddingPlanOwner(planId, userEmail);
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Nhà cung cấp với ID: " + vendorId));

        if (plan.getShortlistedVendors() == null) {
            plan.setShortlistedVendors(new HashSet<>());
        }

        boolean added = plan.getShortlistedVendors().add(vendor);
        if (!added) {
            throw new PlanoraException("Nhà cung cấp này đã nằm trong danh sách yêu thích", HttpStatus.CONFLICT);
        }

        weddingPlanRepository.save(plan);
    }

    @Override
    @Transactional
    public void removeFromShortlist(Long planId, Long vendorId, String userEmail) {
        WeddingPlan plan = validateWeddingPlanOwner(planId, userEmail);
        if (plan.getShortlistedVendors() == null || !plan.getShortlistedVendors().removeIf(v -> v.getId().equals(vendorId))) {
            throw new ResourceNotFoundException("Nhà cung cấp không nằm trong danh sách yêu thích");
        }

        weddingPlanRepository.save(plan);
    }

    @Override
    @Transactional
    public List<VendorDTO.VendorMatchResponse> getMatches(Long planId, String userEmail) {
        WeddingPlan plan = validateWeddingPlanOwner(planId, userEmail);
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
                .map(match -> VendorDTO.VendorMatchResponse.builder()
                        .id(match.getId())
                        .vendor(mapToVendorResponse(match.getVendor()))
                        .matchingScore(match.getMatchingScore())
                        .reason(match.getReason())
                        .build())
                .collect(Collectors.toList());
    }

    private WeddingPlan validateWeddingPlanOwner(Long planId, String userEmail) {
        String email = userEmail != null ? userEmail : SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng có email: " + email));

        WeddingPlan plan = weddingPlanRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy Kế hoạch đám cưới với ID: " + planId));
        if (!plan.getUser().getId().equals(user.getId())) {
            throw new PlanoraException("Bạn không có quyền truy cập vào kế hoạch đám cưới này", HttpStatus.FORBIDDEN);
        }
        return plan;
    }

    private VendorDTO.VendorResponse mapToVendorResponse(Vendor vendor) {
        Set<String> styles = vendor.getWeddingStyles() != null
                ? vendor.getWeddingStyles().stream()
                        .filter(Objects::nonNull)
                        .map(style -> style.getName())
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        return VendorDTO.VendorResponse.builder()
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
