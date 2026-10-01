# Hướng dẫn Xây dựng & Tích hợp API - Module 5: Vendor Marketplace & Shortlist

Tài liệu này hướng dẫn chi tiết toàn bộ các bước triển khai cụm API cho **Module 5: Tìm kiếm, phân lọc Nhà cung cấp dịch vụ cưới, So sánh, Đánh giá và Quản lý danh sách yêu thích (Shortlist)** trong dự án Planora.

---

## 1. Các bước thực hiện tổng quan
1.  **Bước 1: Khai báo JPA Entities** (`Vendor`, `VendorService`, `VendorPortfolio`, `VendorPackage`, `VendorShortlist`, `VendorMatches`, `Review`).
2.  **Bước 2: Cập nhật Repository Layer** (`VendorRepository`, `VendorShortlistRepository`, `VendorMatchesRepository`, `ReviewRepository`).
3.  **Bước 3: Tạo các lớp DTO (Data Transfer Object)** cho Response và Request.
4.  **Bước 4: Cấu hình Bảo mật (Spring Security)** cho phép truy cập Public các endpoint xem/tìm kiếm/so sánh.
5.  **Bước 5: Xây dựng tầng Service** (`VendorMarketplaceService` và `VendorMarketplaceServiceImpl`).
6.  **Bước 6: Viết REST Controller** (`VendorMarketplaceController`).
7.  **Bước 7: Hướng dẫn Test API chi tiết bằng Postman**.

---

## BƯỚC 1: Khai báo đầy đủ JPA Entities

### 1.1. Cập nhật [Vendor.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/Vendor.java)
Đảm bảo khai báo đầy đủ các mối quan hệ `@ManyToMany` phong cách cưới, `@OneToMany` dịch vụ, portfolios và đánh giá (reviews):

```java
    @ManyToMany
    @JoinTable(
        name = "vendor_styles",
        joinColumns = @JoinColumn(name = "vendor_id"),
        inverseJoinColumns = @JoinColumn(name = "wedding_style_id")
    )
    private Set<WeddingStyle> weddingStyles;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VendorService> services;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<VendorPortfolio> portfolios;

    @OneToMany(mappedBy = "vendor", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Review> reviews;
```

### 1.2. Khai báo thực thể [VendorService.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorService.java)
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

### 1.3. Khai báo thực thể [VendorPortfolio.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorPortfolio.java)
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

### 1.4. Khai báo thực thể [VendorPackage.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorPackage.java)
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

### 1.5. Khai báo thực thể [VendorShortlist.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorShortlist.java)
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

### 1.6. Khai báo thực thể [VendorMatches.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/VendorMatches.java)
```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendor_matches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorMatches {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_plan_id", nullable = false)
    private WeddingPlan weddingPlan;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @Column(name = "matching_score")
    private Double matchingScore;

    private String reason;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
```

