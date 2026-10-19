package com.fudn.planora.dto.request;

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
public class NotificationPreferenceRequest {
    private Boolean emailEnabled;
    private Boolean inAppEnabled;
    private Boolean browserPushEnabled;
    private Boolean taskDueReminderEnabled;
    private Boolean paymentDueReminderEnabled;
    private Boolean weddingMilestoneReminderEnabled;
    private Integer remindDaysBefore;
}
