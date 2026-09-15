package com.fudn.planora.service.impl;

import com.fudn.planora.dto.auth.AuthDTO;
import com.fudn.planora.model.User;
import com.fudn.planora.model.User.Role;
import com.fudn.planora.enums.ERole;
import com.fudn.planora.enums.EUserProvider;
import com.fudn.planora.enums.EUserStatus;
import com.fudn.planora.exceptions.PlanoraException;
import com.fudn.planora.exceptions.RegistrationException;
import com.fudn.planora.exceptions.ResourceNotFoundException;
import com.fudn.planora.repository.RoleRepository;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.security.jwt.JwtTokenService;
import com.fudn.planora.service.AuthService;
import com.fudn.planora.utils.ExceptionMessageAccessor;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenService jwtTokenService;
    private final ExceptionMessageAccessor exceptionMessageAccessor;

    @Value("${app.google.client-id:}")
    private String googleClientId;

    @Override
    public AuthDTO.LoginResponse login(AuthDTO.LoginRequest request) {
        User user = userRepository.findUserByEmail(request.getEmail())
                .orElseThrow(() -> new BadCredentialsException(
                        exceptionMessageAccessor.getMessage(null, "invalid_username_or_password")));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException(
                    exceptionMessageAccessor.getMessage(null, "invalid_username_or_password"));
        }

        return jwtTokenService.createLoginResponse(user);
    }

    @Override
    public AuthDTO.LoginResponse loginWithGoogle(AuthDTO.GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory())
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();

            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new PlanoraException("Google ID Token không hợp lệ hoặc đã hết hạn!", HttpStatus.UNAUTHORIZED);
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

            User user = userRepository.findUserByEmail(email)
                    .map(existingUser -> {
                        existingUser.setFullname(name);
                        existingUser.setAvatarUrl(pictureUrl);
                        return userRepository.save(existingUser);
                    })
                    .orElseGet(() -> {
                        Role userRole = roleRepository.findByRoleName(ERole.USER)
                                .orElseThrow(() -> new ResourceNotFoundException("Role USER không tồn tại trong hệ thống"));

                        User newUser = User.builder()
                                .email(email)
                                .fullname(name)
                                .avatarUrl(pictureUrl)
                                .role(userRole)
                                .eUserProvider(EUserProvider.GOOGLE)
                                .eUserStatus(EUserStatus.ACTIVE)
                                .build();
                        return userRepository.save(newUser);
                    });

            return jwtTokenService.createLoginResponse(user);
        } catch (PlanoraException e) {
            throw e;
        } catch (Exception e) {
            log.error("Google authentication error: ", e);
            throw new PlanoraException(
                    exceptionMessageAccessor.getMessage(null, "google_auth_failed", e.getMessage()),
                    HttpStatus.UNAUTHORIZED
            );
        }
    }

    @Override
    @Transactional
    public AuthDTO.LoginResponse register(AuthDTO.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RegistrationException(
                    exceptionMessageAccessor.getMessage(null, "email_already_exists", request.getEmail()));
        }

        ERole roleEnum;
        try {
            roleEnum = ERole.valueOf(request.getRole().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new RegistrationException(
                    exceptionMessageAccessor.getMessage(null, "invalid_role"));
        }

        Role role = roleRepository.findByRoleName(roleEnum)
                .orElseThrow(() -> new ResourceNotFoundException(
                        exceptionMessageAccessor.getMessage(null, "role_not_found", roleEnum.name())));

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullname(request.getFullname())
                .phone(request.getPhone())
                .role(role)
                .eUserProvider(EUserProvider.LOCAL)
                .eUserStatus(EUserStatus.ACTIVE)
                .build();

        userRepository.save(user);
        log.info("User registered successfully: {}", user.getEmail());

        return jwtTokenService.createLoginResponse(user);
    }
}

