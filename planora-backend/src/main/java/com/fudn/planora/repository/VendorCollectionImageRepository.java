package com.fudn.planora.repository;

import com.fudn.planora.entity.VendorCollectionImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendorCollectionImageRepository extends JpaRepository<VendorCollectionImage, Long> {
    List<VendorCollectionImage> findByCollectionIdOrderByCreatedAtDesc(Long collectionId);
    Optional<VendorCollectionImage> findByIdAndCollectionId(Long id, Long collectionId);
    void deleteByCollectionId(Long collectionId);

    @Query("SELECT COUNT(i) FROM VendorCollectionImage i WHERE i.collection.vendor.id = :vendorId")
    long countByVendorId(@Param("vendorId") Long vendorId);
}

