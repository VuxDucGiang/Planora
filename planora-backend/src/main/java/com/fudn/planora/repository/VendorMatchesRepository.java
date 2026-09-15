package com.fudn.planora.repository;

import com.fudn.planora.model.Vendor.VendorMatches;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VendorMatchesRepository extends JpaRepository<VendorMatches, Long> {
    List<VendorMatches> findByWeddingPlanIdOrderByMatchingScoreDesc(Long weddingPlanId);
}
