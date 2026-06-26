# Hướng dẫn Xây dựng API - Module 5: Vendor Marketplace & Shortlist

Tài liệu này hướng dẫn chi tiết từng bước (kèm code mẫu chuẩn Spring Boot) để bạn tự tay xây dựng cụm API cho **Module 5 (Tìm kiếm, phân lọc Nhà cung cấp dịch vụ cưới và danh sách yêu thích Shortlist)** trong dự án Planora.

---

## 1. Các bước thực hiện tổng quan
1.  **Bước 1:** Khai báo đầy đủ JPA Entities (`VendorService`, `VendorPortfolio`, `VendorPackage`, `VendorShortlist`) và cập nhật liên kết trong `Vendor.java`.
2.  **Bước 2:** Cập nhật Repository Layer (`VendorRepository`, `VendorShortlistRepository`, `VendorMatchesRepository`).
3.  **Bước 3:** Tạo các lớp truyền dữ liệu (DTO - Data Transfer Object) cho Response và Request.
4.  **Bước 4:** Xây dựng tầng Service (`VendorMarketplaceService` và class Implementation tương ứng).
5.  **Bước 5:** Viết REST Controllers (`VendorController` và `ShortlistController`).
6.  **Bước 6:** Hướng dẫn Test API chi tiết bằng Postman.

---

## BƯỚC 1: Khai báo đầy đủ JPA Entities

Trước tiên, chúng ta cần hoàn thiện các thực thể đang ở dạng rỗng (stub classes) trong thư mục `entity/` để ánh xạ chính xác với các bảng trong `V1__init_schema.sql`.

### 1.1. Cập nhật [Vendor.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/Vendor.java)
Mở tệp [Vendor.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/Vendor.java) và thêm các mối quan hệ `@ManyToMany` với phong cách cưới (`weddingStyles`) cùng các danh sách liên quan để phục vụ việc truy vấn:

```java
    // Thêm các import cần thiết ở đầu file:
    // import java.util.Set;
    // import java.util.List;

    @ManyToMany
    @JoinTable(
        name = "vendor_styles",
        joinColumns = @JoinColumn(name = "vendor_id"),
        inverseJoinColumns = @JoinColumn(name = "wedding_style_id")
    )
    private java.util.Set<WeddingStyle> weddingStyles;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<VendorService> services;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private java.util.List<VendorPortfolio> portfolios;
```

### 1.2. Khai báo thực thể [VendorService.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorService.java)
Mở tệp [VendorService.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorService.java) và hoàn thiện như sau:

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "vendor_services")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorService {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private ServiceCategorie category;

    @Column(name = "service_name", nullable = false)
    private String serviceName;

    private String description;

    @Column(name = "price_from")
    private BigDecimal priceFrom;

    @Column(name = "price_to")
    private BigDecimal priceTo;

    @Builder.Default
    private Boolean active = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "vendorService", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VendorPackage> packages;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (active == null) active = true;
    }
}
```

### 1.3. Khai báo thực thể [VendorPortfolio.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorPortfolio.java)
Mở tệp [VendorPortfolio.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorPortfolio.java) và hoàn thiện:

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_portfolios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorPortfolio {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    private String title;
    
    private String description;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 1.4. Khai báo thực thể [VendorPackage.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorPackage.java)
Mở tệp [VendorPackage.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorPackage.java) và hoàn thiện:

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_packages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorPackage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_service_id", nullable = false)
    private VendorService vendorService;

    @Column(name = "package_name", nullable = false)
    private String packageName;

    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 1.5. Khai báo thực thể [VendorShortlist.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorShortlist.java)
Mở tệp [VendorShortlist.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorShortlist.java) và hoàn thiện:

```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_shortlists")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorShortlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_plan_id", nullable = false)
    private WeddingPlan weddingPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

---

## BƯỚC 2: Cập nhật Repository Layer

Tạo mới các interface Repository trong thư mục `repository/` để làm việc với DB.

