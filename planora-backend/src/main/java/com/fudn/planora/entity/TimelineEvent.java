package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Entity
@Table(name = "timeline_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TimelineEvent {
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
