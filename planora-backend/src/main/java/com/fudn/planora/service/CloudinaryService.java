package com.fudn.planora.service;

import com.fudn.planora.dto.response.FileUploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CloudinaryService {
    FileUploadResponse uploadImage(MultipartFile file, String folder);
    void deleteImage(String publicId);
}
