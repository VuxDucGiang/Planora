package com.fudn.planora.dto.response;

import lombok.*;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorResponse {
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