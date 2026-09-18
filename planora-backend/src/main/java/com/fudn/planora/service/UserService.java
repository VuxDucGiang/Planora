package com.fudn.planora.service;

import com.fudn.planora.dto.request.UpdateProfileRequest;
import com.fudn.planora.dto.response.UserProfileResponse;

public interface UserService {
    UserProfileResponse getUserProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
}
