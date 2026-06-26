package com.fudn.planora.controller;

import com.fudn.planora.dto.request.CreateTaskRequest;
import com.fudn.planora.dto.request.UpdateTaskRequest;
import com.fudn.planora.dto.response.TaskResponse;
import com.fudn.planora.service.ChecklistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService checklistService;

    // 1. Lấy danh sách Checklist nhiệm vụ
    @GetMapping("/wedding-plans/{planId}/checklist")
    public List<TaskResponse> getChecklist(@PathVariable Long planId) {
        return checklistService.getChecklistByPlan(planId);
    }

    // 2. Tạo công việc mới (Custom Task)
    @PostMapping("/wedding-plans/{planId}/checklist")
    public TaskResponse createTask(
            @PathVariable Long planId,
            @RequestBody @Valid CreateTaskRequest request) {
        return checklistService.createTask(planId, request);
    }

    // 3. Cập nhật trạng thái/thông tin công việc
    @PutMapping("/checklist-tasks/{taskId}")
    public TaskResponse updateTask(
            @PathVariable Long taskId,
            @RequestBody @Valid UpdateTaskRequest request) {
        return checklistService.updateTask(taskId, request);
    }

    // 4. Xóa công việc
    @DeleteMapping("/checklist-tasks/{taskId}")
    public String deleteTask(@PathVariable Long taskId) {
        checklistService.deleteTask(taskId);
        return "Xóa công việc thành công!";
    }
}