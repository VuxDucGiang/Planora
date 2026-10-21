package com.fudn.planora.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorAnalyticsResponse {
    // Reviews & Reputation
    private Integer totalReviews;
    private Double ratingAverage;
    private Long fiveStarCount;
    private Long fourStarCount;
    private Long threeStarCount;
    private Long twoStarCount;
    private Long oneStarCount;

    // Inquiries Funnel
    private Long totalInquiries;
    private Long pendingInquiries;
    private Long respondedInquiries;
    private Long closedInquiries;

    // Platform Performance
    private Long totalShortlists;
    private Long activeServicesCount;
    private Long totalPackagesCount;
    private Long portfolioImagesCount;

    // AI Matching Leads
    private Long potentialLeadsCount;
    private List<VendorLeadResponse> recentMatchingLeads;
}
