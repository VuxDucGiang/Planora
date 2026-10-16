package com.fudn.planora.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserJourneyResponse {
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String role;
    private LocalDateTime createdAt;
    private List<UserActivityResponse> activities;
}
