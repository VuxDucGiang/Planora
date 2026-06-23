package com.fudn.planora.dto.response;


import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeddingPlanResponse {
    private Long id;
    private String title;
    private LocalDate weddingDate;
    private Integer guestCount;
    private BigDecimal budget;
    private String location;
    private String status;
}
