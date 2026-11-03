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
public class CreatePackageRequest {

    @NotBlank(message = "Tên gói dịch vụ không được để trống!")
    private String packageName;

    private String description;

    @NotNull(message = "Giá niêm yết của gói không được để trống!")
    @DecimalMin(value = "0", message = "Giá gói dịch vụ không được nhỏ hơn 0!")
    @DecimalMax(value = "500000000", message = "Giá gói dịch vụ không được vượt quá 500.000.000 đ (500 triệu VNĐ)!")
    private BigDecimal price;
}
