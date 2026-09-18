package com.fudn.planora.controller;

import com.fudn.planora.dto.response.ServiceCategoryResponse;
import com.fudn.planora.service.ServiceCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/service-categories")
@RequiredArgsConstructor
public class ServiceCategoryController {

    private final ServiceCategoryService categoryService;

    @GetMapping
    public List<ServiceCategoryResponse> getCategories() {
        return categoryService.getAllActiveCategories();
    }
}