package com.fudn.planora.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateInquiryRequest {

    private Long weddingPlanId;

    @NotNull(message = "ID Nhà cung cấp không được để trống!")
    private Long vendorId;

    private String title;

    @NotBlank(message = "Nội dung tin nhắn không được để trống!")
    private String message;
}

