package com.fudn.planora.exceptions;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class PlanoraException extends RuntimeException {

    private final HttpStatus status;

    public PlanoraException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public PlanoraException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public PlanoraException(String message, Throwable cause, HttpStatus status) {
        super(message, cause);
        this.status = status;
    }
}
