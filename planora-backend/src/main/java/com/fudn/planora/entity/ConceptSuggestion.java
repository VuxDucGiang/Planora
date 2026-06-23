package com.fudn.planora.entity;


import com.fudn.planora.enums.EConceptSuggestionGeneratedBy;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "concept_suggestions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConceptSuggestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wedding_plan_id",nullable = false)
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
    protected void onCreate(){
        createdAt = LocalDateTime.now();
    }
}
