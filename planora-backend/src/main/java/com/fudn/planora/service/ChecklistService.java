package com.fudn.planora.service;

import com.fudn.planora.dto.checklist.TaskDTO;
import java.util.List;

public interface ChecklistService {
    List<TaskDTO.Response> getChecklistByPlan(Long planId);
    TaskDTO.Response createTask(Long planId, TaskDTO.CreateRequest request);
    TaskDTO.Response updateTask(Long taskId, TaskDTO.UpdateRequest request);
    void deleteTask(Long taskId);
}