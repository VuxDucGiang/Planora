package com.fudn.planora.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateCollectionRequest {

    @NotBlank(message = "Tên bộ sưu tập không được để trống!")
    private String title;

    private String description;

    private String coverImageUrl;
}

