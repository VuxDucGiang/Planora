package com.fudn.planora.dto.user;

import lombok.*;

public class UserDTO {

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AddressRequest {
        private String city;
        private String district;
        private String ward;
        private String detailAddress;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class UpdateProfileRequest {
        private String fullname;
        private String phone;
        private String avatarUrl;
        private AddressRequest address;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ProfileResponse {
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
}
