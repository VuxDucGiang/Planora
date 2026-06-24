package com.fudn.planora.service;

import com.fudn.planora.dto.request.OnboardingRequest;
import com.fudn.planora.dto.response.ActivePlanResponse;
import com.fudn.planora.dto.response.WeddingPlanResponse;

public interface WeddingPlanService {
    WeddingPlanResponse createOnboardingPlan(String userEmail, OnboardingRequest request);
    ActivePlanResponse getActivePlan(String userEmail);
}