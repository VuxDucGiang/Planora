package com.fudn.planora.repository;

import com.fudn.planora.entity.Vendor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface VendorRepository extends JpaRepository<Vendor, Long> {

    @Query(value = "SELECT DISTINCT v FROM Vendor v " +
            "LEFT JOIN v.weddingStyles s " +
            "LEFT JOIN VendorService vs ON vs.vendor.id = v.id " +
            "WHERE (:query IS NULL OR LOWER(v.businessName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:categoryId IS NULL OR vs.category.id = :categoryId) " +
            "AND (:city IS NULL OR LOWER(v.city) = LOWER(:city)) " +
            "AND (:styleId IS NULL OR s.id = :styleId) " +
            "AND (:priceFrom IS NULL OR vs.priceTo >= :priceFrom) " +
            "AND (:priceTo IS NULL OR vs.priceFrom <= :priceTo) " +
            "AND (vs.active = true OR vs.active IS NULL)",
           countQuery = "SELECT COUNT(DISTINCT v) FROM Vendor v " +
            "LEFT JOIN v.weddingStyles s " +
            "LEFT JOIN VendorService vs ON vs.vendor.id = v.id " +
            "WHERE (:query IS NULL OR LOWER(v.businessName) LIKE LOWER(CONCAT('%', :query, '%'))) " +
            "AND (:categoryId IS NULL OR vs.category.id = :categoryId) " +
            "AND (:city IS NULL OR LOWER(v.city) = LOWER(:city)) " +
            "AND (:styleId IS NULL OR s.id = :styleId) " +
            "AND (:priceFrom IS NULL OR vs.priceTo >= :priceFrom) " +
            "AND (:priceTo IS NULL OR vs.priceFrom <= :priceTo) " +
            "AND (vs.active = true OR vs.active IS NULL)")
    Page<Vendor> filterVendors(
            @Param("query") String query,
            @Param("categoryId") Long categoryId,
            @Param("city") String city,
            @Param("styleId") Long styleId,
            @Param("priceFrom") BigDecimal priceFrom,
            @Param("priceTo") BigDecimal priceTo,
            Pageable pageable
    );

    List<Vendor> findTop6ByVerifiedTrueOrderByRatingAverageDescTotalReviewsDesc();

    List<Vendor> findByIdIn(List<Long> ids);
}