package com.fudn.planora.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponse {
    private Long id;
    private Long customerId;
    private String customerName;
    private String customerAvatar;
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
}
