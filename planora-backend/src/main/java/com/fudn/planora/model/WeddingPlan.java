package com.fudn.planora.model;

import com.fudn.planora.enums.EChecklistTaskPriority;
import com.fudn.planora.enums.EChecklistTaskStatus;
import com.fudn.planora.enums.EConceptSuggestionGeneratedBy;
import com.fudn.planora.enums.EWeddingPlanStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity(name = "WeddingPlan")
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

    @ManyToMany
    @JoinTable(
            name = "vendor_shortlists",
            joinColumns = @JoinColumn(name = "wedding_plan_id"),
            inverseJoinColumns = @JoinColumn(name = "vendor_id")
    )
    @Builder.Default
    private Set<Vendor> shortlistedVendors = new HashSet<>();

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

    // ==========================================
    // Nested Entity: BudgetItem
    // ==========================================
    @Entity(name = "BudgetItem")
    @Table(name = "budget_items")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BudgetItem {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "wedding_plan_id", nullable = false)
        private WeddingPlan weddingPlan;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "category_id", nullable = false)
        private BudgetCategory category;

        @Column(name = "estimated_cost")
        private BigDecimal estimatedCost;

        @Column(name = "actual_cost")
        private BigDecimal actualCost;

        private String note;

        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;

        @PrePersist
        protected void onCreate() {
            createdAt = LocalDateTime.now();
        }
    }

    // ==========================================
    // Nested Entity: BudgetCategory
    // ==========================================
    @Entity(name = "BudgetCategory")
    @Table(name = "budget_categories")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class BudgetCategory {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(nullable = false, unique = true)
        private String name;
    }

    // ==========================================
    // Nested Entity: ChecklistTask
    // ==========================================
    @Entity(name = "ChecklistTask")
    @Table(name = "checklist_tasks")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ChecklistTask {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "wedding_plan_id", nullable = false)
        private WeddingPlan weddingPlan;

        @Column(nullable = false)
        private String title;

        private String description;

        @Column(name = "due_date")
        private LocalDate dueDate;

        @Enumerated(EnumType.STRING)
        @Builder.Default
        private EChecklistTaskStatus status = EChecklistTaskStatus.TODO;

        @Enumerated(EnumType.STRING)
        @Builder.Default
        private EChecklistTaskPriority priority = EChecklistTaskPriority.MEDIUM;

        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;

        @PrePersist
        protected void onCreate() {
            createdAt = LocalDateTime.now();
        }
    }

    // ==========================================
    // Nested Entity: TimelineEvent
    // ==========================================
    @Entity(name = "TimelineEvent")
    @Table(name = "timeline_events")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimelineEvent {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "wedding_plan_id", nullable = false)
        private WeddingPlan weddingPlan;

        @Column(nullable = false)
        private String title;

        private String description;

        @Column(name = "event_date")
        private LocalDateTime eventDate;

        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;

        @PrePersist
        protected void onCreate() {
            createdAt = LocalDateTime.now();
        }
    }

    // ==========================================
    // Nested Entity: ConceptSuggestion
    // ==========================================
    @Entity(name = "ConceptSuggestion")
    @Table(name = "concept_suggestions")
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ConceptSuggestion {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "wedding_plan_id", nullable = false)
        private WeddingPlan weddingPlan;

        @Column(name = "concept_name")
        private String conceptName;

        private String description;

        @Column(name = "estimated_budget")
        private BigDecimal estimatedBudget;

        @Enumerated(EnumType.STRING)
        @Column(name = "generated_by")
        @Builder.Default
        private EConceptSuggestionGeneratedBy generatedBy = EConceptSuggestionGeneratedBy.RULE_BASED;

        @Column(name = "created_at", updatable = false)
        private LocalDateTime createdAt;

        @PrePersist
        protected void onCreate() {
            createdAt = LocalDateTime.now();
        }
    }
}
