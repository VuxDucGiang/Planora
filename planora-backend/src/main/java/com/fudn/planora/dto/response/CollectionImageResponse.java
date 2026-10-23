package com.fudn.planora.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CollectionImageResponse {
    private Long id;
    private Long collectionId;
    private String imageUrl;
    private String title;
    private LocalDateTime createdAt;
}

