package com.fudn.planora.dto.response;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventResponse {
    private Long id;
    private Long weddingPlanId;
    private String title;
    private String description;
    private LocalDateTime eventDate;
    private LocalDateTime createdAt;

}