### 1.7. Khai báo thực thể [Review.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/entity/Review.java)
```java
package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @Column(nullable = false)
    private Integer rating;

    @Column(columnDefinition = "TEXT")
    private String comment;

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

### 2.1. Cập nhật [VendorRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/VendorRepository.java)
Hỗ trợ tìm kiếm phân trang có `countQuery` chính xác khi dùng `DISTINCT`, lọc theo khoảng giá `BigDecimal`, tìm vendor nổi bật và truy vấn danh sách so sánh:

```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    @Query(value = "SELECT DISTINCT v FROM Vendor v " +
            "LEFT JOIN v.weddingStyles s " +
            "LEFT JOIN VendorService vs ON vs.vendor.id = v.id " +
            "WHERE (:query IS NULL OR LOWER(v.businessName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:categoryId IS NULL OR vs.category.id = :categoryId) " +
            "AND (:city IS NULL OR LOWER(v.city) = LOWER(:city)) " +
            "AND (:styleId IS NULL OR s.id = :styleId) " +
            "AND (:priceFrom IS NULL OR vs.priceTo >= :priceFrom) " +
            "AND (:priceTo IS NULL OR vs.priceFrom <= :priceTo) " +
            "AND (vs.active = true OR vs.active IS NULL)",
           countQuery = "SELECT COUNT(DISTINCT v) FROM Vendor v " +
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
            @Param("priceFrom") BigDecimal priceFrom,
            @Param("priceTo") BigDecimal priceTo,
            Pageable pageable
    );

    List<Vendor> findTop6ByVerifiedTrueOrderByRatingAverageDescTotalReviewsDesc();

    List<Vendor> findByIdIn(List<Long> ids);
}
```

### 2.2. Cập nhật [VendorShortlistRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/VendorShortlistRepository.java)
Sử dụng `JOIN FETCH` để loại bỏ vấn đề N+1 query khi lấy danh sách shortlist:

```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorShortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VendorShortlistRepository extends JpaRepository<VendorShortlist, Long> {
    List<VendorShortlist> findByWeddingPlanId(Long weddingPlanId);

    @Query("SELECT s FROM VendorShortlist s JOIN FETCH s.vendor v LEFT JOIN FETCH v.weddingStyles WHERE s.weddingPlan.id = :weddingPlanId")
    List<VendorShortlist> findByWeddingPlanIdWithVendor(@Param("weddingPlanId") Long weddingPlanId);

    Optional<VendorShortlist> findByWeddingPlanIdAndVendorId(Long weddingPlanId, Long vendorId);
    boolean existsByWeddingPlanIdAndVendorId(Long weddingPlanId, Long vendorId);
}
```

### 2.3. Tạo mới [VendorMatchesRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/VendorMatchesRepository.java)
```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorMatches;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VendorMatchesRepository extends JpaRepository<VendorMatches, Long> {
    List<VendorMatches> findByWeddingPlanIdOrderByMatchingScoreDesc(Long weddingPlanId);
}
```

### 2.4. Tạo mới [ReviewRepository.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/repository/ReviewRepository.java)
```java
package com.fudn.planora.repository;

import com.fudn.planora.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByVendorIdOrderByCreatedAtDesc(Long vendorId, Pageable pageable);
    List<Review> findByVendorId(Long vendorId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.vendor.id = :vendorId")
    Double calculateAverageRatingByVendorId(@Param("vendorId") Long vendorId);

    Long countByVendorId(Long vendorId);
}
```

---

## BƯỚC 3: Tạo các lớp DTO (Data Transfer Object)

### 3.1. DTO [VendorResponse.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response/VendorResponse.java)
Cung cấp đầy đủ thông tin để hiển thị Vendor Card (bao gồm ảnh đại diện, danh mục chính, khoảng giá thực tế):

```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.math.BigDecimal;
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
    private String primaryCategoryName;
    private BigDecimal priceFrom;
    private BigDecimal priceTo;
    private String imageUrl;
}
```

### 3.2. DTO [VendorDetailResponse.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response/VendorDetailResponse.java)
```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.math.BigDecimal;
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

    private String primaryCategoryName;
    private BigDecimal priceFrom;
    private BigDecimal priceTo;
    private String phone;
    private String email;
    private String avatarUrl;

    private List<PortfolioResponse> portfolios;
    private List<PackageResponse> packages;
    private List<ReviewResponse> reviews;
}
```

### 3.3. DTO [ReviewResponse.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response/ReviewResponse.java)
```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerAvatar;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
```

### 3.4. DTO [VendorCompareResponse.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/response/VendorCompareResponse.java)
```java
package com.fudn.planora.dto.response;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorCompareResponse {
    private List<VendorDetailResponse> vendors;
    private Integer totalCompared;
}
```

### 3.5. DTO [CreateReviewRequest.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/dto/request/CreateReviewRequest.java)
```java
package com.fudn.planora.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateReviewRequest {

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Đánh giá tối thiểu là 1 sao")
    @Max(value = 5, message = "Đánh giá tối đa là 5 sao")
    private Integer rating;

    private String comment;
}
```

---

## BƯỚC 4: Cấu hình Spring Security cho phép Public Vendor APIs

Trong [SecurityConfig.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/config/SecurityConfig.java), thêm cấu hình cho phép khách vãng lai gọi các API xem danh sách, chi tiết, so sánh và review:

```java
    .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/login").permitAll()
            .requestMatchers("/api/auth/logout").permitAll()
            .requestMatchers("/api/auth/google").permitAll()
            .requestMatchers("/api/auth/register").permitAll()
            .requestMatchers(org.springframework.http.HttpMethod.GET, "/api/vendors/**").permitAll()
            .requestMatchers("/api/service-categories/**").permitAll()
            .requestMatchers("/api/wedding-styles/**").permitAll()
            .requestMatchers("/api/*").permitAll()
            .anyRequest().authenticated())
