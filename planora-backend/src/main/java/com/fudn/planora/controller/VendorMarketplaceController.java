package com.fudn.planora.controller;

import com.fudn.planora.dto.vendor.VendorDTO;
import com.fudn.planora.service.VendorMarketplaceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Vendor Marketplace", description = "Tìm kiếm nhà cung cấp dịch vụ cưới, quản lý Shortlist và Smart Match")
public class VendorMarketplaceController {

    private final VendorMarketplaceService marketplaceService;

    @Operation(summary = "Tìm kiếm và lọc danh sách nhà cung cấp", responses = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách nhà cung cấp thành công")
    })
    @GetMapping("/vendors")
    public ResponseEntity<Page<VendorDTO.VendorResponse>> getVendors(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long styleId,
            @RequestParam(required = false) Double priceFrom,
            @RequestParam(required = false) Double priceTo,
            Pageable pageable
    ) {
        Page<VendorDTO.VendorResponse> response = marketplaceService.getVendors(
                query, categoryId, city, styleId, priceFrom, priceTo, pageable
        );
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy chi tiết thông tin nhà cung cấp dịch vụ", responses = {
            @ApiResponse(responseCode = "200", description = "Lấy chi tiết thành công"),
            @ApiResponse(responseCode = "404", description = "Không tìm thấy nhà cung cấp")
    })
    @GetMapping("/vendors/{vendorId}")
    public ResponseEntity<VendorDTO.VendorDetailResponse> getVendorDetail(@PathVariable Long vendorId) {
        VendorDTO.VendorDetailResponse response = marketplaceService.getVendorDetail(vendorId);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Lấy danh sách nhà cung cấp yêu thích (Shortlist) của kế hoạch cưới")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/wedding-plans/{planId}/shortlist")
    public ResponseEntity<List<VendorDTO.VendorResponse>> getShortlist(
            @PathVariable Long planId,
            @AuthenticationPrincipal String email
    ) {
        List<VendorDTO.VendorResponse> response = marketplaceService.getShortlist(planId, email);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Thêm nhà cung cấp vào danh sách yêu thích (Shortlist)")
    @SecurityRequirement(name = "bearerAuth")
    @PostMapping("/wedding-plans/{planId}/shortlist")
    public ResponseEntity<Void> addToShortlist(
            @PathVariable Long planId,
            @RequestParam Long vendorId,
            @AuthenticationPrincipal String email
    ) {
        marketplaceService.addToShortlist(planId, vendorId, email);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Xóa nhà cung cấp khỏi danh sách yêu thích (Shortlist)")
    @SecurityRequirement(name = "bearerAuth")
    @DeleteMapping("/wedding-plans/{planId}/shortlist/{vendorId}")
    public ResponseEntity<Void> removeFromShortlist(
            @PathVariable Long planId,
            @PathVariable Long vendorId,
            @AuthenticationPrincipal String email
    ) {
        marketplaceService.removeFromShortlist(planId, vendorId, email);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "Lấy danh sách gợi ý nhà cung cấp phù hợp (Smart Matches)")
    @SecurityRequirement(name = "bearerAuth")
    @GetMapping("/wedding-plans/{planId}/matches")
    public ResponseEntity<List<VendorDTO.VendorMatchResponse>> getMatches(
            @PathVariable Long planId,
            @AuthenticationPrincipal String email
    ) {
        List<VendorDTO.VendorMatchResponse> response = marketplaceService.getMatches(planId, email);
        return ResponseEntity.ok(response);
    }
}

