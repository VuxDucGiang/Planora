package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorPortfolio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorPortfolioRepository extends JpaRepository<VendorPortfolio, Long> {
    List<VendorPortfolio> findByVendorIdOrderByCreatedAtDesc(Long vendorId);
}
