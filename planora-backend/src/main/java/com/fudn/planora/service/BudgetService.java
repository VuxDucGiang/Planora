package com.fudn.planora.service;

import com.fudn.planora.dto.budget.BudgetDTO;

public interface BudgetService {
    BudgetDTO.Response getBudget(Long planId, String email);
    BudgetDTO.ItemResponse updateBudgetItem(Long itemId, BudgetDTO.UpdateItemRequest request, String email);
}