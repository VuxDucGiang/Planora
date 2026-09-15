package com.fudn.planora.dto.timeline;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

public class EventDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {
        @NotBlank(message = "Tiêu đề sự kiện không được để trống")
        private String title;

        private String description;

        @NotNull(message = "Thời gian sự kiện không được để trống")
        private LocalDateTime eventDate;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateRequest {
        private String title;
        private String description;
        private LocalDateTime eventDate;
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
        private LocalDateTime eventDate;
        private LocalDateTime createdAt;
    }
}
