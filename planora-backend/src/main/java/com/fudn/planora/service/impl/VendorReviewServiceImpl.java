package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.ReplyReviewRequest;
import com.fudn.planora.dto.response.ReviewResponse;
import com.fudn.planora.dto.response.VendorReviewStatsResponse;
import com.fudn.planora.entity.Review;
import com.fudn.planora.entity.User;
import com.fudn.planora.entity.Vendor;
import com.fudn.planora.repository.ReviewRepository;
import com.fudn.planora.repository.UserRepository;
import com.fudn.planora.repository.VendorRepository;
import com.fudn.planora.service.VendorReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class VendorReviewServiceImpl implements VendorReviewService {

    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final ReviewRepository reviewRepository;

    private Vendor getVendorByEmail(String email) {
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có email: " + email));

        return vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa đăng ký hồ sơ Nhà cung cấp!"));
    }

    @Override
    @Transactional(readOnly = true)
    public VendorReviewStatsResponse getMyVendorReviews(String email) {
        Vendor vendor = getVendorByEmail(email);
        List<Review> reviews = reviewRepository.findByVendorId(vendor.getId());

        long fiveStar = reviews.stream().filter(r -> r.getRating() != null && r.getRating() == 5).count();
        long fourStar = reviews.stream().filter(r -> r.getRating() != null && r.getRating() == 4).count();
        long threeStar = reviews.stream().filter(r -> r.getRating() != null && r.getRating() == 3).count();
        long twoStar = reviews.stream().filter(r -> r.getRating() != null && r.getRating() == 2).count();
        long oneStar = reviews.stream().filter(r -> r.getRating() != null && r.getRating() == 1).count();

        List<ReviewResponse> reviewResponses = reviews.stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToReviewResponse)
                .collect(Collectors.toList());

        return VendorReviewStatsResponse.builder()
                .totalReviews(vendor.getTotalReviews() != null ? vendor.getTotalReviews() : reviews.size())
                .ratingAverage(vendor.getRatingAverage() != null ? vendor.getRatingAverage() : 0.0)
                .fiveStarCount(fiveStar)
                .fourStarCount(fourStar)
                .threeStarCount(threeStar)
                .twoStarCount(twoStar)
                .oneStarCount(oneStar)
                .reviews(reviewResponses)
                .build();
    }

    @Override
    @Transactional
    public ReviewResponse replyToReview(String email, Long reviewId, ReplyReviewRequest request) {
        Vendor vendor = getVendorByEmail(email);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá có ID: " + reviewId));

        if (!review.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền phản hồi đánh giá này!");
        }

        review.setVendorReply(request.getReply().trim());
        review.setRepliedAt(LocalDateTime.now());
        Review saved = reviewRepository.save(review);

        return mapToReviewResponse(saved);
    }

    @Override
    @Transactional
    public void deleteReply(String email, Long reviewId) {
        Vendor vendor = getVendorByEmail(email);
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đánh giá có ID: " + reviewId));

        if (!review.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên đánh giá này!");
        }

        review.setVendorReply(null);
        review.setRepliedAt(null);
        reviewRepository.save(review);
    }

    private ReviewResponse mapToReviewResponse(Review review) {
        User customer = review.getCustomer();
        return ReviewResponse.builder()
                .id(review.getId())
                .customerId(customer != null ? customer.getId() : null)
                .customerName(customer != null ? customer.getFullname() : "Khách hàng")
                .customerAvatar(customer != null ? customer.getAvatarUrl() : null)
                .rating(review.getRating())
                .comment(review.getComment())
                .vendorReply(review.getVendorReply())
                .repliedAt(review.getRepliedAt())
                .createdAt(review.getCreatedAt())
                .build();
    }
}
