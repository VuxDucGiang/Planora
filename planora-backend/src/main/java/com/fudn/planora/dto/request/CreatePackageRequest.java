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
public class CreatePackageRequest {

    @NotBlank(message = "Tên gói dịch vụ không được để trống!")
    private String packageName;

    private String description;

    @NotNull(message = "Giá niêm yết của gói không được để trống!")
    private BigDecimal price;
}

