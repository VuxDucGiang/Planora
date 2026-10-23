package com.fudn.planora.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectionResponse {
    private Long id;
    private Long vendorId;
    private String title;
    private String description;
    private String coverImageUrl;
    private Integer imagesCount;
    private List<CollectionImageResponse> images;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

