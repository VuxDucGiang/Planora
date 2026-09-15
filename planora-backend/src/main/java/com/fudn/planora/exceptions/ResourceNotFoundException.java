package com.fudn.planora.exceptions;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends PlanoraException {

    public ResourceNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND);
    }
}
