package com.fudn.planora.controller;

import com.fudn.planora.dto.request.ChangePasswordRequest;
import com.fudn.planora.dto.request.UpdateProfileRequest;
import com.fudn.planora.dto.response.UserProfileResponse;
import com.fudn.planora.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public UserProfileResponse getMyProfile() {
        String email = getLoggedInUserEmail();
        return userService.getUserProfile(email);
    }

    @PutMapping("/profile")
    public UserProfileResponse updateMyProfile(@RequestBody @Valid UpdateProfileRequest request){
        String email = getLoggedInUserEmail();
        return userService.updateProfile(email,request);
    }

    @PutMapping("/change-password")
    public Map<String, String> changePassword(@RequestBody @Valid ChangePasswordRequest request) {
        String email = getLoggedInUserEmail();
        userService.changePassword(email, request);
        return Map.of("message", "Đổi mật khẩu thành công!");
    }

    private String getLoggedInUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("Người dùng chưa xác thực");
    }
}
