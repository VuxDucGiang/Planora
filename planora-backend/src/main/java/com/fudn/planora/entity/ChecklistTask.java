package com.fudn.planora.entity;

import com.fudn.planora.enums.EChecklistTaskPriority;
import com.fudn.planora.enums.EChecklistTaskStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "checklist_tasks")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistTask {
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