package com.fudn.planora.repository;

import com.fudn.planora.entity.ChecklistTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ChecklistTaskRepository extends JpaRepository<ChecklistTask, Long> {
}