package com.fudn.planora.dto.request.admin;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSendEmailRequest {

    @NotEmpty(message = "Danh sách người nhận không được để trống")
    private List<String> recipientEmails;

    @NotBlank(message = "Tiêu đề email không được để trống")
    private String subject;

    @NotBlank(message = "Nội dung email không được để trống")
    private String content;

    @Builder.Default
    private boolean sendNotification = true;
}
