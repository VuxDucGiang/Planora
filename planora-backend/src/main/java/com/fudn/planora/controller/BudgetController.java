package com.fudn.planora.controller;

import com.fudn.planora.dto.budget.BudgetDTO;
import com.fudn.planora.service.BudgetService;
import com.fudn.planora.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Budget Management", description = "Quản lý ngân sách và các khoản chi cho đám cưới")
@SecurityRequirement(name = "bearerAuth")
public class BudgetController {

    private final BudgetService budgetService;

    @Operation(summary = "Lấy thông tin tổng ngân sách và các hạng mục chi tiêu", responses = {
            @ApiResponse(responseCode = "200", description = "Lấy thông tin ngân sách thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy kế hoạch cưới")
    })
    @GetMapping("/wedding-plans/{planId}/budget")
    public ResponseEntity<BudgetDTO.Response> getBudget(
            @PathVariable Long planId,
            @AuthenticationPrincipal String email
    ) {
        String userEmail = email != null ? email : SecurityUtils.getCurrentUserEmail();
        BudgetDTO.Response response = budgetService.getBudget(planId, userEmail);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Cập nhật khoản chi trong ngân sách", responses = {
            @ApiResponse(responseCode = "200", description = "Cập nhật khoản chi thành công")
    })
    @PutMapping("/budget-items/{itemId}")
    public ResponseEntity<BudgetDTO.ItemResponse> updateBudgetItem(
            @PathVariable Long itemId,
            @RequestBody @Valid BudgetDTO.UpdateItemRequest request,
            @AuthenticationPrincipal String email
    ) {
        String userEmail = email != null ? email : SecurityUtils.getCurrentUserEmail();
        BudgetDTO.ItemResponse response = budgetService.updateBudgetItem(itemId, request, userEmail);
        return ResponseEntity.ok(response);
    }
}