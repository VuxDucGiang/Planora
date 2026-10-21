package com.fudn.planora.service;

import com.fudn.planora.dto.request.CreatePackageRequest;
import com.fudn.planora.dto.request.CreateVendorServiceRequest;
import com.fudn.planora.dto.response.PackageResponse;
import com.fudn.planora.dto.response.VendorServiceDetailResponse;

import java.util.List;

public interface VendorServiceManagementService {

    List<VendorServiceDetailResponse> getMyServices(String email);

    VendorServiceDetailResponse createService(String email, CreateVendorServiceRequest request);

    VendorServiceDetailResponse updateService(String email, Long serviceId, CreateVendorServiceRequest request);

    void deleteService(String email, Long serviceId);

    PackageResponse addPackage(String email, Long serviceId, CreatePackageRequest request);

    PackageResponse updatePackage(String email, Long serviceId, Long packageId, CreatePackageRequest request);

    void deletePackage(String email, Long serviceId, Long packageId);
}

