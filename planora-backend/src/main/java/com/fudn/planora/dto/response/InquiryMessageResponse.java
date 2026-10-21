package com.fudn.planora.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InquiryMessageResponse {
    private Long id;
    private Long inquiryId;
    private Long senderId;
    private String senderName;
    private String senderRole;
    private String senderAvatar;
    private String message;
    private LocalDateTime createdAt;
}