### 2.1. Cập nhật [VendorRepository.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/VendorRepository.java)
Định nghĩa phương thức tìm kiếm nâng cao với nhiều tiêu chí kết hợp phân trang (sử dụng JPQL linh hoạt):

```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    @Query("SELECT DISTINCT v FROM Vendor v " +
           "LEFT JOIN v.weddingStyles s " +
           "LEFT JOIN VendorService vs ON vs.vendor.id = v.id " +
           "WHERE (:query IS NULL OR LOWER(v.businessName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (:categoryId IS NULL OR vs.category.id = :categoryId) " +
           "AND (:city IS NULL OR LOWER(v.city) = LOWER(:city)) " +
           "AND (:styleId IS NULL OR s.id = :styleId) " +
           "AND (:priceFrom IS NULL OR vs.priceTo >= :priceFrom) " +
           "AND (:priceTo IS NULL OR vs.priceFrom <= :priceTo) " +
           "AND (vs.active = true OR vs.active IS NULL)")
    Page<Vendor> filterVendors(
        @Param("query") String query,
        @Param("categoryId") Long categoryId,
        @Param("city") String city,
        @Param("styleId") Long styleId,
        @Param("priceFrom") Double priceFrom,
        @Param("priceTo") Double priceTo,
        Pageable pageable
    );
}
```

### 2.2. Tạo mới [VendorShortlistRepository.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/VendorShortlistRepository.java)
```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorShortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VendorShortlistRepository extends JpaRepository<VendorShortlist, Long> {
    List<VendorShortlist> findByWeddingPlanId(Long weddingPlanId);
    Optional<VendorShortlist> findByWeddingPlanIdAndVendorId(Long weddingPlanId, Long vendorId);
    boolean existsByWeddingPlanIdAndVendorId(Long weddingPlanId, Long vendorId);
}
```

### 2.3. Tạo mới [VendorMatchesRepository.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/VendorMatchesRepository.java)
```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorMatches;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VendorMatchesRepository extends JpaRepository<VendorMatches, Long> {
    List<VendorMatches> findByWeddingPlanIdOrderByMatchingScoreDesc(Long weddingPlanId);
}
```

---

## BƯỚC 3: Tạo các lớp DTO (Data Transfer Object)

Tạo mới các response DTO trong thư mục `dto/response/` để trả dữ liệu tối ưu nhất về Client.

### 3.1. DTO `PortfolioResponse.java`
Tạo mới file `PortfolioResponse.java` trong thư mục [dto/response/](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response):
```java
package com.fudn.planora.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PortfolioResponse {
    private Long id;
    private String imageUrl;
    private String title;
    private String description;
}
```

### 3.2. DTO `PackageResponse.java`
Tạo mới file `PackageResponse.java` trong thư mục [dto/response/](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response):
```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PackageResponse {
    private Long id;
    private String packageName;
    private String description;
    private BigDecimal price;
}
```

### 3.3. DTO `VendorResponse.java` (Sử dụng hiển thị ở danh sách Marketplace)
Tạo mới file `VendorResponse.java` trong thư mục [dto/response/](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response):
```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorResponse {
    private Long id;
    private String businessName;
    private String description;
    private Integer experienceYears;
    private String city;
    private String district;
    private Boolean verified;
    private Double ratingAverage;
    private Integer totalReviews;
    private Set<String> styles;
}
```

### 3.4. DTO `VendorDetailResponse.java` (Chi tiết thông tin có Portfolio & Packages)
Tạo mới file `VendorDetailResponse.java` trong thư mục [dto/response/](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response):
```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.util.List;
import java.util.Set;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorDetailResponse {
    private Long id;
    private String businessName;
    private String description;
    private Integer experienceYears;
    private String city;
    private String district;
    private Boolean verified;
    private Double ratingAverage;
    private Integer totalReviews;
    private Set<String> styles;
    
    private List<PortfolioResponse> portfolios;
    private List<PackageResponse> packages;
}
```

