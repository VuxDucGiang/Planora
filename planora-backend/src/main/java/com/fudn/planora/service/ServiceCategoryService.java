package com.fudn.planora.service;

import com.fudn.planora.dto.response.ServiceCategoryResponse;
import java.util.List;

public interface ServiceCategoryService {
    List<ServiceCategoryResponse> getAllActiveCategories();
}