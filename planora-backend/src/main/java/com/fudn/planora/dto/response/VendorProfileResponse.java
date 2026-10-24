package com.fudn.planora.dto.response;

import lombok.*;

import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String businessName;
    private String description;
    private Integer experienceYears;
    private String city;
    private String district;
    private String phone;
    private String avatarUrl;
    private Boolean verified;
    private Double ratingAverage;
    private Integer totalReviews;
    private Set<Long> styleIds;
    private Set<String> styles;
    private List<PortfolioResponse> portfolios;
    private List<CollectionResponse> collections;
}
