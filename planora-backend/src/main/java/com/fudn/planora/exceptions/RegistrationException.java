package com.fudn.planora.exceptions;

import org.springframework.http.HttpStatus;

public class RegistrationException extends PlanoraException {

    public RegistrationException(String message) {
        super(message, HttpStatus.BAD_REQUEST);
    }
}
