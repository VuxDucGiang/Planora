package com.fudn.planora.repository;

import com.fudn.planora.entity.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByVendorIdOrderByCreatedAtDesc(Long vendorId, Pageable pageable);

    List<Review> findByVendorId(Long vendorId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.vendor.id = :vendorId")
    Double calculateAverageRatingByVendorId(@Param("vendorId") Long vendorId);

    Long countByVendorId(Long vendorId);
}
