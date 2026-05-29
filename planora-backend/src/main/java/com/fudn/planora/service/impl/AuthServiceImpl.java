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
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.fudn.planora.dto.request.GoogleLoginRequest;
import com.fudn.planora.entity.Role;
import com.fudn.planora.repository.RoleRepository;
import com.fudn.planora.enums.ERole;
import com.fudn.planora.enums.EUserProvider;
import com.fudn.planora.enums.EUserStatus;
import org.springframework.beans.factory.annotation.Value;

import java.util.Collections;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
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

    @Value("${app.google.client-id}")
    private String googleClientId;

    @Override
    public LoginResponse loginWithGoogle(GoogleLoginRequest request) {
        try {
            // Khởi tạo bộ xác thực Token của Google
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(),
                    new GsonFactory()
            )
                    .setAudience(Collections.singletonList(googleClientId))
                    .build();
            // Verify Token nhận được từ Frontend
            GoogleIdToken idToken = verifier.verify(request.getIdToken());
            if (idToken == null) {
                throw new RuntimeException("Google ID Token không hợp lệ hoặc đã hết hạn!");
            }
            // Trích xuất thông tin User từ Google Payload
            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");
            // Kiểm tra xem User đã tồn tại trong DB chưa
            User user = userRepository.findUserByEmail(email)
                    .map(existingUser -> {
                        // Nếu user đã tồn tại, cập nhật avatar và tên nếu có thay đổi
                        existingUser.setFullname(name);
                        existingUser.setAvatarUrl(pictureUrl);
                        return userRepository.save(existingUser);
                    })
                    .orElseGet(() -> {
                        // Nếu user chưa tồn tại, tìm Role USER và gán cho user mới
                        Role userRole = roleRepository.findByRoleName(ERole.USER)
                                .orElseThrow(() -> new RuntimeException("Lỗi: Role USER không tồn tại!"));
                        // Tạo mới với Provider là GOOGLE
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
            // Sinh JWT của hệ thống chúng ta dựa trên email
            String token = jwtService.generateToken(user.getEmail());
            return new LoginResponse(token, "Bearer");
        } catch (Exception e) {
            throw new RuntimeException("Xác thực Google thất bại: " + e.getMessage(), e);
        }
    }

}
