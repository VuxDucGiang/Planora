package com.fudn.planora.security.jwt;

import com.fudn.planora.dto.auth.AuthDTO;
import com.fudn.planora.model.User;
import com.fudn.planora.security.utils.SecurityConstants;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class JwtTokenService {

    private final JwtTokenManager jwtTokenManager;

    public AuthDTO.LoginResponse createLoginResponse(User user) {
        String roleName = user.getRole() != null && user.getRole().getRoleName() != null
                ? user.getRole().getRoleName().name()
                : "USER";
        String token = jwtTokenManager.generateToken(user.getEmail(), roleName);
        log.info("User {} successfully generated token with role {}", user.getEmail(), roleName);
        return new AuthDTO.LoginResponse(token, SecurityConstants.TOKEN_PREFIX.trim());
    }

    public AuthDTO.LoginResponse createLoginResponse(String email) {
        String token = jwtTokenManager.generateToken(email);
        return new AuthDTO.LoginResponse(token, SecurityConstants.TOKEN_PREFIX.trim());
    }
}