### 3.5. DTO `VendorMatchResponse.java` (Gợi ý Vendor phù hợp với Kế hoạch cưới)
Tạo mới file `VendorMatchResponse.java` trong thư mục [dto/response/](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response):
```java
package com.fudn.planora.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorMatchResponse {
    private Long id;
    private VendorResponse vendor;
    private Double matchingScore;
    private String reason;
}
```

---

## BƯỚC 4: Xây dựng Tầng Service Layer

### 4.1. Định nghĩa [VendorMarketplaceService.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/VendorMarketplaceService.java)
Tạo interface trong thư mục `service/`:

```java
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
```

### 4.2. Triển khai [VendorMarketplaceServiceImpl.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/impl/VendorMarketplaceServiceImpl.java)
Tạo class implementation trong thư mục `service/impl/`:

```java
package com.fudn.planora.service.impl;

import com.fudn.planora.dto.response.*;
import com.fudn.planora.entity.*;
import com.fudn.planora.repository.*;
import com.fudn.planora.service.VendorMarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VendorMarketplaceServiceImpl implements VendorMarketplaceService {

    private final VendorRepository vendorRepository;
    private final VendorShortlistRepository shortlistRepository;
    private final VendorMatchesRepository matchesRepository;
    private final WeddingPlanRepository weddingPlanRepository;

    @Override
    public Page<VendorResponse> getVendors(
        String query, Long categoryId, String city, 
        Long styleId, Double priceFrom, Double priceTo, Pageable pageable
    ) {
        Page<Vendor> vendors = vendorRepository.filterVendors(
            query, categoryId, city, styleId, priceFrom, priceTo, pageable
        );
        return vendors.map(this::mapToVendorResponse);
    }

    @Override
    public VendorDetailResponse getVendorDetail(Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp có ID: " + vendorId));

        List<PortfolioResponse> portfolios = vendor.getPortfolios().stream()
            .map(p -> PortfolioResponse.builder()
                .id(p.getId())
                .imageUrl(p.getImageUrl())
                .title(p.getTitle())
                .description(p.getDescription())
                .build())
            .collect(Collectors.toList());

        List<PackageResponse> packages = vendor.getServices().stream()
            .flatMap(s -> s.getPackages().stream())
            .map(pkg -> PackageResponse.builder()
                .id(pkg.getId())
                .packageName(pkg.getPackageName())
                .description(pkg.getDescription())
                .price(pkg.getPrice())
                .build())
            .collect(Collectors.toList());

        Set<String> styles = vendor.getWeddingStyles().stream()
            .map(WeddingStyle::getName)
            .collect(Collectors.toSet());

        return VendorDetailResponse.builder()
            .id(vendor.getId())
            .businessName(vendor.getBusinessName())
            .description(vendor.getDescription())
            .experienceYears(vendor.getExperienceYears())
            .city(vendor.getCity())
            .district(vendor.getDistrict())
            .verified(vendor.getVerified())
            .ratingAverage(vendor.getRatingAverage())
            .totalReviews(vendor.getTotalReviews())
            .styles(styles)
            .portfolios(portfolios)
            .packages(packages)
            .build();
    }

    @Override
    public List<VendorResponse> getShortlist(Long planId, Long currentUserId) {
        validateWeddingPlanOwner(planId, currentUserId);
        return shortlistRepository.findByWeddingPlanId(planId).stream()
            .map(shortlist -> mapToVendorResponse(shortlist.getVendor()))
            .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addToShortlist(Long planId, Long vendorId, Long currentUserId) {
        WeddingPlan plan = validateWeddingPlanOwner(planId, currentUserId);
        Vendor vendor = vendorRepository.findById(vendorId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp"));

        if (shortlistRepository.existsByWeddingPlanIdAndVendorId(planId, vendorId)) {
            throw new RuntimeException("Nhà cung cấp này đã nằm trong danh sách yêu thích");
        }

        VendorShortlist shortlist = VendorShortlist.builder()
            .weddingPlan(plan)
            .vendor(vendor)
            .build();

        shortlistRepository.save(shortlist);
    }

    @Override
    @Transactional
    public void removeFromShortlist(Long planId, Long vendorId, Long currentUserId) {
        validateWeddingPlanOwner(planId, currentUserId);
        VendorShortlist shortlist = shortlistRepository.findByWeddingPlanIdAndVendorId(planId, vendorId)
            .orElseThrow(() -> new RuntimeException("Nhà cung cấp không nằm trong danh sách yêu thích"));

        shortlistRepository.delete(shortlist);
    }

    @Override
    public List<VendorMatchResponse> getMatches(Long planId, Long currentUserId) {
        validateWeddingPlanOwner(planId, currentUserId);
        return matchesRepository.findByWeddingPlanIdOrderByMatchingScoreDesc(planId).stream()
            .map(match -> VendorMatchResponse.builder()
                .id(match.getId())
                .vendor(mapToVendorResponse(match.getVendor()))
                .matchingScore(match.getMatchingScore())
                .reason(match.getReason())
                .build())
            .collect(Collectors.toList());
    }

    private WeddingPlan validateWeddingPlanOwner(Long planId, Long userId) {
        WeddingPlan plan = weddingPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy Kế hoạch đám cưới"));
        if (!plan.getUser().getId().equals(userId)) {
            throw new RuntimeException("Bạn không có quyền truy cập vào kế hoạch đám cưới này");
        }
        return plan;
    }

    private VendorResponse mapToVendorResponse(Vendor vendor) {
        Set<String> styles = vendor.getWeddingStyles().stream()
            .map(WeddingStyle::getName)
            .collect(Collectors.toSet());

        return VendorResponse.builder()
            .id(vendor.getId())
            .businessName(vendor.getBusinessName())
            .description(vendor.getDescription())
            .experienceYears(vendor.getExperienceYears())
            .city(vendor.getCity())
            .district(vendor.getDistrict())
            .verified(vendor.getVerified())
            .ratingAverage(vendor.getRatingAverage())
            .totalReviews(vendor.getTotalReviews())
            .styles(styles)
            .build();
    }
}
```

