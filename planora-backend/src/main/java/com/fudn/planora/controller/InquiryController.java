package com.fudn.planora.controller;

import com.fudn.planora.dto.request.CreateInquiryRequest;
import com.fudn.planora.dto.request.SendInquiryMessageRequest;
import com.fudn.planora.dto.response.InquiryDetailResponse;
import com.fudn.planora.dto.response.InquiryMessageResponse;
import com.fudn.planora.dto.response.InquirySummaryResponse;
import com.fudn.planora.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inquiries")
@RequiredArgsConstructor
public class InquiryController {

    private final InquiryService inquiryService;

    @PostMapping
    public ResponseEntity<InquiryDetailResponse> createOrGetInquiry(
            @AuthenticationPrincipal String email,
            @Valid @RequestBody CreateInquiryRequest request
    ) {
        InquiryDetailResponse response = inquiryService.createOrGetInquiry(email, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<InquirySummaryResponse>> getMyInquiries(
            @AuthenticationPrincipal String email
    ) {
        List<InquirySummaryResponse> response = inquiryService.getMyCustomerInquiries(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{inquiryId}")
    public ResponseEntity<InquiryDetailResponse> getInquiryDetail(
            @AuthenticationPrincipal String email,
            @PathVariable Long inquiryId
    ) {
        InquiryDetailResponse response = inquiryService.getCustomerInquiryDetail(email, inquiryId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{inquiryId}/messages")
    public ResponseEntity<InquiryMessageResponse> sendMessage(
            @AuthenticationPrincipal String email,
            @PathVariable Long inquiryId,
            @Valid @RequestBody SendInquiryMessageRequest request
    ) {
        InquiryMessageResponse response = inquiryService.sendCustomerMessage(email, inquiryId, request);
        return ResponseEntity.ok(response);
    }
}

