package com.fudn.planora.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateVendorServiceRequest {

    @NotNull(message = "Danh mục dịch vụ không được để trống!")
    private Long categoryId;

    @NotBlank(message = "Tên dịch vụ không được để trống!")
    private String serviceName;

    private String description;

    private BigDecimal priceFrom;

    private BigDecimal priceTo;

    @Builder.Default
    private Boolean active = true;
}

