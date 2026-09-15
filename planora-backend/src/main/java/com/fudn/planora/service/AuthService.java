package com.fudn.planora.service;

import com.fudn.planora.dto.auth.AuthDTO;

public interface AuthService {
    AuthDTO.LoginResponse login(AuthDTO.LoginRequest request);

    AuthDTO.LoginResponse loginWithGoogle(AuthDTO.GoogleLoginRequest googleLoginRequest);

    AuthDTO.LoginResponse register(AuthDTO.RegisterRequest request);
}
