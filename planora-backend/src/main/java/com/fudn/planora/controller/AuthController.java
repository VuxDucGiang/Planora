package com.fudn.planora.controller;

import com.fudn.planora.dto.auth.AuthDTO;
import com.fudn.planora.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Quản lý đăng nhập, đăng ký và xác thực tài khoản")
public class AuthController {

    private final AuthService authService;

    @Operation(summary = "Đăng nhập bằng Email và Password", responses = {
            @ApiResponse(responseCode = "200", description = "Đăng nhập thành công, trả về JWT"),
            @ApiResponse(responseCode = "401", description = "Sai email hoặc mật khẩu")
    })
    @PostMapping("/login")
    public ResponseEntity<AuthDTO.LoginResponse> login(@RequestBody @Valid AuthDTO.LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @Operation(summary = "Đăng xuất tài khoản")
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Đăng xuất thành công"));
    }

    @Operation(summary = "Đăng nhập thông qua Google ID Token", responses = {
            @ApiResponse(responseCode = "200", description = "Đăng nhập Google thành công"),
            @ApiResponse(responseCode = "401", description = "Token Google không hợp lệ")
    })
    @PostMapping("/google")
    public ResponseEntity<AuthDTO.LoginResponse> loginWithGoogle(@RequestBody @Valid AuthDTO.GoogleLoginRequest googleLoginRequest) {
        return ResponseEntity.ok(authService.loginWithGoogle(googleLoginRequest));
    }

    @Operation(summary = "Đăng ký tài khoản người dùng hoặc nhà cung cấp", responses = {
            @ApiResponse(responseCode = "201", description = "Tạo tài khoản thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc email đã tồn tại")
    })
    @PostMapping("/register")
    public ResponseEntity<AuthDTO.LoginResponse> register(@RequestBody @Valid AuthDTO.RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }
}