```

---

## BƯỚC 5: Xây dựng tầng Service Layer

### 5.1. Interface [VendorMarketplaceService.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/VendorMarketplaceService.java)
```java
package com.fudn.planora.service;

import com.fudn.planora.dto.request.CreateReviewRequest;
import com.fudn.planora.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;

public interface VendorMarketplaceService {
    Page<VendorResponse> getVendors(
            String query,
            Long categoryId,
            String city,
            Long styleId,
            BigDecimal priceFrom,
            BigDecimal priceTo,
            Pageable pageable
    );

    VendorDetailResponse getVendorDetail(Long vendorId);
    List<VendorResponse> getFeaturedVendors();
    VendorCompareResponse compareVendors(List<Long> vendorIds);
    List<VendorResponse> getShortlist(Long planId, Long currentUserId);
    void addToShortlist(Long planId, Long vendorId, Long currentUserId);
    void removeFromShortlist(Long planId, Long vendorId, Long currentUserId);
    List<VendorMatchResponse> getMatches(Long planId, Long currentUserId);
    Page<ReviewResponse> getVendorReviews(Long vendorId, Pageable pageable);
    void addVendorReview(Long vendorId, CreateReviewRequest request, Long currentUserId);
}
```

### 5.2. Class [VendorMarketplaceServiceImpl.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/service/impl/VendorMarketplaceServiceImpl.java)
Bao gồm:
*   Mapping thông minh trích xuất tự động `primaryCategoryName`, `priceFrom`, `priceTo`, `imageUrl`.
*   Thuật toán Matching tự động (Rule-based Matching Engine) tính điểm theo địa điểm thành phố (+0.3), phong cách đám cưới (+0.15), và xác thực uy tín (+0.05).
*   Tính năng So sánh 2-4 Vendor (`compareVendors`).
*   Thêm review mới và tự động tính toán cập nhật lại điểm `ratingAverage` cùng `totalReviews` của Vendor.

---

## BƯỚC 6: Viết REST Controller

File [VendorMarketplaceController.java](file:///e:/Github/Planora/planora-backend/src/main/java/com/fudn/planora/controller/VendorMarketplaceController.java):

```java
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

    // 1. Tìm kiếm và lọc nhà cung cấp (Public)
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

    // 2. Vendor nổi bật cho Landing Page (Public)
    @GetMapping("/vendors/featured")
    public ResponseEntity<List<VendorResponse>> getFeaturedVendors() {
        return ResponseEntity.ok(marketplaceService.getFeaturedVendors());
    }

    // 3. So sánh 2-4 nhà cung cấp (Public)
    @GetMapping("/vendors/compare")
    public ResponseEntity<VendorCompareResponse> compareVendors(@RequestParam List<Long> ids) {
        return ResponseEntity.ok(marketplaceService.compareVendors(ids));
    }

    // 4. Chi tiết nhà cung cấp (Public)
    @GetMapping("/vendors/{vendorId}")
    public ResponseEntity<VendorDetailResponse> getVendorDetail(@PathVariable Long vendorId) {
        VendorDetailResponse response = marketplaceService.getVendorDetail(vendorId);
        return ResponseEntity.ok(response);
    }

    // 5. Danh sách đánh giá của vendor (Public)
    @GetMapping("/vendors/{vendorId}/reviews")
    public ResponseEntity<Page<ReviewResponse>> getVendorReviews(
            @PathVariable Long vendorId,
            Pageable pageable
    ) {
        return ResponseEntity.ok(marketplaceService.getVendorReviews(vendorId, pageable));
    }

    // 6. Gửi đánh giá cho vendor (Yêu cầu đăng nhập)
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

    // 7. Lấy danh sách Shortlist của Wedding Plan (Yêu cầu đăng nhập)
    @GetMapping("/wedding-plans/{planId}/shortlist")
    public ResponseEntity<List<VendorResponse>> getShortlist(
            @PathVariable Long planId,
            @AuthenticationPrincipal String email
    ) {
        Long userId = getUserIdByEmail(email);
        List<VendorResponse> response = marketplaceService.getShortlist(planId, userId);
        return ResponseEntity.ok(response);
    }

    // 8. Thêm Vendor vào Shortlist (Yêu cầu đăng nhập)
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

    // 9. Xóa Vendor khỏi Shortlist (Yêu cầu đăng nhập)
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

    // 10. Gợi ý Vendor thông minh dựa trên Wedding Plan (Yêu cầu đăng nhập)
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
```

---

## BƯỚC 7: Hướng dẫn Test API chi tiết bằng Postman

### 7.1. Tìm kiếm và lọc nhà cung cấp (Public)
*   **Method:** `GET`
*   **URL:** `http://localhost:8080/api/vendors?city=Hà Nội&categoryId=6&page=0&size=5`
*   **Mô tả:** Lọc các vendor tại Hà Nội, có danh mục chụp ảnh cưới (`categoryId=6`), phân trang trang 0 kích thước 5.

