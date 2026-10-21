package com.fudn.planora.controller;

import com.fudn.planora.dto.response.VendorAnalyticsResponse;
import com.fudn.planora.service.VendorAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/vendor/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
public class VendorAnalyticsController {

    private final VendorAnalyticsService vendorAnalyticsService;

    @GetMapping
    public ResponseEntity<VendorAnalyticsResponse> getAnalytics(
            @AuthenticationPrincipal String email
    ) {
        VendorAnalyticsResponse response = vendorAnalyticsService.getVendorAnalytics(email);
        return ResponseEntity.ok(response);
    }
}
