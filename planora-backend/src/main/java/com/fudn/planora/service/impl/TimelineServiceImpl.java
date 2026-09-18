package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.CreateEventRequest;
import com.fudn.planora.dto.request.UpdateEventRequest;
import com.fudn.planora.dto.response.EventResponse;
import com.fudn.planora.entity.TimelineEvent;
import com.fudn.planora.entity.WeddingPlan;
import com.fudn.planora.repository.TimelineEventRepository;
import com.fudn.planora.repository.WeddingPlanRepository;
import com.fudn.planora.service.TimelineService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimelineServiceImpl implements TimelineService {

    private final TimelineEventRepository eventRepository;
    private final WeddingPlanRepository planRepository;

    @Override
    public List<EventResponse> getTimelineByPlan(Long planId) {
        if (!planRepository.existsById(planId)) {
            throw new RuntimeException("Không tìm thấy kế hoạch đám cưới có ID: " + planId);
        }
        return eventRepository.findByWeddingPlanIdOrderByEventDateAsc(planId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventResponse createEvent(Long planId, CreateEventRequest request) {
        WeddingPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch đám cưới"));

        TimelineEvent event = TimelineEvent.builder()
                .weddingPlan(plan)
                .title(request.getTitle())
                .description(request.getDescription())
                .eventDate(request.getEventDate())
                .build();

        TimelineEvent savedEvent = eventRepository.save(event);
        return mapToResponse(savedEvent);
    }

    @Override
    @Transactional
    public EventResponse updateEvent(Long eventId, UpdateEventRequest request) {
        TimelineEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy mốc thời gian cần cập nhật"));

        if (request.getTitle() != null) event.setTitle(request.getTitle());
        if (request.getDescription() != null) event.setDescription(request.getDescription());
        if (request.getEventDate() != null) event.setEventDate(request.getEventDate());

        TimelineEvent updatedEvent = eventRepository.save(event);
        return mapToResponse(updatedEvent);
    }

    @Override
    @Transactional
    public void deleteEvent(Long eventId) {
        if (!eventRepository.existsById(eventId)) {
            throw new RuntimeException("Không tìm thấy mốc thời gian cần xóa");
        }
        eventRepository.deleteById(eventId);
    }

    private EventResponse mapToResponse(TimelineEvent event) {
        return EventResponse.builder()
                .id(event.getId())
                .weddingPlanId(event.getWeddingPlan().getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .createdAt(event.getCreatedAt())
                .build();
    }
}