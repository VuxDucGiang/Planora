package com.fudn.planora.dto.response.admin;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUserSummaryResponse {
    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private String role;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastActiveAt;
    private String lastAction;
    private String weddingTitle;
}
