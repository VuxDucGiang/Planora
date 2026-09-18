package com.fudn.planora.service.impl;

import com.fudn.planora.dto.vendor.VendorDTO;
import com.fudn.planora.entity.ServiceCategorie;
import com.fudn.planora.repository.ServiceCategorieRepository;
import com.fudn.planora.service.ServiceCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ServiceCategoryServiceImpl implements ServiceCategoryService {

    private final ServiceCategorieRepository categoryRepository;

    @Override
    public List<VendorDTO.ServiceCategoryResponse> getAllActiveCategories() {
        return categoryRepository.findByActiveTrue().stream()
                .map(cat -> VendorDTO.ServiceCategoryResponse.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .build())
                .collect(Collectors.toList());
    }
}