package com.fudn.planora.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationPreferenceResponse {
    private Boolean emailEnabled;
    private Boolean inAppEnabled;
    private Boolean browserPushEnabled;
    private Boolean taskDueReminderEnabled;
    private Boolean paymentDueReminderEnabled;
    private Boolean weddingMilestoneReminderEnabled;
    private Integer remindDaysBefore;
    private LocalDateTime updatedAt;
}
