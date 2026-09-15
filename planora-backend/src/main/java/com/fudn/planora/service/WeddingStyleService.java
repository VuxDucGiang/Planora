package com.fudn.planora.service;

import com.fudn.planora.dto.wedding.WeddingDTO;
import java.util.List;

public interface WeddingStyleService {
    List<WeddingDTO.StyleResponse> getAllStyles();
}