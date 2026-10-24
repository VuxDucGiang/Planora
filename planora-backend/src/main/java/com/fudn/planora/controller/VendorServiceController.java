package com.fudn.planora.controller;

import com.fudn.planora.dto.request.CreatePackageRequest;
import com.fudn.planora.dto.request.CreateVendorServiceRequest;
import com.fudn.planora.dto.response.PackageResponse;
import com.fudn.planora.dto.response.VendorServiceDetailResponse;
import com.fudn.planora.service.VendorServiceManagementService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor/services")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
public class VendorServiceController {

    private final VendorServiceManagementService serviceManagement;

    @GetMapping
    public ResponseEntity<List<VendorServiceDetailResponse>> getMyServices(
            @AuthenticationPrincipal String email
    ) {
        List<VendorServiceDetailResponse> response = serviceManagement.getMyServices(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<VendorServiceDetailResponse> createService(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody CreateVendorServiceRequest request
    ) {
        VendorServiceDetailResponse response = serviceManagement.createService(email, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{serviceId}")
    public ResponseEntity<VendorServiceDetailResponse> updateService(
            @AuthenticationPrincipal String email,
            @PathVariable Long serviceId,
            @Valid @RequestBody CreateVendorServiceRequest request
    ) {
        VendorServiceDetailResponse response = serviceManagement.updateService(email, serviceId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{serviceId}")
    public ResponseEntity<Map<String, String>> deleteService(
            @AuthenticationPrincipal String email,
            @PathVariable Long serviceId
    ) {
        serviceManagement.deleteService(email, serviceId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa dịch vụ thành công!"));
    }

    @PostMapping("/{serviceId}/packages")
    public ResponseEntity<PackageResponse> addPackage(
            @AuthenticationPrincipal String email,
            @PathVariable Long serviceId,
            @Valid @RequestBody CreatePackageRequest request
    ) {
        PackageResponse response = serviceManagement.addPackage(email, serviceId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{serviceId}/packages/{packageId}")
    public ResponseEntity<PackageResponse> updatePackage(
            @AuthenticationPrincipal String email,
            @PathVariable Long serviceId,
            @PathVariable Long packageId,
            @Valid @RequestBody CreatePackageRequest request
    ) {
        PackageResponse response = serviceManagement.updatePackage(email, serviceId, packageId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{serviceId}/packages/{packageId}")
    public ResponseEntity<Map<String, String>> deletePackage(
            @AuthenticationPrincipal String email,
            @PathVariable Long serviceId,
            @PathVariable Long packageId
    ) {
        serviceManagement.deletePackage(email, serviceId, packageId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa gói dịch vụ thành công!"));
    }
}

