package com.fudn.planora.controller;

import com.fudn.planora.dto.timeline.EventDTO;
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
    public List<EventDTO.Response> getTimeline(@PathVariable Long planId) {
        return timelineService.getTimelineByPlan(planId);
    }

    // 6. Thêm mốc thời gian
    @PostMapping("/wedding-plans/{planId}/timeline")
    public EventDTO.Response createEvent(
            @PathVariable Long planId,
            @RequestBody @Valid EventDTO.CreateRequest request) {
        return timelineService.createEvent(planId, request);
    }

    // 7. Sửa thông tin mốc thời gian
    @PutMapping("/timeline-events/{eventId}")
    public EventDTO.Response updateEvent(
            @PathVariable Long eventId,
            @RequestBody @Valid EventDTO.UpdateRequest request) {
        return timelineService.updateEvent(eventId, request);
    }

    // 8. Xóa mốc thời gian
    @DeleteMapping("/timeline-events/{eventId}")
    public String deleteEvent(@PathVariable Long eventId) {
        timelineService.deleteEvent(eventId);
        return "Xóa mốc thời gian thành công!";
    }
}