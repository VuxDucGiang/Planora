package com.fudn.planora.dto.checklist;

import com.fudn.planora.enums.EChecklistTaskPriority;
import com.fudn.planora.enums.EChecklistTaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class TaskDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Tiêu đề công việc không được để trống")
        private String title;

        private String description;
        private LocalDate dueDate;
        private EChecklistTaskPriority priority;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String description;
        private LocalDate dueDate;
        private EChecklistTaskStatus status;
        private EChecklistTaskPriority priority;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long id;
        private Long weddingPlanId;
        private String title;
        private String description;
        private LocalDate dueDate;
        private EChecklistTaskStatus status;
        private EChecklistTaskPriority priority;
        private LocalDateTime createdAt;
    }
}
