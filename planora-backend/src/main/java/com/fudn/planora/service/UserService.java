package com.fudn.planora.service;

import com.fudn.planora.dto.user.UserDTO;

public interface UserService {
    UserDTO.ProfileResponse getUserProfile(String email);
    UserDTO.ProfileResponse updateProfile(String email, UserDTO.UpdateProfileRequest request);
}
