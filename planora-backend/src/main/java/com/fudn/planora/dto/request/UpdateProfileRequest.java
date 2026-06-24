package com.fudn.planora.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {
    private String fullname;
    private String phone;
    private String avatarUrl;
    private AddressRequest address;
}
