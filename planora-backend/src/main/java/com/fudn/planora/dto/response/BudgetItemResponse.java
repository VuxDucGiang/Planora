package com.fudn.planora.dto.response;

import java.math.BigDecimal;

public class BudgetItemResponse {
    private Long itemId;
    private Long categoryId;
    private String categoryName;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private String note;
}
