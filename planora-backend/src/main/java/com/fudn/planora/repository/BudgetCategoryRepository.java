package com.fudn.planora.repository;

import com.fudn.planora.entity.BudgetCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface BudgetCategoryRepository extends JpaRepository<BudgetCategory, Long> {
    Optional<BudgetCategory> findByName(String name);
}