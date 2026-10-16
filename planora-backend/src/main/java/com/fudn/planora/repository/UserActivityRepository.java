package com.fudn.planora.repository;

import com.fudn.planora.entity.UserActivity;
import com.fudn.planora.enums.EUserAction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserActivityRepository extends JpaRepository<UserActivity, Long> {

    @Query("SELECT COUNT(DISTINCT a.user.id) FROM UserActivity a WHERE a.createdAt >= :since AND a.user IS NOT NULL")
    long countDistinctActiveUsersSince(@Param("since") LocalDateTime since);

    long countByAction(EUserAction action);

    Page<UserActivity> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    @Query("SELECT a FROM UserActivity a ORDER BY a.createdAt DESC")
    Page<UserActivity> findAllActivities(Pageable pageable);

    List<UserActivity> findByUserIdOrderByCreatedAtAsc(Long userId);

    List<UserActivity> findByAction(EUserAction action);
}
