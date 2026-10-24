package com.fudn.planora.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorServiceDetailResponse {
    private Long id;
    private Long vendorId;
    private Long categoryId;
    private String categoryName;
    private String serviceName;
    private String description;
    private BigDecimal priceFrom;
    private BigDecimal priceTo;
    private Boolean active;
    private List<PackageResponse> packages;
}

