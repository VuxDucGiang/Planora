package com.fudn.planora.controller;

import com.fudn.planora.dto.response.admin.AdminFunnelResponse;
import com.fudn.planora.dto.response.admin.AdminSummaryResponse;
import com.fudn.planora.dto.response.admin.UserActivityResponse;
import com.fudn.planora.dto.response.admin.UserJourneyResponse;
import com.fudn.planora.service.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.fudn.planora.dto.request.admin.AdminSendEmailRequest;
import com.fudn.planora.dto.response.admin.AdminSendEmailResponse;
import com.fudn.planora.dto.response.admin.AdminUserSummaryResponse;
import jakarta.validation.Valid;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/admin/dashboard", "/api/admin/dashboard"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/summary")
    public ResponseEntity<AdminSummaryResponse> getSummary() {
        return ResponseEntity.ok(adminDashboardService.getSummaryMetrics());
    }

    @GetMapping("/funnel")
    public ResponseEntity<AdminFunnelResponse> getFunnel() {
        return ResponseEntity.ok(adminDashboardService.getFunnelMetrics());
    }

    @GetMapping("/activities")
    public ResponseEntity<Page<UserActivityResponse>> getActivities(
            @PageableDefault(size = 20, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(adminDashboardService.getRecentActivities(pageable));
    }

    @GetMapping("/users/{userId}/journey")
    public ResponseEntity<UserJourneyResponse> getUserJourney(@PathVariable Long userId) {
        return ResponseEntity.ok(adminDashboardService.getUserJourney(userId));
    }

    @GetMapping("/ai-insights")
    public ResponseEntity<com.fudn.planora.dto.response.admin.AIInsightResponse> getAIInsights() {
        return ResponseEntity.ok(adminDashboardService.getAIInsights());
    }

    @GetMapping("/dormant-users")
    public ResponseEntity<com.fudn.planora.dto.response.admin.DormantAnalysisResponse> getDormantAnalysis() {
        return ResponseEntity.ok(adminDashboardService.getDormantAnalysis());
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserSummaryResponse>> getAppUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminDashboardService.getAllAppUsers(search, role, status));
    }

    @PostMapping("/send-email")
    public ResponseEntity<AdminSendEmailResponse> sendEmail(
            @Valid @RequestBody AdminSendEmailRequest request) {
        return ResponseEntity.ok(adminDashboardService.sendEmailToUsers(request));
    }
}

