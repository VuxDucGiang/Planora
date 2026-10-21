package com.fudn.planora.controller;

import com.fudn.planora.dto.request.ReplyReviewRequest;
import com.fudn.planora.dto.response.ReviewResponse;
import com.fudn.planora.dto.response.VendorReviewStatsResponse;
import com.fudn.planora.service.VendorReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/vendor/reviews")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR') or hasRole('ADMIN')")
public class VendorReviewController {

    private final VendorReviewService vendorReviewService;

    @GetMapping
    public ResponseEntity<VendorReviewStatsResponse> getMyReviews(
            @AuthenticationPrincipal String email
    ) {
        VendorReviewStatsResponse response = vendorReviewService.getMyVendorReviews(email);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<ReviewResponse> replyToReview(
            @AuthenticationPrincipal String email,
            @PathVariable Long reviewId,
            @Valid @RequestBody ReplyReviewRequest request
    ) {
        ReviewResponse response = vendorReviewService.replyToReview(email, reviewId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reviewId}/reply")
    public ResponseEntity<Map<String, String>> deleteReply(
            @AuthenticationPrincipal String email,
            @PathVariable Long reviewId
    ) {
        vendorReviewService.deleteReply(email, reviewId);
        return ResponseEntity.ok(Map.of("message", "Đã xóa phản hồi thành công!"));
    }
}
