package com.fudn.planora.controller;

import com.fudn.planora.dto.wedding.WeddingDTO;
import com.fudn.planora.service.WeddingStyleService;
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
@RequestMapping("/api/wedding-styles")
@RequiredArgsConstructor
@Tag(name = "Wedding Styles", description = "Danh mục phong cách tiệc cưới (Hiện đại, Cổ điển, Tối giản, v.v.)")
public class WeddingStyleController {

    private final WeddingStyleService styleService;

    @Operation(summary = "Lấy danh sách các phong cách đám cưới", responses = {
            @ApiResponse(responseCode = "200", description = "Lấy phong cách thành công")
    })
    @GetMapping
    public ResponseEntity<List<WeddingDTO.StyleResponse>> getStyles() {
        return ResponseEntity.ok(styleService.getAllStyles());
    }
}