package com.fudn.planora.controller;

import com.fudn.planora.dto.response.FileUploadResponse;
import com.fudn.planora.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@RequiredArgsConstructor
public class FileUploadController {

    private final CloudinaryService cloudinaryService;

    @PostMapping("/image")
    public ResponseEntity<FileUploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "vendors") String folder
    ) {
        FileUploadResponse response = cloudinaryService.uploadImage(file, folder);
        return ResponseEntity.ok(response);
    }
}
