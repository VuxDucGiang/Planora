package com.fudn.planora.dto.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetResponse {
    private BigDecimal totalBudget;
    private BigDecimal totalEstimated;
    private BigDecimal totalActualSpent;
    private List<BudgetItemResponse> categories;
}