---

## BƯỚC 5: Viết REST Controllers

Chúng ta sẽ tạo các Endpoint công khai (Public) cho việc xem/tìm kiếm Vendor và các Endpoint yêu cầu Đăng nhập (Authenticated) để quản lý danh sách Shortlist.

### 5.1. Tạo mới [VendorController.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller/VendorController.java)
Quản lý các thao tác xem danh sách, lọc, tìm kiếm và xem chi tiết:

```java
package com.fudn.planora.controller;

import com.fudn.planora.dto.response.VendorDetailResponse;
import com.fudn.planora.dto.response.VendorResponse;
import com.fudn.planora.service.VendorMarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorMarketplaceService marketplaceService;

    @GetMapping
    public ResponseEntity<Page<VendorResponse>> getVendors(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Long styleId,
            @RequestParam(required = false) Double priceFrom,
            @RequestParam(required = false) Double priceTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size);
        Page<VendorResponse> result = marketplaceService.getVendors(
                query, categoryId, city, styleId, priceFrom, priceTo, pageable
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorDetailResponse> getVendorDetail(@PathVariable Long id) {
        return ResponseEntity.ok(marketplaceService.getVendorDetail(id));
    }
}
```

### 5.2. Tạo mới [ShortlistController.java](file:///E:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller/ShortlistController.java)
Quản lý danh sách Shortlist và các đề xuất Match kết hợp phân quyền. Chúng ta sử dụng `CustomUserDetails` để lấy thông tin User đang đăng nhập hiện tại từ JWT:

