package com.fudn.planora.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorReviewStatsResponse {
    private Integer totalReviews;
    private Double ratingAverage;
    private Long fiveStarCount;
    private Long fourStarCount;
    private Long threeStarCount;
    private Long twoStarCount;
    private Long oneStarCount;
    private List<ReviewResponse> reviews;
}
