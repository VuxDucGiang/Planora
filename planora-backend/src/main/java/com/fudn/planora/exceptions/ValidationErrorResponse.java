package com.fudn.planora.exceptions;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorResponse {

    private HttpStatus status;

    private int statusCode;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime time;

    private List<String> errors;

    public ValidationErrorResponse(HttpStatus status, LocalDateTime time, List<String> errors) {
        this.status = status;
        this.statusCode = status.value();
        this.time = time;
        this.errors = errors;
    }
}
