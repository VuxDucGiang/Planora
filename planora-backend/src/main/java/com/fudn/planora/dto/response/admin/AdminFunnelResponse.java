package com.fudn.planora.dto.response.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminFunnelResponse {
    private long registeredUsers;
    private long onboardingCompleted;
    private long planGenerated;
    private long vendorViewed;
    private long inquirySent;
}
