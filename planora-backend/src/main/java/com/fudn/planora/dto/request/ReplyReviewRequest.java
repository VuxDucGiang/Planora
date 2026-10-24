package com.fudn.planora.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReplyReviewRequest {

    @NotBlank(message = "Nội dung phản hồi không được để trống!")
    private String reply;
}
