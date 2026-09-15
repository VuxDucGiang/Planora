package com.fudn.planora.controller;

import com.fudn.planora.dto.user.UserDTO;
import com.fudn.planora.service.UserService;
import com.fudn.planora.utils.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Quản lý thông tin cá nhân của người dùng")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;

    @Operation(summary = "Lấy thông tin trang cá nhân của người dùng hiện tại", responses = {
            @ApiResponse(responseCode = "200", description = "Lấy profile thành công"),
            @ApiResponse(responseCode = "401", description = "Chưa xác thực")
    })
    @GetMapping("/profile")
    public ResponseEntity<UserDTO.ProfileResponse> getMyProfile() {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    @Operation(summary = "Cập nhật thông tin trang cá nhân", responses = {
            @ApiResponse(responseCode = "200", description = "Cập nhật thành công"),
            @ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ")
    })
    @PutMapping("/profile")
    public ResponseEntity<UserDTO.ProfileResponse> updateMyProfile(@RequestBody @Valid UserDTO.UpdateProfileRequest request) {
        String email = SecurityUtils.getCurrentUserEmail();
        return ResponseEntity.ok(userService.updateProfile(email, request));
    }
}
