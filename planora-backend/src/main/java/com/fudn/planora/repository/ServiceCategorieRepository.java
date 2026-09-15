package com.fudn.planora.repository;

import com.fudn.planora.entity.ServiceCategorie;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ServiceCategorieRepository extends JpaRepository<ServiceCategorie, Long> {
    List<ServiceCategorie> findByActiveTrue();
}