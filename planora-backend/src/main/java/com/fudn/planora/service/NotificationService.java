package com.fudn.planora.service;

import com.fudn.planora.dto.request.NotificationPreferenceRequest;
import com.fudn.planora.dto.response.NotificationPreferenceResponse;
import com.fudn.planora.dto.response.NotificationResponse;
import com.fudn.planora.entity.User;
import com.fudn.planora.enums.ENotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    List<NotificationResponse> getMyNotifications(String email);
    Page<NotificationResponse> getMyNotifications(String email, Pageable pageable);
    long getUnreadCount(String email);
    void markAsRead(String email, Long notificationId);
    void markAllAsRead(String email);
    NotificationPreferenceResponse getPreferences(String email);
    NotificationPreferenceResponse updatePreferences(String email, NotificationPreferenceRequest request);
    void createNotification(User user, String title, String content, ENotificationType type, String linkUrl);
}
