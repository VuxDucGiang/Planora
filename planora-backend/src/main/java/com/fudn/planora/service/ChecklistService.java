package com.fudn.planora.service;

import com.fudn.planora.dto.request.CreateTaskRequest;
import com.fudn.planora.dto.request.UpdateTaskRequest;
import com.fudn.planora.dto.response.TaskResponse;
import java.util.List;

public interface ChecklistService {
    List<TaskResponse> getChecklistByPlan(Long planId);
    TaskResponse createTask(Long planId, CreateTaskRequest request);
    TaskResponse updateTask(Long taskId, UpdateTaskRequest request);
    void deleteTask(Long taskId);
}