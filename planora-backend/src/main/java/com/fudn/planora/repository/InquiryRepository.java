package com.fudn.planora.repository;

import com.fudn.planora.entity.Inquiry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InquiryRepository extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findByVendorIdOrderByUpdatedAtDesc(Long vendorId);

    List<Inquiry> findByCustomerIdOrderByUpdatedAtDesc(Long customerId);

    Optional<Inquiry> findByWeddingPlanIdAndVendorId(Long weddingPlanId, Long vendorId);

    Optional<Inquiry> findFirstByCustomerIdAndVendorIdOrderByUpdatedAtDesc(Long customerId, Long vendorId);
}

