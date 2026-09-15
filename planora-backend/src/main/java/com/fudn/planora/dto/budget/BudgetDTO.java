package com.fudn.planora.dto.budget;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public class BudgetDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateItemRequest {
        private BigDecimal estimatedCost;
        private BigDecimal actualCost;
        private String note;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ItemResponse {
        private Long itemId;
        private Long categoryId;
        private String categoryName;
        private BigDecimal estimatedCost;
        private BigDecimal actualCost;
        private String note;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private BigDecimal totalBudget;
        private BigDecimal totalEstimated;
        private BigDecimal totalActualSpent;
        private List<ItemResponse> categories;
    }
}
