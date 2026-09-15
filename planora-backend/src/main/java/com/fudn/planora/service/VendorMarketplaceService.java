package com.fudn.planora.service;

import com.fudn.planora.dto.vendor.VendorDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.List;

public interface VendorMarketplaceService {
    Page<VendorDTO.VendorResponse> getVendors(
            String query,
            Long categoryId,
            String city,
            Long styleId,
            Double priceFrom,
            Double priceTo,
            Pageable pageable
    );

    VendorDTO.VendorDetailResponse getVendorDetail(Long vendorId);

    List<VendorDTO.VendorResponse> getShortlist(Long planId, Long currentUserId);

    void addToShortlist(Long planId, Long vendorId, Long currentUserId);

    void removeFromShortlist(Long planId, Long vendorId, Long currentUserId);

    List<VendorDTO.VendorMatchResponse> getMatches(Long planId, Long currentUserId);
}