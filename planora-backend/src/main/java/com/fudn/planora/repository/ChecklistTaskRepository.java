package com.fudn.planora.repository;

import com.fudn.planora.entity.ChecklistTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChecklistTaskRepository extends JpaRepository<ChecklistTask, Long> {
    List<ChecklistTask> findByWeddingPlanIdOrderByDueDateAsc(Long weddingPlanId);
}