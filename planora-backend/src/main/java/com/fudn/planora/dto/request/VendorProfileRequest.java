package com.fudn.planora.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorProfileRequest {

    @NotBlank(message = "Tên thương hiệu không được để trống!")
    private String businessName;

    private String description;

    private Integer experienceYears;

    private String city;

    private String district;

    private String phone;

    private String avatarUrl;

    private Set<Long> styleIds;
}
