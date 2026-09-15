package com.fudn.planora.exceptions;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(PlanoraException.class)
    public ResponseEntity<ApiExceptionResponse> handlePlanoraException(PlanoraException ex) {
        log.warn("Application exception occurred: {}", ex.getMessage());
        ApiExceptionResponse response = new ApiExceptionResponse(
                ex.getMessage(),
                ex.getStatus(),
                LocalDateTime.now()
        );
        return ResponseEntity.status(ex.getStatus()).body(response);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiExceptionResponse> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Authentication bad credentials: {}", ex.getMessage());
        ApiExceptionResponse response = new ApiExceptionResponse(
                ex.getMessage(),
                HttpStatus.UNAUTHORIZED,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiExceptionResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        ApiExceptionResponse response = new ApiExceptionResponse(
                "Bạn không có quyền truy cập tài nguyên này",
                HttpStatus.FORBIDDEN,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(response);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiExceptionResponse> handleGeneralException(Exception ex) {
        log.error("Unhandled exception: ", ex);
        ApiExceptionResponse response = new ApiExceptionResponse(
                ex.getMessage() != null ? ex.getMessage() : "Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.",
                HttpStatus.INTERNAL_SERVER_ERROR,
                LocalDateTime.now()
        );
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
