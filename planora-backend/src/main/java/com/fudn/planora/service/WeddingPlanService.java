package com.fudn.planora.service;

import com.fudn.planora.dto.wedding.WeddingDTO;

public interface WeddingPlanService {
    WeddingDTO.PlanResponse createOnboardingPlan(String userEmail, WeddingDTO.OnboardingRequest request);
    WeddingDTO.ActivePlanResponse getActivePlan(String userEmail);
}