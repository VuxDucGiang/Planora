package com.fudn.planora.dto.response;

import com.fudn.planora.enums.EChecklistTaskPriority;
import com.fudn.planora.enums.EChecklistTaskStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TaskResponse {
    private Long id;
    private Long weddingPlanId;
    private String description;
    private LocalDate dueDate;
    private EChecklistTaskStatus status;
    private EChecklistTaskPriority priority;
    private LocalDateTime createdAt;

}
