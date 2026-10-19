package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.NotificationPreferenceRequest;
import com.fudn.planora.dto.response.NotificationPreferenceResponse;
import com.fudn.planora.dto.response.NotificationResponse;
import com.fudn.planora.entity.Notification;
import com.fudn.planora.entity.User;
import com.fudn.planora.entity.UserNotificationPreference;
import com.fudn.planora.enums.ENotificationType;
import com.fudn.planora.repository.NotificationRepository;
import com.fudn.planora.repository.UserNotificationPreferenceRepository;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserNotificationPreferenceRepository preferenceRepository;
    private final UserRepository userRepository;

    @Override
    public List<NotificationResponse> getMyNotifications(String email) {
        User user = getUserByEmail(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<NotificationResponse> getMyNotifications(String email, Pageable pageable) {
        User user = getUserByEmail(email);
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Override
    public long getUnreadCount(String email) {
        User user = getUserByEmail(email);
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    @Override
    @Transactional
    public void markAsRead(String email, Long notificationId) {
        User user = getUserByEmail(email);
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông báo"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền truy cập thông báo này");
        }

        notification.setIsRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String email) {
        User user = getUserByEmail(email);
        notificationRepository.markAllAsReadByUserId(user.getId());
    }

    @Override
    public NotificationPreferenceResponse getPreferences(String email) {
        User user = getUserByEmail(email);
        UserNotificationPreference pref = preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreference(user));
        return mapToPrefResponse(pref);
    }

    @Override
    @Transactional
    public NotificationPreferenceResponse updatePreferences(String email, NotificationPreferenceRequest request) {
        User user = getUserByEmail(email);
        UserNotificationPreference pref = preferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> createDefaultPreference(user));

        if (request.getEmailEnabled() != null) pref.setEmailEnabled(request.getEmailEnabled());
        if (request.getInAppEnabled() != null) pref.setInAppEnabled(request.getInAppEnabled());
        if (request.getBrowserPushEnabled() != null) pref.setBrowserPushEnabled(request.getBrowserPushEnabled());
        if (request.getTaskDueReminderEnabled() != null) pref.setTaskDueReminderEnabled(request.getTaskDueReminderEnabled());
        if (request.getPaymentDueReminderEnabled() != null) pref.setPaymentDueReminderEnabled(request.getPaymentDueReminderEnabled());
        if (request.getWeddingMilestoneReminderEnabled() != null) pref.setWeddingMilestoneReminderEnabled(request.getWeddingMilestoneReminderEnabled());
        if (request.getRemindDaysBefore() != null) pref.setRemindDaysBefore(request.getRemindDaysBefore());

        UserNotificationPreference saved = preferenceRepository.save(pref);
        return mapToPrefResponse(saved);
    }

    @Override
    @Transactional
    public void createNotification(User user, String title, String content, ENotificationType type, String linkUrl) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .content(content)
                .type(type != null ? type : ENotificationType.SYSTEM)
                .isRead(false)
                .linkUrl(linkUrl)
                .build();
        notificationRepository.save(notification);
    }

    private User getUserByEmail(String email) {
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng!"));
    }

    private UserNotificationPreference createDefaultPreference(User user) {
        UserNotificationPreference pref = UserNotificationPreference.builder()
                .user(user)
                .emailEnabled(true)
                .inAppEnabled(true)
                .browserPushEnabled(false)
                .taskDueReminderEnabled(true)
                .paymentDueReminderEnabled(true)
                .weddingMilestoneReminderEnabled(true)
                .remindDaysBefore(3)
                .build();
        return preferenceRepository.save(pref);
    }

    private NotificationResponse mapToResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId())
                .title(n.getTitle())
                .content(n.getContent())
                .type(n.getType() != null ? n.getType().name() : "SYSTEM")
                .isRead(n.getIsRead() != null ? n.getIsRead() : false)
                .linkUrl(n.getLinkUrl())
                .createdAt(n.getCreatedAt())
                .build();
    }

    private NotificationPreferenceResponse mapToPrefResponse(UserNotificationPreference p) {
        return NotificationPreferenceResponse.builder()
                .emailEnabled(p.getEmailEnabled())
                .inAppEnabled(p.getInAppEnabled())
                .browserPushEnabled(p.getBrowserPushEnabled())
                .taskDueReminderEnabled(p.getTaskDueReminderEnabled())
                .paymentDueReminderEnabled(p.getPaymentDueReminderEnabled())
                .weddingMilestoneReminderEnabled(p.getWeddingMilestoneReminderEnabled())
                .remindDaysBefore(p.getRemindDaysBefore())
                .updatedAt(p.getUpdatedAt())
                .build();
    }
}
