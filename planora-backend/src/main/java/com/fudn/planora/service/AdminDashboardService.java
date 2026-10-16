package com.fudn.planora.service;

import com.fudn.planora.dto.response.admin.AdminFunnelResponse;
import com.fudn.planora.dto.response.admin.AdminSummaryResponse;
import com.fudn.planora.dto.response.admin.AIInsightResponse;
import com.fudn.planora.dto.response.admin.DormantAnalysisResponse;
import com.fudn.planora.dto.response.admin.UserActivityResponse;
import com.fudn.planora.dto.response.admin.UserJourneyResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminDashboardService {

    AdminSummaryResponse getSummaryMetrics();

    AdminFunnelResponse getFunnelMetrics();

    Page<UserActivityResponse> getRecentActivities(Pageable pageable);

    UserJourneyResponse getUserJourney(Long userId);

    AIInsightResponse getAIInsights();

    DormantAnalysisResponse getDormantAnalysis();
}
