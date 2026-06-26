package com.fudn.planora.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class CreateEventRequest {
    @NotBlank(message = "Tiêu đề sự kiện không được để trống")
    private String title;

    private String description;

    @NotNull(message = "Thời gian diễn ra không được để trống")
    private LocalDateTime eventDate;

}
