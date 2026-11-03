package com.fudn.planora.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
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

    @DecimalMin(value = "0", message = "Giá khởi điểm không được nhỏ hơn 0!")
    @DecimalMax(value = "500000000", message = "Giá khởi điểm không được vượt quá 500.000.000 đ (500 triệu VNĐ)!")
    private BigDecimal priceFrom;

    @DecimalMin(value = "0", message = "Giá đến mức không được nhỏ hơn 0!")
    @DecimalMax(value = "500000000", message = "Giá đến mức không được vượt quá 500.000.000 đ (500 triệu VNĐ)!")
    private BigDecimal priceTo;

    @Builder.Default
    private Boolean active = true;
}
