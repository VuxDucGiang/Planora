package com.fudn.planora.service;

import com.fudn.planora.dto.request.CreatePortfolioRequest;
import com.fudn.planora.dto.request.VendorProfileRequest;
import com.fudn.planora.dto.response.PortfolioResponse;
import com.fudn.planora.dto.response.VendorProfileResponse;

import java.util.List;

public interface VendorProfileService {

    VendorProfileResponse getMyProfile(String email);

    VendorProfileResponse updateMyProfile(String email, VendorProfileRequest request);

    List<PortfolioResponse> getMyPortfolios(String email);

    PortfolioResponse addPortfolioItem(String email, CreatePortfolioRequest request);

    void deletePortfolioItem(String email, Long portfolioId);
}
