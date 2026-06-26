package com.fudn.planora.dto.request;


import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateEventRequest {
    private String title;
    private String description;
    private LocalDateTime eventDate;
}
