package com.fudn.planora.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorLeadResponse {
    private Long id;
    private Long weddingPlanId;
    private String customerName;
    private String customerAvatar;
    private Double matchingScore;
    private String reason;
    private LocalDate weddingDate;
    private Integer guestCount;
    private BigDecimal budget;
    private String location;
}
