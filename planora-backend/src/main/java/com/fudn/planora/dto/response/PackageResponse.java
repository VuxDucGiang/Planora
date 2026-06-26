package com.fudn.planora.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackageResponse {
    private Long id;
    private String packageName;
    private String description;
    private BigDecimal price;
}