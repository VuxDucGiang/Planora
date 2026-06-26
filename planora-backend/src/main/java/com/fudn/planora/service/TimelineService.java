package com.fudn.planora.service;

import com.fudn.planora.dto.request.CreateEventRequest;
import com.fudn.planora.dto.request.UpdateEventRequest;
import com.fudn.planora.dto.response.EventResponse;
import java.util.List;

public interface TimelineService {
    List<EventResponse> getTimelineByPlan(Long planId);
    EventResponse createEvent(Long planId, CreateEventRequest request);
    EventResponse updateEvent(Long eventId, UpdateEventRequest request);
    void deleteEvent(Long eventId);
}