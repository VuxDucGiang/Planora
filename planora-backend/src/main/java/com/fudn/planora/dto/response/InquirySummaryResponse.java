package com.fudn.planora.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquirySummaryResponse {
    private Long id;
    private Long weddingPlanId;
    private Long customerId;
    private String customerName;
    private String customerAvatar;
    private String customerPhone;
    private String customerEmail;
    private Long vendorId;
    private String vendorName;
    private String vendorAvatar;
    private String title;
    private String latestMessage;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Wedding plan context
    private LocalDate weddingDate;
    private Integer guestCount;
    private BigDecimal budget;
    private String location;
}

