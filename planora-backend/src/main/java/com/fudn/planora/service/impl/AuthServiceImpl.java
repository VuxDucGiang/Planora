package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.LoginRequest;
import com.fudn.planora.dto.response.LoginResponse;
import com.fudn.planora.entity.User;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.security.JwtService;
import com.fudn.planora.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findUserByEmail(request.getEmail()).orElseThrow(() -> new RuntimeException("Email không tồn tại"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Password is incorrect!");
        }
        String token = jwtService.generateToken(user.getEmail());
        return new LoginResponse(token, "Bearer");
    }

}
