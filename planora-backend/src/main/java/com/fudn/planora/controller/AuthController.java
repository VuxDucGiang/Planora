package com.fudn.planora.controller;

import com.fudn.planora.dto.auth.AuthDTO;
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
    public AuthDTO.LoginResponse login(@RequestBody AuthDTO.LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/logout")
    public String logout() {
        return "Logout Succesfully";
    }

    @PostMapping("/google")
    public AuthDTO.LoginResponse loginWithGoogle(@RequestBody @Valid AuthDTO.GoogleLoginRequest googleLoginRequest) {
        return authService.loginWithGoogle(googleLoginRequest);
    }

    @PostMapping("/register")
    public AuthDTO.LoginResponse register(@RequestBody @Valid AuthDTO.RegisterRequest request) {
        return authService.register(request);
    }
}
