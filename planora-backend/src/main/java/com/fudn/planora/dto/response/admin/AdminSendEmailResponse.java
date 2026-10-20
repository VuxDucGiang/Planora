package com.fudn.planora.dto.response.admin;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSendEmailResponse {
    private int totalRecipients;
    private int successCount;
    private int failedCount;
    private List<String> failedEmails;
    private String message;
}
