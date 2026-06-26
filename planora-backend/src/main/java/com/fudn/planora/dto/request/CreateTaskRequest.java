package com.fudn.planora.dto.request;

import com.fudn.planora.enums.EChecklistTaskPriority;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
public class CreateTaskRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    private String desription;

    private LocalDate dueDate;

    private EChecklistTaskPriority priority;
}
