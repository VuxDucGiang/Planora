package com.fudn.planora.event;

import com.fudn.planora.entity.User;
import com.fudn.planora.entity.UserActivity;
import com.fudn.planora.repository.UserActivityRepository;
import com.fudn.planora.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserActivityListener {

    private final UserActivityRepository activityRepository;
    private final UserRepository userRepository;

    @Async
    @EventListener
    public void handleUserActivity(UserActivityEvent event) {
        try {
            User user = null;
            if (event.getUserId() != null) {
                user = userRepository.findById(event.getUserId()).orElse(null);
            }

            UserActivity activity = UserActivity.builder()
                    .user(user)
                    .action(event.getAction())
                    .entityType(event.getEntityType())
                    .entityId(event.getEntityId())
                    .metadata(event.getMetadata())
                    .ipAddress(event.getIpAddress())
                    .userAgent(event.getUserAgent())
                    .build();

            activityRepository.save(activity);
        } catch (Exception e) {
            log.error("Lỗi khi ghi nhận tracking activity: {}", e.getMessage());
        }
    }
}
