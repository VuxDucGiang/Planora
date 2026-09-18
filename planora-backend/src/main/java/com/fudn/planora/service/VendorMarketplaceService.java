package com.fudn.planora.service;

import com.fudn.planora.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface VendorMarketplaceService {
    Page<VendorResponse> getVendors(
            String query,
            Long categoryId,
            String city,
            Long styleId,
            Double priceFrom,
            Double priceTo,
            Pageable pageable
    );

    VendorDetailResponse getVendorDetail(Long vendorId);

    List<VendorResponse> getShortlist(Long planId, Long currentUserId);

    void addToShortlist(Long planId, Long vendorId, Long currentUserId);

    void removeFromShortlist(Long planId, Long vendorId, Long currentUserId);

    List<VendorMatchResponse> getMatches(Long planId, Long currentUserId);
}