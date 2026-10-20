package com.fudn.planora.service;

import com.fudn.planora.dto.response.admin.AdminFunnelResponse;
import com.fudn.planora.dto.response.admin.AdminSummaryResponse;
import com.fudn.planora.dto.response.admin.AIInsightResponse;
import com.fudn.planora.dto.response.admin.DormantAnalysisResponse;
import com.fudn.planora.dto.response.admin.UserActivityResponse;
import com.fudn.planora.dto.response.admin.UserJourneyResponse;
import com.fudn.planora.dto.request.admin.AdminSendEmailRequest;
import com.fudn.planora.dto.response.admin.AdminSendEmailResponse;
import com.fudn.planora.dto.response.admin.AdminUserSummaryResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface AdminDashboardService {

    AdminSummaryResponse getSummaryMetrics();

    AdminFunnelResponse getFunnelMetrics();

    Page<UserActivityResponse> getRecentActivities(Pageable pageable);

    UserJourneyResponse getUserJourney(Long userId);

    AIInsightResponse getAIInsights();

    DormantAnalysisResponse getDormantAnalysis();

    List<AdminUserSummaryResponse> getAllAppUsers(String search, String role, String status);

    AdminSendEmailResponse sendEmailToUsers(AdminSendEmailRequest request);
}
