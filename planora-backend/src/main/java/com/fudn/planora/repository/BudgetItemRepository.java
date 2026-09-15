package com.fudn.planora.repository;

import com.fudn.planora.model.WeddingPlan.BudgetItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BudgetItemRepository extends JpaRepository<BudgetItem, Long> {
    List<BudgetItem> findByWeddingPlanId(Long weddingPlanId);
}

