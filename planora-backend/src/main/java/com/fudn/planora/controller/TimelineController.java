package com.fudn.planora.controller;

import com.fudn.planora.dto.timeline.EventDTO;
import com.fudn.planora.service.TimelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Wedding Timeline", description = "Quản lý dòng thời gian và các mốc sự kiện ngày cưới")
@SecurityRequirement(name = "bearerAuth")
public class TimelineController {

    private final TimelineService timelineService;

    @Operation(summary = "Lấy dòng thời gian đám cưới (Timeline) theo kế hoạch", responses = {
            @ApiResponse(responseCode = "200", description = "Lấy dòng thời gian thành công")
    })
    @GetMapping("/wedding-plans/{planId}/timeline")
    public ResponseEntity<List<EventDTO.Response>> getTimeline(@PathVariable Long planId) {
        return ResponseEntity.ok(timelineService.getTimelineByPlan(planId));
    }

    @Operation(summary = "Thêm mốc thời gian sự kiện mới", responses = {
            @ApiResponse(responseCode = "201", description = "Tạo mốc sự kiện thành công")
    })
    @PostMapping("/wedding-plans/{planId}/timeline")
    public ResponseEntity<EventDTO.Response> createEvent(
            @PathVariable Long planId,
            @RequestBody @Valid EventDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(timelineService.createEvent(planId, request));
    }

    @Operation(summary = "Sửa thông tin mốc thời gian sự kiện", responses = {
            @ApiResponse(responseCode = "200", description = "Cập nhật sự kiện thành công")
    })
    @PutMapping("/timeline-events/{eventId}")
    public ResponseEntity<EventDTO.Response> updateEvent(
            @PathVariable Long eventId,
            @RequestBody @Valid EventDTO.UpdateRequest request) {
        return ResponseEntity.ok(timelineService.updateEvent(eventId, request));
    }

    @Operation(summary = "Xóa mốc thời gian sự kiện", responses = {
            @ApiResponse(responseCode = "200", description = "Xóa mốc sự kiện thành công")
    })
    @DeleteMapping("/timeline-events/{eventId}")
    public ResponseEntity<Map<String, String>> deleteEvent(@PathVariable Long eventId) {
        timelineService.deleteEvent(eventId);
        return ResponseEntity.ok(Map.of("message", "Xóa mốc thời gian thành công!"));
    }
}