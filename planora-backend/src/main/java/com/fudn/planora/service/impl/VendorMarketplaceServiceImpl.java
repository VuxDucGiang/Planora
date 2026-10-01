package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.CreateReviewRequest;
import com.fudn.planora.dto.response.*;
import com.fudn.planora.entity.*;
import com.fudn.planora.repository.*;
import com.fudn.planora.service.VendorMarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
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
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;

    @Override
    public Page<VendorResponse> getVendors(
            String query, Long categoryId, String city,
            Long styleId, BigDecimal priceFrom, BigDecimal priceTo, Pageable pageable
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

        List<PortfolioResponse> portfolios = vendor.getPortfolios() != null
                ? vendor.getPortfolios().stream()
                .map(p -> PortfolioResponse.builder()
                        .id(p.getId())
                        .imageUrl(p.getImageUrl())
                        .title(p.getTitle())
                        .description(p.getDescription())
                        .build())
                .collect(Collectors.toList())
                : new ArrayList<>();

        List<PackageResponse> packages = vendor.getServices() != null
                ? vendor.getServices().stream()
                .filter(s -> s.getPackages() != null)
                .flatMap(s -> s.getPackages().stream())
                .map(pkg -> PackageResponse.builder()
                        .id(pkg.getId())
                        .packageName(pkg.getPackageName())
                        .description(pkg.getDescription())
                        .price(pkg.getPrice())
                        .build())
                .collect(Collectors.toList())
                : new ArrayList<>();

        Set<String> styles = vendor.getWeddingStyles() != null
                ? vendor.getWeddingStyles().stream()
                .map(WeddingStyle::getName)
                .collect(Collectors.toSet())
                : Set.of();

        // Get reviews
        List<ReviewResponse> recentReviews = reviewRepository.findByVendorIdOrderByCreatedAtDesc(
                        vendorId, PageRequest.of(0, 10))
                .getContent()
                .stream()
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());

        String primaryCategoryName = getPrimaryCategory(vendor);
        BigDecimal[] priceRange = getPriceRange(vendor);

        String phone = vendor.getUser() != null ? vendor.getUser().getPhone() : null;
        String email = vendor.getUser() != null ? vendor.getUser().getEmail() : null;
        String avatarUrl = vendor.getUser() != null ? vendor.getUser().getAvatarUrl() : null;

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
                .primaryCategoryName(primaryCategoryName)
                .priceFrom(priceRange[0])
                .priceTo(priceRange[1])
                .phone(phone)
                .email(email)
                .avatarUrl(avatarUrl)
                .portfolios(portfolios)
                .packages(packages)
                .reviews(recentReviews)
                .build();
    }

    @Override
    public List<VendorResponse> getFeaturedVendors() {
        List<Vendor> featured = vendorRepository.findTop6ByVerifiedTrueOrderByRatingAverageDescTotalReviewsDesc();
        return featured.stream()
                .map(this::mapToVendorResponse)
                .collect(Collectors.toList());
    }

    @Override
    public VendorCompareResponse compareVendors(List<Long> vendorIds) {
        if (vendorIds == null || vendorIds.size() < 2 || vendorIds.size() > 4) {
            throw new IllegalArgumentException("Vui lòng chọn từ 2 đến 4 nhà cung cấp để so sánh");
        }

        List<VendorDetailResponse> details = vendorIds.stream()
                .map(this::getVendorDetail)
                .collect(Collectors.toList());

        return VendorCompareResponse.builder()
                .vendors(details)
                .totalCompared(details.size())
                .build();
    }

    @Override
    public List<VendorResponse> getShortlist(Long planId, Long currentUserId) {
        validateWeddingPlanOwner(planId, currentUserId);
        return shortlistRepository.findByWeddingPlanIdWithVendor(planId).stream()
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
            List<VendorMatches> newMatches = new ArrayList<>();

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

    @Override
    public Page<ReviewResponse> getVendorReviews(Long vendorId, Pageable pageable) {
        if (!vendorRepository.existsById(vendorId)) {
            throw new RuntimeException("Không tìm thấy Nhà cung cấp có ID: " + vendorId);
        }
        return reviewRepository.findByVendorIdOrderByCreatedAtDesc(vendorId, pageable)
                .map(this::mapToReviewResponse);
    }

    @Override
    @Transactional
    public void addVendorReview(Long vendorId, CreateReviewRequest request, Long currentUserId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp có ID: " + vendorId));

        User customer = userRepository.findById(currentUserId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin người dùng"));

        Review review = Review.builder()
                .vendor(vendor)
                .customer(customer)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        reviewRepository.save(review);

        // Recalculate average rating and total reviews
        Double avgRating = reviewRepository.calculateAverageRatingByVendorId(vendorId);
        Long totalReviews = reviewRepository.countByVendorId(vendorId);

        vendor.setRatingAverage(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        vendor.setTotalReviews(totalReviews != null ? totalReviews.intValue() : 0);
        vendorRepository.save(vendor);
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
        Set<String> styles = vendor.getWeddingStyles() != null
                ? vendor.getWeddingStyles().stream()
                .map(WeddingStyle::getName)
                .collect(Collectors.toSet())
                : Set.of();

        String primaryCategoryName = getPrimaryCategory(vendor);
        BigDecimal[] priceRange = getPriceRange(vendor);
        String imageUrl = getCoverImage(vendor);

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
                .primaryCategoryName(primaryCategoryName)
                .priceFrom(priceRange[0])
                .priceTo(priceRange[1])
                .imageUrl(imageUrl)
                .build();
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        String customerName = review.getCustomer() != null ? review.getCustomer().getFullname() : "Khách hàng";
        String customerAvatar = review.getCustomer() != null ? review.getCustomer().getAvatarUrl() : null;
        Long customerId = review.getCustomer() != null ? review.getCustomer().getId() : null;

        return ReviewResponse.builder()
                .id(review.getId())
                .customerId(customerId)
                .customerName(customerName)
                .customerAvatar(customerAvatar)
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }

    private String getPrimaryCategory(Vendor vendor) {
        if (vendor.getServices() != null && !vendor.getServices().isEmpty()) {
            for (VendorService vs : vendor.getServices()) {
                if (vs.getCategory() != null && vs.getCategory().getName() != null) {
                    return vs.getCategory().getName();
                }
            }
        }
        return "Dịch vụ cưới";
    }

    private BigDecimal[] getPriceRange(Vendor vendor) {
        BigDecimal minPrice = null;
        BigDecimal maxPrice = null;

        if (vendor.getServices() != null) {
            for (VendorService s : vendor.getServices()) {
                if (s.getPriceFrom() != null) {
                    if (minPrice == null || s.getPriceFrom().compareTo(minPrice) < 0) {
                        minPrice = s.getPriceFrom();
                    }
                }
                if (s.getPriceTo() != null) {
                    if (maxPrice == null || s.getPriceTo().compareTo(maxPrice) > 0) {
                        maxPrice = s.getPriceTo();
                    }
                }
                if (s.getPackages() != null) {
                    for (VendorPackage pkg : s.getPackages()) {
                        if (pkg.getPrice() != null) {
                            if (minPrice == null || pkg.getPrice().compareTo(minPrice) < 0) {
                                minPrice = pkg.getPrice();
                            }
                            if (maxPrice == null || pkg.getPrice().compareTo(maxPrice) > 0) {
                                maxPrice = pkg.getPrice();
                            }
                        }
                    }
                }
            }
        }

        return new BigDecimal[]{minPrice, maxPrice};
    }

    private String getCoverImage(Vendor vendor) {
        if (vendor.getPortfolios() != null && !vendor.getPortfolios().isEmpty()) {
            return vendor.getPortfolios().get(0).getImageUrl();
        }
        if (vendor.getUser() != null && vendor.getUser().getAvatarUrl() != null) {
            return vendor.getUser().getAvatarUrl();
        }
        return null;
    }
}