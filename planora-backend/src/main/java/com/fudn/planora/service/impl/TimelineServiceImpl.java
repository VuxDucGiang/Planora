package com.fudn.planora.service.impl;

import com.fudn.planora.dto.timeline.EventDTO;
import com.fudn.planora.model.WeddingPlan;
import com.fudn.planora.model.WeddingPlan.TimelineEvent;
import com.fudn.planora.exceptions.ResourceNotFoundException;
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
    public List<EventDTO.Response> getTimelineByPlan(Long planId) {
        if (!planRepository.existsById(planId)) {
            throw new ResourceNotFoundException("Không tìm thấy kế hoạch đám cưới có ID: " + planId);
        }
        return eventRepository.findByWeddingPlanIdOrderByEventDateAsc(planId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EventDTO.Response createEvent(Long planId, EventDTO.CreateRequest request) {
        WeddingPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kế hoạch đám cưới với ID: " + planId));

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
    public EventDTO.Response updateEvent(Long eventId, EventDTO.UpdateRequest request) {
        TimelineEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy mốc thời gian cần cập nhật với ID: " + eventId));

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
            throw new ResourceNotFoundException("Không tìm thấy mốc thời gian cần xóa với ID: " + eventId);
        }
        eventRepository.deleteById(eventId);
    }

    private EventDTO.Response mapToResponse(TimelineEvent event) {
        return EventDTO.Response.builder()
                .id(event.getId())
                .weddingPlanId(event.getWeddingPlan().getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .eventDate(event.getEventDate())
                .createdAt(event.getCreatedAt())
                .build();
    }
}
