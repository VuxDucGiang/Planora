package com.fudn.planora.service.impl;

import com.fudn.planora.dto.response.ServiceCategoryResponse;
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
    public List<ServiceCategoryResponse> getAllActiveCategories() {
        return categoryRepository.findAll().stream()
                .filter(ServiceCategorie::getActive)
                .map(cat -> ServiceCategoryResponse.builder()
                        .id(cat.getId())
                        .name(cat.getName())
                        .build())
                .collect(Collectors.toList());
    }
}