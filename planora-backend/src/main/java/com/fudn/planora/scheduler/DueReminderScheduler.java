package com.fudn.planora.scheduler;

import com.fudn.planora.entity.ChecklistTask;
import com.fudn.planora.entity.Notification;
import com.fudn.planora.entity.User;
import com.fudn.planora.entity.UserNotificationPreference;
import com.fudn.planora.entity.WeddingPlan;
import com.fudn.planora.enums.EChecklistTaskStatus;
import com.fudn.planora.enums.ENotificationType;
import com.fudn.planora.repository.ChecklistTaskRepository;
import com.fudn.planora.repository.NotificationRepository;
import com.fudn.planora.repository.UserNotificationPreferenceRepository;
import com.fudn.planora.repository.WeddingPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DueReminderScheduler {

    private final ChecklistTaskRepository checklistTaskRepository;
    private final WeddingPlanRepository weddingPlanRepository;
    private final UserNotificationPreferenceRepository preferenceRepository;
    private final NotificationRepository notificationRepository;

    /**
     * Chạy định kỳ mỗi ngày lúc 08:00 sáng để quét các nhiệm vụ và mốc cưới đến hạn.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void scanAndSendDueReminders() {
        log.info("Bắt đầu quét thông báo nhắc hạn công việc và ngày cưới...");
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();

        // 1. Quét nhiệm vụ Checklist sắp đến hạn
        try {
            List<ChecklistTask> pendingTasks = checklistTaskRepository.findAll();
            for (ChecklistTask task : pendingTasks) {
                if (task.getDueDate() == null || task.getStatus() == EChecklistTaskStatus.DONE) {
                    continue;
                }
                WeddingPlan plan = task.getWeddingPlan();
                if (plan == null || plan.getUser() == null) {
                    continue;
                }
                User user = plan.getUser();
                UserNotificationPreference pref = preferenceRepository.findByUserId(user.getId()).orElse(null);
                if (pref != null && Boolean.FALSE.equals(pref.getTaskDueReminderEnabled())) {
                    continue;
                }

                int remindDays = (pref != null && pref.getRemindDaysBefore() != null) ? pref.getRemindDaysBefore() : 3;
                long daysDiff = ChronoUnit.DAYS.between(today, task.getDueDate());

                if (daysDiff >= 0 && daysDiff <= remindDays) {
                    String title = daysDiff == 0 
                            ? "Hôm nay đến hạn: " + task.getTitle()
                            : "Sắp đến hạn: " + task.getTitle() + " (còn " + daysDiff + " ngày)";
                    
                    if (notificationRepository.existsByUserIdAndTitleAndCreatedAtAfter(user.getId(), title, startOfToday)) {
                        continue;
                    }

                    String content = "Nhiệm vụ cưới '" + task.getTitle() + "' có hạn vào ngày " + task.getDueDate() + ". Đừng quên hoàn thành nhé!";

                    notificationRepository.save(Notification.builder()
                            .user(user)
                            .title(title)
                            .content(content)
                            .type(ENotificationType.SYSTEM)
                            .isRead(false)
                            .linkUrl("/checklist")
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi quét checklist task nhắc hạn: {}", e.getMessage(), e);
        }

        // 2. Quét đếm ngược mốc quan trọng Ngày Cưới
        try {
            List<WeddingPlan> activePlans = weddingPlanRepository.findAll();
            for (WeddingPlan plan : activePlans) {
                if (plan.getWeddingDate() == null || plan.getUser() == null) {
                    continue;
                }
                User user = plan.getUser();
                UserNotificationPreference pref = preferenceRepository.findByUserId(user.getId()).orElse(null);
                if (pref != null && Boolean.FALSE.equals(pref.getWeddingMilestoneReminderEnabled())) {
                    continue;
                }

                long daysLeft = ChronoUnit.DAYS.between(today, plan.getWeddingDate());
                if (daysLeft == 100 || daysLeft == 60 || daysLeft == 30 || daysLeft == 14 || daysLeft == 7 || daysLeft == 3 || daysLeft == 1 || daysLeft == 0) {
                    String title = daysLeft == 0
                            ? "Chúc mừng ngày cưới của hai bạn!"
                            : "Đếm ngược ngày cưới: Còn " + daysLeft + " ngày!";

                    if (notificationRepository.existsByUserIdAndTitleAndCreatedAtAfter(user.getId(), title, startOfToday)) {
                        continue;
                    }

                    String content = daysLeft == 0
                            ? "Hôm nay là ngày cưới thiêng liêng (" + plan.getWeddingDate() + "). Chúc hai bạn trăm năm hạnh phúc!"
                            : "Chỉ còn " + daysLeft + " ngày nữa là đến lễ cưới (" + plan.getWeddingDate() + "). Hãy kiểm tra lại các khâu chuẩn bị cuối cùng nhé!";

                    notificationRepository.save(Notification.builder()
                            .user(user)
                            .title(title)
                            .content(content)
                            .type(ENotificationType.SYSTEM)
                            .isRead(false)
                            .linkUrl("/timeline")
                            .build());
                }
            }
        } catch (Exception e) {
            log.error("Lỗi khi quét đếm ngược ngày cưới: {}", e.getMessage(), e);
        }

        log.info("Hoàn tất quét thông báo nhắc hạn.");
    }
}
