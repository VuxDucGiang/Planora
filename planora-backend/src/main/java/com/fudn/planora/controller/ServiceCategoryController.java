package com.fudn.planora.controller;

import com.fudn.planora.dto.vendor.VendorDTO;
import com.fudn.planora.service.ServiceCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/service-categories")
@RequiredArgsConstructor
@Tag(name = "Service Categories", description = "Danh mục dịch vụ cưới (Nhiếp ảnh, Trang trí, Địa điểm, v.v.)")
public class ServiceCategoryController {

    private final ServiceCategoryService categoryService;

    @Operation(summary = "Lấy danh sách tất cả các danh mục dịch vụ đang hoạt động", responses = {
            @ApiResponse(responseCode = "200", description = "Lấy danh mục thành công")
    })
    @GetMapping
    public ResponseEntity<List<VendorDTO.ServiceCategoryResponse>> getCategories() {
        return ResponseEntity.ok(categoryService.getAllActiveCategories());
    }
}