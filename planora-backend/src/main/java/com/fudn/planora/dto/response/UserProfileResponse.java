package com.fudn.planora.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private Long id;
    private String email;
    private String fullname;
    private String phone;
    private String avatarUrl;
    private String role;
    private String provider;
    private String status;
    private AddressResponse address;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressResponse {
        private String city;
        private String district;
        private String ward;
        private String detailAddress;
    }
}
