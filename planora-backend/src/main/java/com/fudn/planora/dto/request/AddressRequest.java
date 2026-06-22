package com.fudn.planora.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AddressRequest {
    private String city;
    private String district;
    private String ward;
    private String detailAddress;
    
}
