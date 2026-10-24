package com.fudn.planora.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddCollectionImageRequest {

    @NotBlank(message = "Đường dẫn ảnh không được để trống!")
    private String imageUrl;

    private String title;
}

