package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorPackage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VendorPackageRepository extends JpaRepository<VendorPackage, Long> {
    List<VendorPackage> findByVendorServiceIdOrderByCreatedAtDesc(Long vendorServiceId);
}

