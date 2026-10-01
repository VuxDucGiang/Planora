package com.fudn.planora.controller;

import com.fudn.planora.dto.request.CreateReviewRequest;
import com.fudn.planora.dto.response.*;
import com.fudn.planora.entity.User;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.service.VendorMarketplaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class VendorMarketplaceController {

    private final VendorMarketplaceService marketplaceService;
    private final UserRepository userRepository;

    @GetMapping("/vendors")
    public ResponseEntity<Page<VendorResponse>> getVendors(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long styleId,
            @RequestParam(required = false) BigDecimal priceFrom,
            @RequestParam(required = false) BigDecimal priceTo,
            Pageable pageable
    ) {
        Page<VendorResponse> response = marketplaceService.getVendors(
                query, categoryId, city, styleId, priceFrom, priceTo, pageable
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vendors/featured")
    public ResponseEntity<List<VendorResponse>> getFeaturedVendors() {
        return ResponseEntity.ok(marketplaceService.getFeaturedVendors());
    }

    @GetMapping("/vendors/compare")
    public ResponseEntity<VendorCompareResponse> compareVendors(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(marketplaceService.compareVendors(ids));
    }

    @GetMapping("/vendors/{vendorId}")
    public ResponseEntity<VendorDetailResponse> getVendorDetail(@PathVariable Long vendorId) {
        VendorDetailResponse response = marketplaceService.getVendorDetail(vendorId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vendors/{vendorId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getVendorReviews(
            @PathVariable Long vendorId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(marketplaceService.getVendorReviews(vendorId, pageable));
    }

    @PostMapping("/vendors/{vendorId}/reviews")
    public ResponseEntity<Void> addVendorReview(
            @PathVariable Long vendorId,
            @Valid @RequestBody CreateReviewRequest request,
            @AuthenticationPrincipal String email
    ) {
        Long userId = getUserIdByEmail(email);
        marketplaceService.addVendorReview(vendorId, request, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/wedding-plans/{planId}/shortlist")
    public ResponseEntity<List<VendorResponse>> getShortlist(
            @PathVariable Long planId,
            @AuthenticationPrincipal String email
    ) {
        Long userId = getUserIdByEmail(email);
        List<VendorResponse> response = marketplaceService.getShortlist(planId, userId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/wedding-plans/{planId}/shortlist")
    public ResponseEntity<Void> addToShortlist(
            @PathVariable Long planId,
            @RequestParam Long vendorId,
            @AuthenticationPrincipal String email
    ) {
        Long userId = getUserIdByEmail(email);
        marketplaceService.addToShortlist(planId, vendorId, userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/wedding-plans/{planId}/shortlist/{vendorId}")
    public ResponseEntity<Void> removeFromShortlist(
            @PathVariable Long planId,
            @PathVariable Long vendorId,
            @AuthenticationPrincipal String email
    ) {
        Long userId = getUserIdByEmail(email);
        marketplaceService.removeFromShortlist(planId, vendorId, userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/wedding-plans/{planId}/matches")
    public ResponseEntity<List<VendorMatchResponse>> getMatches(
            @PathVariable Long planId,
            @AuthenticationPrincipal String email
    ) {
        Long userId = getUserIdByEmail(email);
        List<VendorMatchResponse> response = marketplaceService.getMatches(planId, userId);
        return ResponseEntity.ok(response);
    }

    private Long getUserIdByEmail(String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có email: " + email));
        return user.getId();
    }
}
