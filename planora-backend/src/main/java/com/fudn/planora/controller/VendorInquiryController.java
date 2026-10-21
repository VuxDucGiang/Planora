package com.fudn.planora.controller;

import com.fudn.planora.dto.request.SendInquiryMessageRequest;
import com.fudn.planora.dto.response.InquiryDetailResponse;
import com.fudn.planora.dto.response.InquiryMessageResponse;
import com.fudn.planora.dto.response.InquirySummaryResponse;
import com.fudn.planora.enums.EInquiryStatus;
import com.fudn.planora.service.InquiryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vendor/inquiries")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
public class VendorInquiryController {

    private final InquiryService inquiryService;

    @GetMapping
    public ResponseEntity<List<InquirySummaryResponse>> getVendorInquiries(
            @AuthenticationPrincipal String email
    ) {
        List<InquirySummaryResponse> response = inquiryService.getVendorInquiries(email);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{inquiryId}")
    public ResponseEntity<InquiryDetailResponse> getVendorInquiryDetail(
            @AuthenticationPrincipal String email,
            @PathVariable Long inquiryId
    ) {
        InquiryDetailResponse response = inquiryService.getVendorInquiryDetail(email, inquiryId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{inquiryId}/messages")
    public ResponseEntity<InquiryMessageResponse> sendVendorMessage(
            @AuthenticationPrincipal String email,
            @PathVariable Long inquiryId,
            @Valid @RequestBody SendInquiryMessageRequest request
    ) {
        InquiryMessageResponse response = inquiryService.sendVendorMessage(email, inquiryId, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{inquiryId}/status")
    public ResponseEntity<Map<String, String>> updateInquiryStatus(
            @AuthenticationPrincipal String email,
            @PathVariable Long inquiryId,
            @RequestParam EInquiryStatus status
    ) {
        inquiryService.updateInquiryStatus(email, inquiryId, status);
        return ResponseEntity.ok(Map.of("message", "Cập nhật trạng thái yêu cầu thành công!"));
    }
}

