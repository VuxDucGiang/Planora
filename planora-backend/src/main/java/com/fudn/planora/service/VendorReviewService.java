package com.fudn.planora.service;

import com.fudn.planora.dto.request.ReplyReviewRequest;
import com.fudn.planora.dto.response.ReviewResponse;
import com.fudn.planora.dto.response.VendorReviewStatsResponse;

public interface VendorReviewService {

    VendorReviewStatsResponse getMyVendorReviews(String email);

    ReviewResponse replyToReview(String email, Long reviewId, ReplyReviewRequest request);

    void deleteReply(String email, Long reviewId);
}
