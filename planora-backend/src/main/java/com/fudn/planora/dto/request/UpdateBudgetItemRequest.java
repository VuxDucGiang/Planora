package com.fudn.planora.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class UpdateBudgetItemRequest {
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private String note;
}
