package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.CreateTaskRequest;
import com.fudn.planora.dto.request.UpdateTaskRequest;
import com.fudn.planora.dto.response.TaskResponse;
import com.fudn.planora.entity.ChecklistTask;
import com.fudn.planora.entity.WeddingPlan;
import com.fudn.planora.enums.EChecklistTaskPriority;
import com.fudn.planora.enums.EChecklistTaskStatus;
import com.fudn.planora.repository.ChecklistTaskRepository;
import com.fudn.planora.repository.WeddingPlanRepository;
import com.fudn.planora.service.ChecklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChecklistServiceImpl implements ChecklistService {

    private final ChecklistTaskRepository taskRepository;
    private final WeddingPlanRepository planRepository;

    @Override
    public List<TaskResponse> getChecklistByPlan(Long planId) {
        // Đảm bảo plan tồn tại
        if (!planRepository.existsById(planId)) {
            throw new RuntimeException("Không tìm thấy kế hoạch đám cưới có ID: " + planId);
        }
        return taskRepository.findByWeddingPlanIdOrderByDueDateAsc(planId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskResponse createTask(Long planId, CreateTaskRequest request) {
        WeddingPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy kế hoạch đám cưới"));

        ChecklistTask task = ChecklistTask.builder()
                .weddingPlan(plan)
                .title(request.getTitle())
                .description(request.getDescription())
                .dueDate(request.getDueDate())
                .status(EChecklistTaskStatus.TODO)
                .priority(request.getPriority() != null ? request.getPriority() : EChecklistTaskPriority.MEDIUM)
                .build();

        ChecklistTask savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(Long taskId, UpdateTaskRequest request) {
        ChecklistTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy công việc cần cập nhật"));

        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());

        ChecklistTask updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(Long taskId) {
        if (!taskRepository.existsById(taskId)) {
            throw new RuntimeException("Không tìm thấy công việc cần xóa");
        }
        taskRepository.deleteById(taskId);
    }

    private TaskResponse mapToResponse(ChecklistTask task) {
        return TaskResponse.builder()
                .id(task.getId())
                .weddingPlanId(task.getWeddingPlan().getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .dueDate(task.getDueDate())
                .status(task.getStatus())
                .priority(task.getPriority())
                .createdAt(task.getCreatedAt())
                .build();
    }
}