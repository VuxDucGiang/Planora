package com.fudn.planora.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorMatchResponse {
    private Long id;
    private VendorResponse vendor;
    private Double matchingScore;
    private String reason;
}