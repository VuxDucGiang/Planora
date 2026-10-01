package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorShortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VendorShortlistRepository extends JpaRepository<VendorShortlist, Long> {
    List<VendorShortlist> findByWeddingPlanId(Long weddingPlanId);

    @Query("SELECT s FROM VendorShortlist s JOIN FETCH s.vendor v LEFT JOIN FETCH v.weddingStyles WHERE s.weddingPlan.id = :weddingPlanId")
    List<VendorShortlist> findByWeddingPlanIdWithVendor(@Param("weddingPlanId") Long weddingPlanId);

    Optional<VendorShortlist> findByWeddingPlanIdAndVendorId(Long weddingPlanId, Long vendorId);
    boolean existsByWeddingPlanIdAndVendorId(Long weddingPlanId, Long vendorId);
}