```java
package com.fudn.planora.controller;

import com.fudn.planora.dto.response.VendorMatchResponse;
import com.fudn.planora.dto.response.VendorResponse;
import com.fudn.planora.security.CustomUserDetails;
import com.fudn.planora.service.VendorMarketplaceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wedding-plans/{planId}")
@RequiredArgsConstructor
public class ShortlistController {

    private final VendorMarketplaceService marketplaceService;

    @GetMapping("/shortlist")
    public ResponseEntity<List<VendorResponse>> getShortlist(
            @PathVariable Long planId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(marketplaceService.getShortlist(planId, userDetails.getId()));
    }

    @PostMapping("/shortlist")
    public ResponseEntity<String> addToShortlist(
            @PathVariable Long planId,
            @RequestParam Long vendorId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        marketplaceService.addToShortlist(planId, vendorId, userDetails.getId());
        return ResponseEntity.ok("Đã thêm nhà cung cấp vào danh sách yêu thích thành công");
    }

    @DeleteMapping("/shortlist/{vendorId}")
    public ResponseEntity<String> removeFromShortlist(
            @PathVariable Long planId,
            @PathVariable Long vendorId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        marketplaceService.removeFromShortlist(planId, vendorId, userDetails.getId());
        return ResponseEntity.ok("Đã xóa nhà cung cấp khỏi danh sách yêu thích thành công");
    }

    @GetMapping("/matches")
    public ResponseEntity<List<VendorMatchResponse>> getMatches(
            @PathVariable Long planId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(marketplaceService.getMatches(planId, userDetails.getId()));
    }
}
```

---

## BƯỚC 6: Hướng dẫn Test API chi tiết bằng Postman

Sau khi khởi chạy ứng dụng Spring Boot, hãy thực hiện kiểm thử theo các quy trình sau:

### 6.1. Tìm kiếm và lọc nhà cung cấp (Public API)
*   **Method:** `GET`
*   **URL:** `http://localhost:8080/api/vendors?city=Hà Nội&categoryId=1&page=0&size=5`
*   **Mô tả:** Lấy danh sách các nhà cung cấp ở Hà Nội, cung cấp dịch vụ thuộc danh mục ID 1, phân trang trang số 0, kích thước trang là 5.

### 6.2. Xem thông tin chi tiết Nhà cung cấp (Public API)
*   **Method:** `GET`
*   **URL:** `http://localhost:8080/api/vendors/1`
*   **Mô tả:** Trả về toàn bộ thông tin của Vendor có ID là 1 kèm theo danh sách ảnh Portfolio và các gói dịch vụ sẵn có.

### 6.3. Thêm Vendor vào danh sách Shortlist (Yêu cầu Token Đăng nhập)
*   **Method:** `POST`
*   **URL:** `http://localhost:8080/api/wedding-plans/1/shortlist?vendorId=2`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN_CỦA_CẶP_ĐÔI>`
*   **Mô tả:** Thêm nhà cung cấp có ID = 2 vào danh sách yêu thích của Wedding Plan số 1.

### 6.4. Xem danh sách Shortlist (Yêu cầu Token Đăng nhập)
*   **Method:** `GET`
*   **URL:** `http://localhost:8080/api/wedding-plans/1/shortlist`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN_CỦA_CẶP_ĐÔI>`
*   **Mô tả:** Trả về danh sách các Vendor đã lưu của Wedding Plan số 1.

### 6.5. Xóa Vendor khỏi Shortlist (Yêu cầu Token Đăng nhập)
*   **Method:** `DELETE`
*   **URL:** `http://localhost:8080/api/wedding-plans/1/shortlist/2`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN_CỦA_CẶP_ĐÔI>`
*   **Mô tả:** Xóa nhà cung cấp có ID = 2 khỏi danh sách yêu thích của Wedding Plan số 1.

### 6.6. Lấy danh sách gợi ý phù hợp (Yêu cầu Token Đăng nhập)
*   **Method:** `GET`
*   **URL:** `http://localhost:8080/api/wedding-plans/1/matches`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN_CỦA_CẶP_ĐÔI>`
*   **Mô tả:** Trả về danh sách các đề xuất khớp từ bảng `vendor_matches` có điểm tương thích và lý do lựa chọn.
