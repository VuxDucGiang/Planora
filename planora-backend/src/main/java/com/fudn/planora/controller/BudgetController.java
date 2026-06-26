package com.fudn.planora.controller;

import com.fudn.planora.dto.request.UpdateBudgetItemRequest;
import com.fudn.planora.dto.response.BudgetItemResponse;
import com.fudn.planora.dto.response.BudgetResponse;
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
    public ResponseEntity<BudgetResponse> getBudget(
            @PathVariable Long planId,
            @AuthenticationPrincipal String email
    ) {
        BudgetResponse response = budgetService.getBudget(planId, email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/budget-items/{itemId}")
    public ResponseEntity<BudgetItemResponse> updateBudgetItem(
            @PathVariable Long itemId,
            @RequestBody UpdateBudgetItemRequest request,
            @AuthenticationPrincipal String email
    ) {
        BudgetItemResponse response = budgetService.updateBudgetItem(itemId, request, email);
        return ResponseEntity.ok(response);
    }
}