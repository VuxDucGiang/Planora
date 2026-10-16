package com.fudn.planora.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserActivityResponse {
    private Long id;
    private Long userId;
    private String userEmail;
    private String userFullName;
    private String action;
    private String entityType;
    private String entityId;
    private Map<String, Object> metadata;
    private LocalDateTime createdAt;
}
