package com.fudn.planora.controller;

import com.fudn.planora.dto.request.GoogleLoginRequest;
import com.fudn.planora.dto.request.LoginRequest;
import com.fudn.planora.dto.request.RegisterRequest;
import com.fudn.planora.dto.response.LoginResponse;
import com.fudn.planora.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public String logout() {
        return "Logout Succesfully";
    }

    @PostMapping("/google")
    public LoginResponse loginWithGoogle(@RequestBody @Valid GoogleLoginRequest googleLoginRequest) {
        return authService.loginWithGoogle(googleLoginRequest);
    }

    @PostMapping("/register")

    public LoginResponse register(@RequestBody @Valid RegisterRequest request) {
        return authService.register(request);

    }
}
