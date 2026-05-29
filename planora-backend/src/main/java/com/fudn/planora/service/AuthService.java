package com.fudn.planora.service;

import com.fudn.planora.dto.request.GoogleLoginRequest;
import com.fudn.planora.dto.request.LoginRequest;
import com.fudn.planora.dto.response.LoginResponse;

public interface AuthService {
    LoginResponse login(LoginRequest request);

    LoginResponse loginWithGoogle(GoogleLoginRequest googleLoginRequestquest);
}
