package com.fudn.planora.service.impl;

import com.fudn.planora.dto.response.VendorAnalyticsResponse;
import com.fudn.planora.dto.response.VendorLeadResponse;
import com.fudn.planora.entity.*;
import com.fudn.planora.enums.EInquiryStatus;
import com.fudn.planora.repository.*;
import com.fudn.planora.service.VendorAnalyticsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorAnalyticsServiceImpl implements VendorAnalyticsService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ReviewRepository reviewRepository;
    private final InquiryRepository inquiryRepository;
    private final VendorShortlistRepository shortlistRepository;
    private final VendorServiceRepository serviceRepository;
    private final VendorPortfolioRepository portfolioRepository;
    private final VendorMatchesRepository matchesRepository;

    private Vendor getVendorByEmail(String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có email: " + email));

        return vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa đăng ký hồ sơ Nhà cung cấp!"));
    }

    @Override
    @Transactional(readOnly = true)
    public VendorAnalyticsResponse getVendorAnalytics(String email) {
        Vendor vendor = getVendorByEmail(email);
        Long vendorId = vendor.getId();

        // 1. Reviews Breakdown
        List<Review> reviews = reviewRepository.findByVendorId(vendorId);
        long fiveStar = reviews.stream().filter(r -> r.getRating() != null && r.getRating() == 5).count();
        long fourStar = reviews.stream().filter(r -> r.getRating() != null && r.getRating() == 4).count();
        long threeStar = reviews.stream().filter(r -> r.getRating() != null && r.getRating() == 3).count();
        long twoStar = reviews.stream().filter(r -> r.getRating() != null && r.getRating() == 2).count();
        long oneStar = reviews.stream().filter(r -> r.getRating() != null && r.getRating() == 1).count();

        // 2. Inquiries Stats
        List<Inquiry> inquiries = inquiryRepository.findByVendorIdOrderByUpdatedAtDesc(vendorId);
        long pending = inquiries.stream().filter(i -> i.getStatus() == EInquiryStatus.PENDING).count();
        long responded = inquiries.stream().filter(i -> i.getStatus() == EInquiryStatus.RESPONDED).count();
        long closed = inquiries.stream().filter(i -> i.getStatus() == EInquiryStatus.CLOSED).count();

        // 3. Shortlists & Catalogs
        Long shortlistCount = shortlistRepository.countByVendorId(vendorId);
        List<VendorService> services = serviceRepository.findByVendorIdOrderByCreatedAtDesc(vendorId);
        long activeServices = services.stream().filter(s -> Boolean.TRUE.equals(s.getActive())).count();
        long totalPackages = services.stream().mapToLong(s -> (s.getPackages() != null ? s.getPackages().size() : 0)).sum();
        long portfolioCount = portfolioRepository.findByVendorIdOrderByCreatedAtDesc(vendorId).size();

        // 4. AI Matching Leads
        List<VendorMatches> matches = matchesRepository.findByVendorIdOrderByMatchingScoreDesc(vendorId);
        List<VendorLeadResponse> leadResponses = matches.stream()
                .limit(10)
                .map(m -> {
                    WeddingPlan plan = m.getWeddingPlan();
                    User customer = plan != null ? plan.getUser() : null;
                    return VendorLeadResponse.builder()
                            .id(m.getId())
                            .weddingPlanId(plan != null ? plan.getId() : null)
                            .customerName(customer != null ? customer.getFullname() : "Cặp đôi Planora")
                            .customerAvatar(customer != null ? customer.getAvatarUrl() : null)
                            .matchingScore(m.getMatchingScore() != null ? m.getMatchingScore() : 85.0)
                            .reason(m.getReason())
                            .weddingDate(plan != null ? plan.getWeddingDate() : null)
                            .guestCount(plan != null ? plan.getGuestCount() : null)
                            .budget(plan != null ? plan.getBudget() : null)
                            .location(plan != null ? plan.getLocation() : null)
                            .build();
                })
                .collect(Collectors.toList());

        return VendorAnalyticsResponse.builder()
                .totalReviews(vendor.getTotalReviews() != null ? vendor.getTotalReviews() : reviews.size())
                .ratingAverage(vendor.getRatingAverage() != null ? vendor.getRatingAverage() : 0.0)
                .fiveStarCount(fiveStar)
                .fourStarCount(fourStar)
                .threeStarCount(threeStar)
                .twoStarCount(twoStar)
                .oneStarCount(oneStar)
                .totalInquiries((long) inquiries.size())
                .pendingInquiries(pending)
                .respondedInquiries(responded)
                .closedInquiries(closed)
                .totalShortlists(shortlistCount != null ? shortlistCount : 0L)
                .activeServicesCount(activeServices)
                .totalPackagesCount(totalPackages)
                .portfolioImagesCount(portfolioCount)
                .potentialLeadsCount((long) matches.size())
                .recentMatchingLeads(leadResponses)
                .build();
    }
}
