package com.fudn.planora.service.impl;

import com.fudn.planora.dto.checklist.TaskDTO;
import com.fudn.planora.model.WeddingPlan;
import com.fudn.planora.model.WeddingPlan.ChecklistTask;
import com.fudn.planora.enums.EChecklistTaskPriority;
import com.fudn.planora.enums.EChecklistTaskStatus;
import com.fudn.planora.exceptions.ResourceNotFoundException;
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
    public List<TaskDTO.Response> getChecklistByPlan(Long planId) {
        // Đảm bảo plan tồn tại
        if (!planRepository.existsById(planId)) {
            throw new ResourceNotFoundException("Không tìm thấy kế hoạch đám cưới có ID: " + planId);
        }
        return taskRepository.findByWeddingPlanIdOrderByDueDateAsc(planId)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public TaskDTO.Response createTask(Long planId, TaskDTO.CreateRequest request) {
        WeddingPlan plan = planRepository.findById(planId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy kế hoạch đám cưới với ID: " + planId));

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
    public TaskDTO.Response updateTask(Long taskId, TaskDTO.UpdateRequest request) {
        ChecklistTask task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy công việc cần cập nhật với ID: " + taskId));

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
            throw new ResourceNotFoundException("Không tìm thấy công việc cần xóa với ID: " + taskId);
        }
        taskRepository.deleteById(taskId);
    }

    private TaskDTO.Response mapToResponse(ChecklistTask task) {
        return TaskDTO.Response.builder()
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
