package com.fudn.planora.service;

import com.fudn.planora.enums.EEntityType;
import com.fudn.planora.enums.EUserAction;
import com.fudn.planora.event.UserActivityEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class ActivityTrackingService {

    private final ApplicationEventPublisher eventPublisher;

    public void track(Long userId, EUserAction action, EEntityType entityType, String entityId, Map<String, Object> metadata) {
        UserActivityEvent event = UserActivityEvent.builder()
                .userId(userId)
                .action(action)
                .entityType(entityType)
                .entityId(entityId)
                .metadata(metadata)
                .build();
        eventPublisher.publishEvent(event);
    }
}
