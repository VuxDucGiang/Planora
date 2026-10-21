package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.CreatePackageRequest;
import com.fudn.planora.dto.request.CreateVendorServiceRequest;
import com.fudn.planora.dto.response.PackageResponse;
import com.fudn.planora.dto.response.VendorServiceDetailResponse;
import com.fudn.planora.entity.ServiceCategorie;
import com.fudn.planora.entity.User;
import com.fudn.planora.entity.Vendor;
import com.fudn.planora.entity.VendorPackage;
import com.fudn.planora.entity.VendorService;
import com.fudn.planora.repository.ServiceCategorieRepository;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.repository.VendorPackageRepository;
import com.fudn.planora.repository.VendorRepository;
import com.fudn.planora.repository.VendorServiceRepository;
import com.fudn.planora.service.VendorServiceManagementService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorServiceManagementServiceImpl implements VendorServiceManagementService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final VendorServiceRepository vendorServiceRepository;
    private final VendorPackageRepository vendorPackageRepository;
    private final ServiceCategorieRepository serviceCategorieRepository;

    private Vendor getVendorByEmail(String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có email: " + email));

        return vendorRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Vendor newVendor = Vendor.builder()
                            .user(user)
                            .businessName(user.getFullname() != null ? user.getFullname() : "Thương hiệu cưới")
                            .description("")
                            .experienceYears(0)
                            .verified(false)
                            .ratingAverage(0.0)
                            .totalReviews(0)
                            .build();
                    return vendorRepository.save(newVendor);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorServiceDetailResponse> getMyServices(String email) {
        Vendor vendor = getVendorByEmail(email);
        List<VendorService> services = vendorServiceRepository.findByVendorIdOrderByCreatedAtDesc(vendor.getId());

        return services.stream()
                .map(this::mapToDetailResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public VendorServiceDetailResponse createService(String email, CreateVendorServiceRequest request) {
        Vendor vendor = getVendorByEmail(email);

        ServiceCategorie category = serviceCategorieRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Danh mục dịch vụ có ID: " + request.getCategoryId()));

        VendorService service = VendorService.builder()
                .vendor(vendor)
                .category(category)
                .serviceName(request.getServiceName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .priceFrom(request.getPriceFrom())
                .priceTo(request.getPriceTo())
                .active(request.getActive() != null ? request.getActive() : true)
                .packages(new ArrayList<>())
                .build();

        VendorService saved = vendorServiceRepository.save(service);
        return mapToDetailResponse(saved);
    }

    @Override
    @Transactional
    public VendorServiceDetailResponse updateService(String email, Long serviceId, CreateVendorServiceRequest request) {
        Vendor vendor = getVendorByEmail(email);

        VendorService service = vendorServiceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Dịch vụ có ID: " + serviceId));

        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa dịch vụ này!");
        }

        if (request.getCategoryId() != null) {
            ServiceCategorie category = serviceCategorieRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Danh mục dịch vụ có ID: " + request.getCategoryId()));
            service.setCategory(category);
        }

        service.setServiceName(request.getServiceName().trim());
        service.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        service.setPriceFrom(request.getPriceFrom());
        service.setPriceTo(request.getPriceTo());
        if (request.getActive() != null) {
            service.setActive(request.getActive());
        }

        VendorService updated = vendorServiceRepository.save(service);
        return mapToDetailResponse(updated);
    }

    @Override
    @Transactional
    public void deleteService(String email, Long serviceId) {
        Vendor vendor = getVendorByEmail(email);

        VendorService service = vendorServiceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Dịch vụ có ID: " + serviceId));

        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa dịch vụ này!");
        }

        vendorServiceRepository.delete(service);
    }

    @Override
    @Transactional
    public PackageResponse addPackage(String email, Long serviceId, CreatePackageRequest request) {
        Vendor vendor = getVendorByEmail(email);

        VendorService service = vendorServiceRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Dịch vụ có ID: " + serviceId));

        if (!service.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền thêm gói cho dịch vụ này!");
        }

        VendorPackage pkg = VendorPackage.builder()
                .vendorService(service)
                .packageName(request.getPackageName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .price(request.getPrice())
                .build();

        VendorPackage saved = vendorPackageRepository.save(pkg);
        return mapToPackageResponse(saved);
    }

    @Override
    @Transactional
    public PackageResponse updatePackage(String email, Long serviceId, Long packageId, CreatePackageRequest request) {
        Vendor vendor = getVendorByEmail(email);

        VendorPackage pkg = vendorPackageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Gói dịch vụ có ID: " + packageId));

        if (!pkg.getVendorService().getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa gói dịch vụ này!");
        }

        pkg.setPackageName(request.getPackageName().trim());
        pkg.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        pkg.setPrice(request.getPrice());

        VendorPackage updated = vendorPackageRepository.save(pkg);
        return mapToPackageResponse(updated);
    }

    @Override
    @Transactional
    public void deletePackage(String email, Long serviceId, Long packageId) {
        Vendor vendor = getVendorByEmail(email);

        VendorPackage pkg = vendorPackageRepository.findById(packageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Gói dịch vụ có ID: " + packageId));

        if (!pkg.getVendorService().getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa gói dịch vụ này!");
        }

        vendorPackageRepository.delete(pkg);
    }

    private VendorServiceDetailResponse mapToDetailResponse(VendorService service) {
        List<PackageResponse> packages = service.getPackages() != null
                ? service.getPackages().stream()
                .map(this::mapToPackageResponse)
                .collect(Collectors.toList())
                : new ArrayList<>();

        return VendorServiceDetailResponse.builder()
                .id(service.getId())
                .vendorId(service.getVendor().getId())
                .categoryId(service.getCategory() != null ? service.getCategory().getId() : null)
                .categoryName(service.getCategory() != null ? service.getCategory().getName() : null)
                .serviceName(service.getServiceName())
                .description(service.getDescription())
                .priceFrom(service.getPriceFrom())
                .priceTo(service.getPriceTo())
                .active(service.getActive())
                .packages(packages)
                .build();
    }

    private PackageResponse mapToPackageResponse(VendorPackage pkg) {
        return PackageResponse.builder()
                .id(pkg.getId())
                .packageName(pkg.getPackageName())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .build();
    }
}

