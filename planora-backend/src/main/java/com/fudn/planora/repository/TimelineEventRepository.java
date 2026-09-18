package com.fudn.planora.repository;

import com.fudn.planora.entity.TimelineEvent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TimelineEventRepository extends JpaRepository<TimelineEvent, Long> {
    List<TimelineEvent> findByWeddingPlanIdOrderByEventDateAsc(Long weddingPlanId);
}