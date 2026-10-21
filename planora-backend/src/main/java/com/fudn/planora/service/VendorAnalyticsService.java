package com.fudn.planora.service;

import com.fudn.planora.dto.response.VendorAnalyticsResponse;

public interface VendorAnalyticsService {

    VendorAnalyticsResponse getVendorAnalytics(String email);
}
