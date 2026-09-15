package com.fudn.planora.controller;

import com.fudn.planora.dto.checklist.TaskDTO;
import com.fudn.planora.service.ChecklistService;
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
@Tag(name = "Checklist Tasks", description = "Quản lý danh sách công việc cần chuẩn bị cho đám cưới")
@SecurityRequirement(name = "bearerAuth")
public class ChecklistController {

    private final ChecklistService checklistService;

    @Operation(summary = "Lấy danh sách các công việc theo kế hoạch cưới", responses = {
            @ApiResponse(responseCode = "200", description = "Lấy danh sách thành công")
    })
    @GetMapping("/wedding-plans/{planId}/checklist")
    public ResponseEntity<List<TaskDTO.Response>> getChecklist(@PathVariable Long planId) {
        return ResponseEntity.ok(checklistService.getChecklistByPlan(planId));
    }

    @Operation(summary = "Tạo công việc mới (Custom Task) vào kế hoạch cưới", responses = {
            @ApiResponse(responseCode = "201", description = "Tạo công việc thành công")
    })
    @PostMapping("/wedding-plans/{planId}/checklist")
    public ResponseEntity<TaskDTO.Response> createTask(
            @PathVariable Long planId,
            @RequestBody @Valid TaskDTO.CreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(checklistService.createTask(planId, request));
    }

    @Operation(summary = "Cập nhật trạng thái và thông tin của công việc", responses = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    })
    @PutMapping("/checklist-tasks/{taskId}")
    public ResponseEntity<TaskDTO.Response> updateTask(
            @PathVariable Long taskId,
            @RequestBody @Valid TaskDTO.UpdateRequest request) {
        return ResponseEntity.ok(checklistService.updateTask(taskId, request));
    }

    @Operation(summary = "Xóa công việc khỏi kế hoạch cưới", responses = {
            @ApiResponse(responseCode = "200", description = "Xóa thành công")
    })
    @DeleteMapping("/checklist-tasks/{taskId}")
    public ResponseEntity<Map<String, String>> deleteTask(@PathVariable Long taskId) {
        checklistService.deleteTask(taskId);
        return ResponseEntity.ok(Map.of("message", "Xóa công việc thành công!"));
    }
}