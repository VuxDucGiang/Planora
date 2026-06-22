package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.AddressRequest;
import com.fudn.planora.dto.request.UpdateProfileRequest;
import com.fudn.planora.dto.response.UserProfileResponse;
import com.fudn.planora.entity.User;
import com.fudn.planora.entity.UserAddress;
import com.fudn.planora.repository.UserAddressRepository;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserAddressRepository addressRepository;

    @Override
    public UserProfileResponse getUserProfile(String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng"));

        // Cập nhật thông tin cơ bản
        if (request.getFullname() != null) user.setFullname(request.getFullname());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());

        // Cập nhật Địa chỉ nếu có gửi
        if (request.getAddress() != null) {
            AddressRequest addressRequest = request.getAddress();
            UserAddress address = user.getUserAddress();

            if (address == null) {
                address = UserAddress.builder().user(user).build();
            }

            address.setCity(addressRequest.getCity());
            address.setDistrict(addressRequest.getDistrict());
            address.setWard(addressRequest.getWard());
            address.setDetailAddress(addressRequest.getDetailAddress());

            addressRepository.save(address);
            user.setUserAddress(address);
        }

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    // Helper mapper thủ công (có thể thay thế bằng MapStruct sau này)
    private UserProfileResponse mapToResponse(User user) {
        UserProfileResponse.AddressResponse addrResp = null;
        if (user.getUserAddress() != null) {
            UserAddress address = user.getUserAddress();
            addrResp = UserProfileResponse.AddressResponse.builder()
                    .city(address.getCity())
                    .district(address.getDistrict())
                    .ward(address.getWard())
                    .detailAddress(address.getDetailAddress())
                    .build();
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullname(user.getFullname())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole().getRoleName().name())
                .provider(user.getEUserProvider().name())
                .status(user.getEUserStatus().name())
                .address(addrResp)
                .build();
    }
}
