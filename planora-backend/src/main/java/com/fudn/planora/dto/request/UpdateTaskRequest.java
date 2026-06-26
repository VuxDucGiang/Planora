package com.fudn.planora.dto.request;

import com.fudn.planora.enums.EChecklistTaskPriority;
import com.fudn.planora.enums.EChecklistTaskStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class UpdateTaskRequest {
    private String title;
    private String description;
    private LocalDate dueDate;
    private EChecklistTaskStatus status;
    private EChecklistTaskPriority priority;

}
