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

    List<VendorDTO.VendorResponse> getShortlist(Long planId, String userEmail);

    void addToShortlist(Long planId, Long vendorId, String userEmail);

    void removeFromShortlist(Long planId, Long vendorId, String userEmail);

    List<VendorDTO.VendorMatchResponse> getMatches(Long planId, String userEmail);
}