package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.admin.AdminSendEmailRequest;
import com.fudn.planora.dto.response.admin.AdminSendEmailResponse;
import com.fudn.planora.entity.User;
import com.fudn.planora.enums.ENotificationType;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.service.EmailService;
import com.fudn.planora.service.NotificationService;
import jakarta.mail.internet.MimeMessage;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {

    @Value("${app.mail.from:Planora <no-reply@planora.com>}")
    private String mailFrom;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    @Autowired(required = false)
    private JavaMailSender mailSender;

    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public EmailServiceImpl(UserRepository userRepository, NotificationService notificationService) {
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    @Override
    public boolean sendHtmlEmail(String to, String subject, String contentHtml) {
        String wrappedHtml = buildLuxuryEmailHtml(subject, contentHtml);

        // Chế độ mô phỏng khi chưa cấu hình tài khoản SMTP thực tế
        if (mailSender == null || mailUsername == null || mailUsername.trim().isEmpty() || mailUsername.contains("your_email")) {
            log.info("========== [PLANORA EMAIL SIMULATION / DEV MODE] ==========");
            log.info("To: {}", to);
            log.info("From: {}", mailFrom);
            log.info("Subject: {}", subject);
            log.info("Content:\n{}", contentHtml);
            log.info("==========================================================");
            return true;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(mailFrom);
            helper.setTo(to.trim());
            helper.setSubject(subject);
            helper.setText(wrappedHtml, true);

            mailSender.send(message);
            log.info("Đã gửi email thành công tới {}", to);
            return true;
        } catch (Exception e) {
            log.error("Gửi email tới {} thất bại: {}", to, e.getMessage());
            return false;
        }
    }

    @Override
    public AdminSendEmailResponse sendBatchEmails(AdminSendEmailRequest request) {
        List<String> recipients = request.getRecipientEmails();
        int total = recipients.size();
        int successCount = 0;
        int failedCount = 0;
        List<String> failedEmails = new ArrayList<>();

        String previewContent = request.getContent().length() > 150 
                ? request.getContent().substring(0, 147) + "..." 
                : request.getContent();

        for (String email : recipients) {
            String trimmedEmail = email != null ? email.trim() : "";
            if (trimmedEmail.isEmpty()) {
                continue;
            }

            // Đồng thời tạo thông báo chuông (In-App Notification) nếu người dùng có trong database
            if (request.isSendNotification()) {
                try {
                    Optional<User> userOpt = userRepository.findUserByEmail(trimmedEmail);
                    userOpt.ifPresent(user -> notificationService.createNotification(
                            user,
                            request.getSubject(),
                            previewContent,
                            ENotificationType.SYSTEM,
                            "/"
                    ));
                } catch (Exception ex) {
                    log.warn("Không thể tạo thông báo in-app cho {}: {}", trimmedEmail, ex.getMessage());
                }
            }

            // Gửi email thực tế hoặc qua simulation
            boolean sent = sendHtmlEmail(trimmedEmail, request.getSubject(), request.getContent());
            if (sent) {
                successCount++;
            } else {
                failedCount++;
                failedEmails.add(trimmedEmail);
            }
        }

        String message = String.format("Đã hoàn tất gửi email: %d/%d người dùng nhận thành công.", successCount, total);
        if (failedCount > 0) {
            message += String.format(" Có %d email không thể gửi được.", failedCount);
        }

        return AdminSendEmailResponse.builder()
                .totalRecipients(total)
                .successCount(successCount)
                .failedCount(failedCount)
                .failedEmails(failedEmails)
                .message(message)
                .build();
    }

    private String buildLuxuryEmailHtml(String subject, String content) {
        // Đổi các dòng xuống dòng text thuần thành định dạng thẻ <p> hoặc <br> nếu chưa có html
        String formattedContent = content;
        if (!content.contains("<p>") && !content.contains("<div>") && !content.contains("<br")) {
            formattedContent = "<p style=\"margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #4A4A4A;\">" 
                    + content.replace("\n\n", "</p><p style=\"margin: 0 0 16px 0; font-size: 15px; line-height: 1.7; color: #4A4A4A;\">")
                             .replace("\n", "<br/>") 
                    + "</p>";
        }

        return """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>%s</title>
                </head>
                <body style="margin: 0; padding: 0; background-color: #FFFBF5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1A1A1A;">
                    <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FFFBF5; padding: 32px 16px;">
                        <tr>
                            <td align="center">
                                <table width="100%%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border: 1px solid #EADCC9; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(93, 15, 18, 0.05);">
                                    <!-- Header Banner -->
                                    <tr>
                                        <td align="center" style="background-color: #5D0F12; padding: 32px 24px; text-align: center;">
                                            <div style="font-size: 28px; margin-bottom: 6px;">🕊️</div>
                                            <h1 style="margin: 0; color: #FFFBF5; font-family: 'EB Garamond', Georgia, serif; font-size: 26px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase;">PLANORA</h1>
                                            <p style="margin: 6px 0 0 0; color: #D4B896; font-size: 11px; letter-spacing: 1px; text-transform: uppercase;">Nền Tảng Quản Lý Kế Hoạch Cưới & Trợ Lý AI</p>
                                        </td>
                                    </tr>

                                    <!-- Content Body -->
                                    <tr>
                                        <td style="padding: 36px 32px; background-color: #FFFFFF;">
                                            <h2 style="margin: 0 0 20px 0; font-family: 'EB Garamond', Georgia, serif; font-size: 22px; color: #5D0F12; line-height: 1.4;">
                                                %s
                                            </h2>
                                            
                                            <div style="font-size: 15px; line-height: 1.7; color: #4A4A4A;">
                                                %s
                                            </div>

                                            <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #FAF8F5; text-align: center;">
                                                <a href="http://localhost:3000" style="display: inline-block; background-color: #5D0F12; color: #FFFBF5; text-decoration: none; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 15px rgba(93, 15, 18, 0.2);">
                                                    Mở ứng dụng Planora
                                                </a>
                                            </div>
                                        </td>
                                    </tr>

                                    <!-- Footer -->
                                    <tr>
                                        <td style="background-color: #FAF8F5; border-top: 1px solid #EADCC9; padding: 24px 32px; text-align: center;">
                                            <p style="margin: 0 0 8px 0; font-size: 12px; color: #737373;">
                                                Bạn nhận được email này vì bạn là thành viên đã đăng ký trên hệ thống <strong>Planora</strong>.
                                            </p>
                                            <p style="margin: 0; font-size: 11px; color: #A3A3A3;">
                                                © 2026 Planora Wedding Platform. Mọi quyền được bảo lưu.
                                            </p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(subject, subject, formattedContent);
    }
}
