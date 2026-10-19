package com.fudn.planora.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "user_notification_preferences")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserNotificationPreference {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "email_enabled")
    private Boolean emailEnabled;

    @Column(name = "in_app_enabled")
    private Boolean inAppEnabled;

    @Column(name = "browser_push_enabled")
    private Boolean browserPushEnabled;

    @Column(name = "task_due_reminder_enabled")
    private Boolean taskDueReminderEnabled;

    @Column(name = "payment_due_reminder_enabled")
    private Boolean paymentDueReminderEnabled;

    @Column(name = "wedding_milestone_reminder_enabled")
    private Boolean weddingMilestoneReminderEnabled;

    @Column(name = "remind_days_before")
    private Integer remindDaysBefore;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    public void onSave() {
        if (emailEnabled == null) emailEnabled = true;
        if (inAppEnabled == null) inAppEnabled = true;
        if (browserPushEnabled == null) browserPushEnabled = false;
        if (taskDueReminderEnabled == null) taskDueReminderEnabled = true;
        if (paymentDueReminderEnabled == null) paymentDueReminderEnabled = true;
        if (weddingMilestoneReminderEnabled == null) weddingMilestoneReminderEnabled = true;
        if (remindDaysBefore == null) remindDaysBefore = 3;
        updatedAt = LocalDateTime.now();
    }
}
