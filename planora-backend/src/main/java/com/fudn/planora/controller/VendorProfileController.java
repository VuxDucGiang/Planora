package com.fudn.planora.controller;

import com.fudn.planora.dto.request.AddCollectionImageRequest;
import com.fudn.planora.dto.request.CreateCollectionRequest;
import com.fudn.planora.dto.request.CreatePortfolioRequest;
import com.fudn.planora.dto.request.UpdateCollectionRequest;
import com.fudn.planora.dto.request.VendorProfileRequest;
import com.fudn.planora.dto.response.CollectionImageResponse;
import com.fudn.planora.dto.response.CollectionResponse;
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

    @PatchMapping("/avatar")
    public ResponseEntity<VendorProfileResponse> updateAvatar(
            @AuthenticationPrincipal String email,
            @RequestBody Map<String, String> body
    ) {
        String avatarUrl = body != null ? body.get("avatarUrl") : null;
        VendorProfileResponse response = vendorProfileService.updateAvatar(email, avatarUrl);
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

    // ==========================================
    // MULTI-ALBUM COLLECTION ENDPOINTS
    // ==========================================

    @GetMapping("/collections")
    public ResponseEntity<List<CollectionResponse>> getMyCollections(
            @AuthenticationPrincipal String email
    ) {
        List<CollectionResponse> collections = vendorProfileService.getMyCollections(email);
        return ResponseEntity.ok(collections);
    }

    @GetMapping("/collections/{collectionId}")
    public ResponseEntity<CollectionResponse> getMyCollectionDetail(
            @AuthenticationPrincipal String email,
            @PathVariable Long collectionId
    ) {
        CollectionResponse response = vendorProfileService.getMyCollectionDetail(email, collectionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/collections")
    public ResponseEntity<CollectionResponse> createCollection(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody CreateCollectionRequest request
    ) {
        CollectionResponse response = vendorProfileService.createCollection(email, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/collections/{collectionId}")
    public ResponseEntity<CollectionResponse> updateCollection(
            @AuthenticationPrincipal String email,
            @PathVariable Long collectionId,
            @Valid @RequestBody UpdateCollectionRequest request
    ) {
        CollectionResponse response = vendorProfileService.updateCollection(email, collectionId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/collections/{collectionId}")
    public ResponseEntity<Map<String, String>> deleteCollection(
            @AuthenticationPrincipal String email,
            @PathVariable Long collectionId
    ) {
        vendorProfileService.deleteCollection(email, collectionId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa toàn bộ bộ sưu tập và các ảnh liên quan thành công!"));
    }

    @PostMapping("/collections/{collectionId}/images")
    public ResponseEntity<CollectionImageResponse> addImageToCollection(
            @AuthenticationPrincipal String email,
            @PathVariable Long collectionId,
            @Valid @RequestBody AddCollectionImageRequest request
    ) {
        CollectionImageResponse response = vendorProfileService.addImageToCollection(email, collectionId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/collections/{collectionId}/images/{imageId}")
    public ResponseEntity<Map<String, String>> deleteImageFromCollection(
            @AuthenticationPrincipal String email,
            @PathVariable Long collectionId,
            @PathVariable Long imageId
    ) {
        vendorProfileService.deleteImageFromCollection(email, collectionId, imageId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa ảnh khỏi bộ sưu tập thành công!"));
    }
}
