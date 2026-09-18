package com.fudn.planora.controller;

import com.fudn.planora.dto.request.OnboardingRequest;
import com.fudn.planora.dto.response.ActivePlanResponse;
import com.fudn.planora.dto.response.WeddingPlanResponse;
import com.fudn.planora.service.WeddingPlanService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wedding-plans")
@RequiredArgsConstructor
public class WeddingPlanController {

    private final WeddingPlanService planService;

    @PostMapping("/onboarding")
    public WeddingPlanResponse createOnboarding(@RequestBody @Valid OnboardingRequest request) {
        String email = getLoggedInUserEmail();
        return planService.createOnboardingPlan(email, request);
    }

    @GetMapping("/active")
    public ActivePlanResponse getActivePlan() {
        String email = getLoggedInUserEmail();
        return planService.getActivePlan(email);
    }

    private String getLoggedInUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("Người dùng chưa được xác thực");
    }
}