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

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BudgetItemSummary {
        private String categoryName;
        private BigDecimal estimatedCost;
        private BigDecimal actualCost;
        private String note;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ConceptSummary {
        private String conceptName;
        private String description;
        private BigDecimal estimatedBudget;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ChecklistStats {
        private long totalTasks;
        private long completedTasks;
    }
}