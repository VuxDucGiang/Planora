package com.fudn.planora.dto.response;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivePlanResponse {
    private Long id;
    private String title;
    private LocalDate weddingDate;
    private Integer guestCount;
    private BigDecimal budget;
    private String location;
    private String status;
    private List<BudgetItemSummary> budgetItems;
    private List<ConceptSummary> conceptSuggestions;
    private ChecklistStats checklistStats;
    private List<TaskResponse> checklistTasks;
    private List<EventResponse> timelineEvents;
    private BudgetAnalytics budgetAnalytics;

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BudgetItemSummary {
        private String categoryName;
        private BigDecimal estimatedCost;
        private BigDecimal actualCost;
        private Double percentage;
        private Boolean isPriority;
        private String note;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ConceptSummary {
        private String conceptName;
        private String description;
        private BigDecimal estimatedBudget;
        private List<String> colorPalette;
        private String floralTheme;
        private String vibe;
        private String decorNote;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChecklistStats {
        private long totalTasks;
        private long completedTasks;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BudgetAnalytics {
        private BigDecimal costPerGuest;
        private Integer estimatedTables;
        private BigDecimal tableCostEstimated;
        private BigDecimal contingencyBuffer;
        private BigDecimal totalAllocated;
    }
}