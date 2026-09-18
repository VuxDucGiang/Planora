package com.fudn.planora.repository;

import com.fudn.planora.entity.WeddingPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WeddingPlanRepository extends JpaRepository<WeddingPlan, Long> {
    Optional<WeddingPlan> findFirstByUserIdAndStatusOrderByCreatedAtDesc(Long userId, com.fudn.planora.enums.EWeddingPlanStatus status);
}