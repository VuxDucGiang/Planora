package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorServiceRepository extends JpaRepository<VendorService, Long> {
    List<VendorService> findByVendorIdOrderByCreatedAtDesc(Long vendorId);
}

