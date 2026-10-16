package com.fudn.planora.event;

import com.fudn.planora.enums.EEntityType;
import com.fudn.planora.enums.EUserAction;
import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Getter
@Builder
public class UserActivityEvent {
    private Long userId;
    private EUserAction action;
    private EEntityType entityType;
    private String entityId;
    private Map<String, Object> metadata;
    private String ipAddress;
    private String userAgent;
}
