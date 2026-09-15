package com.fudn.planora.dto.wedding;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public class WeddingDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OnboardingRequest {
        @NotBlank(message = "Tiêu đề kế hoạch không được để trống")
        private String title;

        @NotNull(message = "Ngày cưới không được để trống")
        private LocalDate weddingDate;

        @NotBlank(message = "Địa điểm không được để trống")
        private String location;

        @NotNull(message = "Số lượng khách không được để trống")
        @Min(value = 1, message = "Số lượng khách phải lớn hơn 0")
        private Integer guestCount;

        @NotNull(message = "Tổng ngân sách không được để trống")
        @Min(value = 0, message = "Ngân sách không được là số âm")
        private BigDecimal budget;

        private Set<Long> styleIds;
        private Set<Long> priorityCategoryIds;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PlanResponse {
        private Long id;
        private String title;
        private LocalDate weddingDate;
        private Integer guestCount;
        private BigDecimal budget;
        private String location;
        private String status;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ActivePlanResponse {
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

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StyleResponse {
        private Long id;
        private String name;
        private String description;
    }
}
