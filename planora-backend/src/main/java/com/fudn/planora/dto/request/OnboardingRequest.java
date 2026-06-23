package com.fudn.planora.dto.request;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class OnboardingRequest {
    @NotBlank(message = "Tiêu đề kế hoạch không được để trống")
    private String title;

    @NotBlank(message = "Ngày cưới không được để trống")
    private LocalDate weddingDate;

    @NotBlank(message = "Số lượng khách không được để trống")
    @Min(value = 1, message = "Số lượng khách phải lớn hơn 0")
    private Integer guestCount;

    @NotNull(message = "Tổng ngân sách không được để trống")
    @Min(value = 0, message = "Ngân sách không được là số âm")
    private BigDecimal budget;

    private Set<Long> styleIds;
    private Set<Long> priorityCategoryIds;


}
