package com.fudn.planora.controller;

import com.fudn.planora.dto.request.CreateEventRequest;
import com.fudn.planora.dto.request.UpdateEventRequest;
import com.fudn.planora.dto.response.EventResponse;
import com.fudn.planora.service.TimelineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class TimelineController {

    private final TimelineService timelineService;

    // 5. Lấy dòng thời gian đám cưới (Timeline)
    @GetMapping("/wedding-plans/{planId}/timeline")
    public List<EventResponse> getTimeline(@PathVariable Long planId) {
        return timelineService.getTimelineByPlan(planId);
    }

    // 6. Thêm mốc thời gian
    @PostMapping("/wedding-plans/{planId}/timeline")
    public EventResponse createEvent(
            @PathVariable Long planId,
            @RequestBody @Valid CreateEventRequest request) {
        return timelineService.createEvent(planId, request);
    }

    // 7. Sửa thông tin mốc thời gian
    @PutMapping("/timeline-events/{eventId}")
    public EventResponse updateEvent(
            @PathVariable Long eventId,
            @RequestBody @Valid UpdateEventRequest request) {
        return timelineService.updateEvent(eventId, request);
    }

    // 8. Xóa mốc thời gian
    @DeleteMapping("/timeline-events/{eventId}")
    public String deleteEvent(@PathVariable Long eventId) {
        timelineService.deleteEvent(eventId);
        return "Xóa mốc thời gian thành công!";
    }
}