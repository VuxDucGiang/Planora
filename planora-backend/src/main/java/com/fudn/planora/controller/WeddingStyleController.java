package com.fudn.planora.controller;

import com.fudn.planora.dto.response.WeddingStyleResponse;
import com.fudn.planora.service.WeddingStyleService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/wedding-styles")
@RequiredArgsConstructor
public class WeddingStyleController {

    private final WeddingStyleService styleService;

    @GetMapping
    public List<WeddingStyleResponse> getStyles() {
        return styleService.getAllStyles();
    }
}