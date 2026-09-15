package com.fudn.planora.service;

import com.fudn.planora.dto.timeline.EventDTO;
import java.util.List;

public interface TimelineService {
    List<EventDTO.Response> getTimelineByPlan(Long planId);
    EventDTO.Response createEvent(Long planId, EventDTO.CreateRequest request);
    EventDTO.Response updateEvent(Long eventId, EventDTO.UpdateRequest request);
    void deleteEvent(Long eventId);
}