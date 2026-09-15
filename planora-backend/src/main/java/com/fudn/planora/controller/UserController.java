package com.fudn.planora.controller;

import com.fudn.planora.dto.user.UserDTO;
import com.fudn.planora.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/profile")
    public UserDTO.ProfileResponse getMyProfile() {
        String email = getLoggedInUserEmail();
        return userService.getUserProfile(email);
    }

    @PutMapping("/profile")
    public UserDTO.ProfileResponse updateMyProfile(@RequestBody @Valid UserDTO.UpdateProfileRequest request){
        String email = getLoggedInUserEmail();
        return userService.updateProfile(email, request);
    }

    private String getLoggedInUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            return authentication.getName();
        }
        throw new RuntimeException("Người dùng chưa xác thực");
    }
}
