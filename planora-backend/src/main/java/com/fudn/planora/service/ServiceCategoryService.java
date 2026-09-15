package com.fudn.planora.service;

import com.fudn.planora.dto.vendor.VendorDTO;
import java.util.List;

public interface ServiceCategoryService {
    List<VendorDTO.ServiceCategoryResponse> getAllActiveCategories();
}