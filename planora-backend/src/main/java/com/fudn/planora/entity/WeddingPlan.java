package com.fudn.planora.entity;

import com.fudn.planora.enums.EWeddingPlanStatus;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "wedding_plans")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WeddingPlan {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String title;

    @Column(name = "wedding_date")
    private LocalDate weddingDate;

    @Column(name = "guest_count")
    private Integer guestCount;

    private BigDecimal budget;

    private String location;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private EWeddingPlanStatus status = EWeddingPlanStatus.DRAFT;

    @ManyToMany
    @JoinTable(
            name = "wedding_plan_styles",
            joinColumns = @JoinColumn(name = "wedding_plan_id"),
            inverseJoinColumns = @JoinColumn(name = "wedding_style_id")
    )
    private Set<WeddingStyle> weddingStyles;

    @ManyToMany
    @JoinTable(
            name = "wedding_plan_priorities",
            joinColumns = @JoinColumn(name = "wedding_plan_id"),
            inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<ServiceCategorie> priorityCategories;

    @OneToMany(mappedBy = "weddingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<BudgetItem> budgetItems = new ArrayList<>();

    @OneToMany(mappedBy = "weddingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ChecklistTask> checklistTasks = new ArrayList<>();

    @OneToMany(mappedBy = "weddingPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<TimelineEvent> timelineEvents = new ArrayList<>();

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) status = EWeddingPlanStatus.DRAFT;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}