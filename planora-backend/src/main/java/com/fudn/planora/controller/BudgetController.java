package com.fudn.planora.controller;

import com.fudn.planora.dto.budget.BudgetDTO;
import com.fudn.planora.service.BudgetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class BudgetController {

    private final BudgetService budgetService;

    @GetMapping("/wedding-plans/{planId}/budget")
    public ResponseEntity<BudgetDTO.Response> getBudget(
            @PathVariable Long planId,
            @AuthenticationPrincipal String email
    ) {
        BudgetDTO.Response response = budgetService.getBudget(planId, email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/budget-items/{itemId}")
    public ResponseEntity<BudgetDTO.ItemResponse> updateBudgetItem(
            @PathVariable Long itemId,
            @RequestBody BudgetDTO.UpdateItemRequest request,
            @AuthenticationPrincipal String email
    ) {
        BudgetDTO.ItemResponse response = budgetService.updateBudgetItem(itemId, request, email);
        return ResponseEntity.ok(response);
    }
}