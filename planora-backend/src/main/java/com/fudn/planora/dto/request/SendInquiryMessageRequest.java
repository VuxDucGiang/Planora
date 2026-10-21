package com.fudn.planora.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SendInquiryMessageRequest {

    @NotBlank(message = "Nội dung tin nhắn không được để trống!")
    private String message;
}

