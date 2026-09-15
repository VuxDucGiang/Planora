package com.fudn.planora.model;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Entity(name = "Vendor")
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(of = "id")
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "business_name", nullable = false)
    private String businessName;

    private String description;

    @Column(name = "experience_years")
    @Builder.Default
    private Integer experienceYears = 0;

    private String city;
    private String district;

    @Builder.Default
    private Boolean verified = false;

    @Column(name = "rating_average")
    @Builder.Default
    private Double ratingAverage = 0.0;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (experienceYears == null) experienceYears = 0;
        if (verified == null) verified = false;
        if (ratingAverage == null) ratingAverage = 0.0;
        if (totalReviews == null) totalReviews = 0;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // ==========================================
    // Nested Entity: VendorService
    // ==========================================
    @Entity(name = "VendorService")
    @Table(name = "vendor_services")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorService {

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

    // ==========================================
    // Nested Entity: VendorPackage
    // ==========================================
    @Entity(name = "VendorPackage")
    @Table(name = "vendor_packages")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorPackage {

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

    // ==========================================
    // Nested Entity: VendorPortfolio
    // ==========================================
    @Entity(name = "VendorPortfolio")
    @Table(name = "vendor_portfolios")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorPortfolio {

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

    // ==========================================
    // Nested Entity: VendorMatches
    // ==========================================
    @Entity(name = "VendorMatches")
    @Table(name = "vendor_matches")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class VendorMatches {

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
}