### 7.2. Lấy danh sách Nhà cung cấp nổi bật (Public)
*   **Method:** `GET`
*   **URL:** `http://localhost:8080/api/vendors/featured`
*   **Mô tả:** Trả về top 6 nhà cung cấp đã xác thực (`verified=true`) có rating cao nhất phục vụ carousel trang chủ.

### 7.3. So sánh các Nhà cung cấp (Public)
*   **Method:** `GET`
*   **URL:** `http://localhost:8080/api/vendors/compare?ids=2,3`
*   **Mô tả:** Trả về bảng đối sánh chi tiết thông tin giữa các vendor có ID 2 và 3.

### 7.4. Xem chi tiết Nhà cung cấp (Public)
*   **Method:** `GET`
*   **URL:** `http://localhost:8080/api/vendors/2`
*   **Mô tả:** Trả về thông tin chi tiết, danh sách ảnh portfolio, bảng giá gói dịch vụ và các review gần nhất.

### 7.5. Gửi đánh giá cho Nhà cung cấp (Yêu cầu Đăng nhập)
*   **Method:** `POST`
*   **URL:** `http://localhost:8080/api/vendors/2/reviews`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Body (JSON):**
    ```json
    {
      "rating": 5,
      "comment": "Dịch vụ trang trí hoa tươi cực kỳ ưng ý, ekip rất chu đáo và đúng giờ!"
    }
    ```

### 7.6. Thao tác với Shortlist (Yêu cầu Đăng nhập)
*   **Thêm vào yêu thích:** `POST http://localhost:8080/api/wedding-plans/1/shortlist?vendorId=2`
*   **Lấy danh sách yêu thích:** `GET http://localhost:8080/api/wedding-plans/1/shortlist`
*   **Xóa khỏi yêu thích:** `DELETE http://localhost:8080/api/wedding-plans/1/shortlist/2`

### 7.7. Lấy danh sách gợi ý phù hợp (Yêu cầu Đăng nhập)
*   **Method:** `GET`
*   **URL:** `http://localhost:8080/api/wedding-plans/1/matches`
*   **Headers:** `Authorization: Bearer <JWT_TOKEN>`
*   **Mô tả:** Tự động tính điểm tương thích theo địa điểm tổ chức cưới và phong cách đã chọn trong Wedding Plan để đưa ra lý do gợi ý thuyết phục.
