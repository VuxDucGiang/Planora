package com.fudn.planora.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorCompareResponse {
    private List<VendorDetailResponse> vendors;
    private Integer totalCompared;
}
