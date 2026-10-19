package com.fudn.planora.controller;

import com.fudn.planora.dto.request.NotificationPreferenceRequest;
import com.fudn.planora.dto.response.NotificationPreferenceResponse;
import com.fudn.planora.dto.response.NotificationResponse;
import com.fudn.planora.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public List<NotificationResponse> getMyNotifications() {
        String email = getLoggedInUserEmail();
        return notificationService.getMyNotifications(email);
    }

    @GetMapping("/paged")
    public Page<NotificationResponse> getMyNotificationsPaged(
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        String email = getLoggedInUserEmail();
        return notificationService.getMyNotifications(email, pageable);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {
        String email = getLoggedInUserEmail();
        return Map.of("unreadCount", notificationService.getUnreadCount(email));
    }

    @PutMapping("/{id}/read")
    public Map<String, String> markAsRead(@PathVariable Long id) {
        String email = getLoggedInUserEmail();
        notificationService.markAsRead(email, id);
        return Map.of("message", "Đã đánh dấu đọc thông báo");
    }

    @PutMapping("/read-all")
    public Map<String, String> markAllAsRead() {
        String email = getLoggedInUserEmail();
        notificationService.markAllAsRead(email);
        return Map.of("message", "Đã đánh dấu đọc tất cả thông báo");
    }

    @GetMapping("/preferences")
    public NotificationPreferenceResponse getPreferences() {
        String email = getLoggedInUserEmail();
        return notificationService.getPreferences(email);
    }

    @PutMapping("/preferences")
    public NotificationPreferenceResponse updatePreferences(@RequestBody NotificationPreferenceRequest request) {
        String email = getLoggedInUserEmail();
        return notificationService.updatePreferences(email, request);
    }

    private String getLoggedInUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("Người dùng chưa xác thực");
    }
}
