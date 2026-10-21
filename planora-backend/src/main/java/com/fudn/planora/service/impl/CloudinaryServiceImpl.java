package com.fudn.planora.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.fudn.planora.dto.response.FileUploadResponse;
import com.fudn.planora.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CloudinaryServiceImpl implements CloudinaryService {

    private final Cloudinary cloudinary;

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/jpg", "image/gif"
    );

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    @Override
    public FileUploadResponse uploadImage(MultipartFile file, String folder) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Tệp tải lên không được để trống!");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Dung lượng tệp vượt quá giới hạn cho phép (tối đa 10MB)!");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Chỉ chấp nhận các định dạng ảnh: JPG, PNG, WEBP, GIF!");
        }

        // Nếu chưa cấu hình Cloudinary thực tế, trả về ảnh mẫu mô phỏng để dev không bị gián đoạn
        if (cloudName == null || cloudName.isBlank() || "planora-cloud".equalsIgnoreCase(cloudName)) {
            log.warn("Cloudinary chưa được cấu hình khóa thực tế trong .env. Sử dụng ảnh mẫu mô phỏng.");
            String simulatedPublicId = "planora/" + (folder != null ? folder + "/" : "") + UUID.randomUUID();
            return FileUploadResponse.builder()
                    .url("https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80")
                    .publicId(simulatedPublicId)
                    .format(contentType.replace("image/", ""))
                    .bytes(file.getSize())
                    .build();
        }

        try {
            String targetFolder = (folder != null && !folder.isBlank()) ? "planora/" + folder : "planora/vendors";
            Map<?, ?> uploadParams = ObjectUtils.asMap(
                    "folder", targetFolder,
                    "resource_type", "image",
                    "use_filename", true,
                    "unique_filename", true
            );

            Map<?, ?> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            String secureUrl = (String) uploadResult.get("secure_url");
            String publicId = (String) uploadResult.get("public_id");
            String format = (String) uploadResult.get("format");
            Long bytes = uploadResult.get("bytes") instanceof Number ? ((Number) uploadResult.get("bytes")).longValue() : file.getSize();

            return FileUploadResponse.builder()
                    .url(secureUrl)
                    .publicId(publicId)
                    .format(format)
                    .bytes(bytes)
                    .build();

        } catch (IOException e) {
            log.error("Lỗi khi tải ảnh lên Cloudinary: {}", e.getMessage(), e);
            throw new RuntimeException("Tải ảnh lên máy chủ thất bại: " + e.getMessage());
        }
    }

    @Override
    public void deleteImage(String publicId) {
        if (publicId == null || publicId.isBlank()) return;

        if (cloudName == null || cloudName.isBlank() || "planora-cloud".equalsIgnoreCase(cloudName)) {
            log.info("Chế độ mô phỏng: Đã xóa ảnh có public_id: {}", publicId);
            return;
        }

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.error("Lỗi khi xóa ảnh trên Cloudinary: {}", e.getMessage(), e);
        }
    }
}
