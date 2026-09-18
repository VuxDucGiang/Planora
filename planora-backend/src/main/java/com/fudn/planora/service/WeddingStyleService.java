package com.fudn.planora.service;

import com.fudn.planora.dto.response.WeddingStyleResponse;
import java.util.List;

public interface WeddingStyleService {
    List<WeddingStyleResponse> getAllStyles();
}