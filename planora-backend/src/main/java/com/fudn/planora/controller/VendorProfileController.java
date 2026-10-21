package com.fudn.planora.controller;

import com.fudn.planora.dto.request.CreatePortfolioRequest;
import com.fudn.planora.dto.request.VendorProfileRequest;
import com.fudn.planora.dto.response.PortfolioResponse;
import com.fudn.planora.dto.response.VendorProfileResponse;
import com.fudn.planora.service.VendorProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
public class VendorProfileController {

    private final VendorProfileService vendorProfileService;

    @GetMapping("/profile")
    public ResponseEntity<VendorProfileResponse> getMyProfile(
            @AuthenticationPrincipal String email
    ) {
        VendorProfileResponse response = vendorProfileService.getMyProfile(email);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/profile")
    public ResponseEntity<VendorProfileResponse> updateMyProfile(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody VendorProfileRequest request
    ) {
        VendorProfileResponse response = vendorProfileService.updateMyProfile(email, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/portfolios")
    public ResponseEntity<List<PortfolioResponse>> getMyPortfolios(
            @AuthenticationPrincipal String email
    ) {
        List<PortfolioResponse> portfolios = vendorProfileService.getMyPortfolios(email);
        return ResponseEntity.ok(portfolios);
    }

    @PostMapping("/portfolios")
    public ResponseEntity<PortfolioResponse> addPortfolioItem(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody CreatePortfolioRequest request
    ) {
        PortfolioResponse response = vendorProfileService.addPortfolioItem(email, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/portfolios/{portfolioId}")
    public ResponseEntity<Map<String, String>> deletePortfolioItem(
            @AuthenticationPrincipal String email,
            @PathVariable Long portfolioId
    ) {
        vendorProfileService.deletePortfolioItem(email, portfolioId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa tác phẩm khỏi bộ sưu tập thành công!"));
    }
}
