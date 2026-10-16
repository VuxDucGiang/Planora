package com.fudn.planora.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSummaryResponse {
    private long totalUsers;
    private long totalCouples;
    private long totalVendors;
    private long dailyActiveUsers;     // DAU (hoạt động trong 24h qua)
    private long totalPlansGenerated;
    private long totalInquiriesSent;
    private double planConversionRate; // % user tạo plan sau đăng ký
}
