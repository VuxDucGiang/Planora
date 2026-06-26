package com.fudn.planora.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BudgetItemResponse {
    private Long itemId;
    private Long categoryId;
    private String categoryName;
    private BigDecimal estimatedCost;
    private BigDecimal actualCost;
    private String note;
}
