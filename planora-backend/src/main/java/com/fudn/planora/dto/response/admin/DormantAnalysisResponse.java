package com.fudn.planora.dto.response.admin;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DormantAnalysisResponse {
    private long totalCouples;
    private long activeCount;       // < 7 ngày
    private long atRiskCount;       // 7 - 29 ngày (nguy cơ)
    private long dormantCount;      // >= 30 ngày (ngủ đông)
    private double healthScore;     // Tỷ lệ active / totalCouples (%)
    private List<DormantUserItem> dormantUsers;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DormantUserItem {
        private Long userId;
        private String fullName;
        private String email;
        private String phone;
        private String statusRisk;      // "AT_RISK" hoặc "DORMANT"
        private long daysInactive;
        private LocalDateTime lastActiveAt;
        private String lastAction;
        private String weddingTitle;
        private LocalDate weddingDate;
        private Long daysUntilWedding;  // Số ngày còn lại đến đám cưới
        private Double budget;
    }
}
