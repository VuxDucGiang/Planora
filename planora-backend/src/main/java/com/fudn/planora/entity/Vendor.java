package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "vendors")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
