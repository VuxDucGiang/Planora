package com.fudn.planora.service;

import com.fudn.planora.dto.request.UpdateBudgetItemRequest;
import com.fudn.planora.dto.response.BudgetResponse;
import com.fudn.planora.dto.response.BudgetItemResponse;

public interface BudgetService {
    BudgetResponse getBudget(Long planId, String email);
    BudgetItemResponse updateBudgetItem(Long itemId, UpdateBudgetItemRequest request, String email);
}