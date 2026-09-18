package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorShortlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface VendorShortlistRepository extends JpaRepository<VendorShortlist, Long> {
    List<VendorShortlist> findByWeddingPlanId(Long weddingPlanId);
    Optional<VendorShortlist> findByWeddingPlanIdAndVendorId(Long weddingPlanId, Long vendorId);
    boolean existsByWeddingPlanIdAndVendorId(Long weddingPlanId, Long vendorId);
}