package com.fudn.planora.service;

import com.fudn.planora.dto.request.admin.AdminSendEmailRequest;
import com.fudn.planora.dto.response.admin.AdminSendEmailResponse;

public interface EmailService {
    
    /**
     * Gửi email định dạng HTML đến một người nhận
     */
    boolean sendHtmlEmail(String to, String subject, String contentHtml);

    /**
     * Gửi email hàng loạt từ Admin Dashboard
     */
    AdminSendEmailResponse sendBatchEmails(AdminSendEmailRequest request);
}
