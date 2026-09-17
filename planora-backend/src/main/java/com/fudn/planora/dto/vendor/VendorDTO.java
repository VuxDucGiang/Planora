package com.fudn.planora.dto.vendor;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;

public class VendorDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorResponse {
        private Long id;
        private String businessName;
        private String description;
        private Integer experienceYears;
        private String city;
        private String district;
        private Boolean verified;
        private Double ratingAverage;
        private Integer totalReviews;
        private Set<String> styles;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorDetailResponse {
        private Long id;
        private String businessName;
        private String description;
        private Integer experienceYears;
        private String city;
        private String district;
        private Boolean verified;
        private Double ratingAverage;
        private Integer totalReviews;
        private Set<String> styles;

        private List<PortfolioResponse> portfolios;
        private List<PackageResponse> packages;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorMatchResponse {
        private Long id;
        private VendorResponse vendor;
        private Double matchingScore;
        private String reason;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PackageResponse {
        private Long id;
        private String packageName;
        private String description;
        private BigDecimal price;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PortfolioResponse {
        private Long id;
        private String imageUrl;
        private String title;
        private String description;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ServiceCategoryResponse {
        private Long id;
        private String name;
    }
}
