package com.fudn.planora.controller;

import com.fudn.planora.dto.wedding.WeddingDTO;
import com.fudn.planora.service.WeddingPlanService;
import com.fudn.planora.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wedding-plans")
@RequiredArgsConstructor
@Tag(name = "Wedding Plan", description = "Quản lý kế hoạch cưới và quá trình onboarding")
@SecurityRequirement(name = "bearerAuth")
public class WeddingPlanController {

    private final WeddingPlanService planService;

    @Operation(summary = "Khởi tạo kế hoạch cưới qua luồng onboarding", responses = {
            @ApiResponse(responseCode = "201", description = "Tạo kế hoạch cưới thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu onboarding không hợp lệ")
    })
    @PostMapping("/onboarding")
    public ResponseEntity<WeddingDTO.PlanResponse> createOnboarding(@RequestBody @Valid WeddingDTO.OnboardingRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        WeddingDTO.PlanResponse response = planService.createOnboardingPlan(email, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Lấy kế hoạch cưới đang kích hoạt của người dùng hiện tại", responses = {
            @ApiResponse(responseCode = "200", description = "Lấy kế hoạch thành công"),
            @ApiResponse(responseCode = "404", description = "Chưa có kế hoạch cưới nào đang kích hoạt")
    })
    @GetMapping("/active")
    public ResponseEntity<WeddingDTO.ActivePlanResponse> getActivePlan() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(planService.getActivePlan(email));
    }
}