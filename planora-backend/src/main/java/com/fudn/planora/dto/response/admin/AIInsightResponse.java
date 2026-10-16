package com.fudn.planora.dto.response.admin;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AIInsightResponse {
    private List<BudgetBucket> budgetDistribution;
    private double averageBudget;
    private List<StylePopularity> topStyles;
    private List<GuestCountBucket> guestCountDistribution;
    private AIPerformance aiPerformance;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BudgetBucket {
        private String rangeName;
        private long count;
        private double percentage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StylePopularity {
        private String styleName;
        private long count;
        private double percentage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class GuestCountBucket {
        private String rangeName;
        private long count;
        private double percentage;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AIPerformance {
        private long totalGenerations;
        private double averageLatencyMs;
        private double successRate;
        private long estimatedTokens;
    }
}
