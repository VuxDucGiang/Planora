package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorCollection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorCollectionRepository extends JpaRepository<VendorCollection, Long> {
    List<VendorCollection> findByVendorIdOrderByCreatedAtDesc(Long vendorId);
    Optional<VendorCollection> findByIdAndVendorId(Long id, Long vendorId);
}

