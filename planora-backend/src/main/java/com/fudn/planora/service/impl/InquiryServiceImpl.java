package com.fudn.planora.service.impl;

import com.fudn.planora.dto.request.CreateInquiryRequest;
import com.fudn.planora.dto.request.SendInquiryMessageRequest;
import com.fudn.planora.dto.response.InquiryDetailResponse;
import com.fudn.planora.dto.response.InquiryMessageResponse;
import com.fudn.planora.dto.response.InquirySummaryResponse;
import com.fudn.planora.entity.*;
import com.fudn.planora.enums.EInquiryStatus;
import com.fudn.planora.enums.EWeddingPlanStatus;
import com.fudn.planora.repository.*;
import com.fudn.planora.service.InquiryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class InquiryServiceImpl implements InquiryService {

    private final InquiryRepository inquiryRepository;
    private final InquiryMessageRepository messageRepository;
    private final UserRepository userRepository;
    private final VendorRepository vendorRepository;
    private final WeddingPlanRepository weddingPlanRepository;

    private User getUserByEmail(String email) {
        return userRepository.findUserByEmail(email)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy người dùng có email: " + email));
    }

    private Vendor getVendorByEmail(String email) {
        User user = getUserByEmail(email);
        return vendorRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Tài khoản chưa đăng ký hồ sơ Nhà cung cấp!"));
    }

    private WeddingPlan resolveWeddingPlan(User customer, Long requestedPlanId) {
        if (requestedPlanId != null) {
            return weddingPlanRepository.findById(requestedPlanId)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy Kế hoạch cưới có ID: " + requestedPlanId));
        }

        // Tìm kế hoạch đang thực hiện hoặc kế hoạch mới nhất của user
        return weddingPlanRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(customer.getId(), EWeddingPlanStatus.PLANNING)
                .or(() -> weddingPlanRepository.findFirstByUserIdOrderByCreatedAtDesc(customer.getId()))
                .orElseGet(() -> {
                    // Nếu chưa có, tạo kế hoạch cưới mặc định
                    WeddingPlan defaultPlan = WeddingPlan.builder()
                            .user(customer)
                            .title("Kế hoạch cưới của " + customer.getFullname())
                            .status(EWeddingPlanStatus.PLANNING)
                            .build();
                    return weddingPlanRepository.save(defaultPlan);
                });
    }

    @Override
    @Transactional
    public InquiryDetailResponse createOrGetInquiry(String customerEmail, CreateInquiryRequest request) {
        User customer = getUserByEmail(customerEmail);
        Vendor vendor = vendorRepository.findById(request.getVendorId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Nhà cung cấp có ID: " + request.getVendorId()));

        WeddingPlan weddingPlan = resolveWeddingPlan(customer, request.getWeddingPlanId());

        // Kiểm tra xem đã có cuộc hội thoại nào giữa khách hàng và vendor này chưa
        Inquiry inquiry = inquiryRepository.findFirstByCustomerIdAndVendorIdOrderByUpdatedAtDesc(customer.getId(), vendor.getId())
                .orElseGet(() -> {
                    Inquiry newInquiry = Inquiry.builder()
                            .weddingPlan(weddingPlan)
                            .customer(customer)
                            .vendor(vendor)
                            .title(request.getTitle() != null ? request.getTitle().trim() : "Tư vấn dịch vụ cưới")
                            .message(request.getMessage().trim())
                            .status(EInquiryStatus.PENDING)
                            .build();
                    return inquiryRepository.save(newInquiry);
                });

        // Tạo tin nhắn mới
        InquiryMessage msg = InquiryMessage.builder()
                .inquiry(inquiry)
                .sender(customer)
                .message(request.getMessage().trim())
                .build();
        messageRepository.save(msg);

        inquiry.setStatus(EInquiryStatus.PENDING);
        inquiry.setUpdatedAt(LocalDateTime.now());
        Inquiry savedInquiry = inquiryRepository.save(inquiry);

        return mapToDetailResponse(savedInquiry);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InquirySummaryResponse> getMyCustomerInquiries(String customerEmail) {
        User customer = getUserByEmail(customerEmail);
        List<Inquiry> inquiries = inquiryRepository.findByCustomerIdOrderByUpdatedAtDesc(customer.getId());

        return inquiries.stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InquiryDetailResponse getCustomerInquiryDetail(String customerEmail, Long inquiryId) {
        User customer = getUserByEmail(customerEmail);
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại có ID: " + inquiryId));

        if (!inquiry.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền truy cập cuộc hội thoại này!");
        }

        return mapToDetailResponse(inquiry);
    }

    @Override
    @Transactional
    public InquiryMessageResponse sendCustomerMessage(String customerEmail, Long inquiryId, SendInquiryMessageRequest request) {
        User customer = getUserByEmail(customerEmail);
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại có ID: " + inquiryId));

        if (!inquiry.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này!");
        }

        InquiryMessage message = InquiryMessage.builder()
                .inquiry(inquiry)
                .sender(customer)
                .message(request.getMessage().trim())
                .build();
        InquiryMessage savedMessage = messageRepository.save(message);

        inquiry.setStatus(EInquiryStatus.PENDING);
        inquiry.setUpdatedAt(LocalDateTime.now());
        inquiryRepository.save(inquiry);

        return mapToMessageResponse(savedMessage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InquirySummaryResponse> getVendorInquiries(String vendorEmail) {
        Vendor vendor = getVendorByEmail(vendorEmail);
        List<Inquiry> inquiries = inquiryRepository.findByVendorIdOrderByUpdatedAtDesc(vendor.getId());

        return inquiries.stream()
                .map(this::mapToSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InquiryDetailResponse getVendorInquiryDetail(String vendorEmail, Long inquiryId) {
        Vendor vendor = getVendorByEmail(vendorEmail);
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại có ID: " + inquiryId));

        if (!inquiry.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền truy cập yêu cầu tư vấn này!");
        }

        return mapToDetailResponse(inquiry);
    }

    @Override
    @Transactional
    public InquiryMessageResponse sendVendorMessage(String vendorEmail, Long inquiryId, SendInquiryMessageRequest request) {
        Vendor vendor = getVendorByEmail(vendorEmail);
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại có ID: " + inquiryId));

        if (!inquiry.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền gửi tin nhắn trong cuộc hội thoại này!");
        }

        User vendorUser = vendor.getUser();
        InquiryMessage message = InquiryMessage.builder()
                .inquiry(inquiry)
                .sender(vendorUser)
                .message(request.getMessage().trim())
                .build();
        InquiryMessage savedMessage = messageRepository.save(message);

        inquiry.setStatus(EInquiryStatus.RESPONDED);
        inquiry.setUpdatedAt(LocalDateTime.now());
        inquiryRepository.save(inquiry);

        return mapToMessageResponse(savedMessage);
    }

    @Override
    @Transactional
    public void updateInquiryStatus(String vendorEmail, Long inquiryId, EInquiryStatus status) {
        Vendor vendor = getVendorByEmail(vendorEmail);
        Inquiry inquiry = inquiryRepository.findById(inquiryId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cuộc hội thoại có ID: " + inquiryId));

        if (!inquiry.getVendor().getId().equals(vendor.getId())) {
            throw new RuntimeException("Bạn không có quyền thay đổi trạng thái cuộc hội thoại này!");
        }

        inquiry.setStatus(status);
        inquiry.setUpdatedAt(LocalDateTime.now());
        inquiryRepository.save(inquiry);
    }

    private InquirySummaryResponse mapToSummaryResponse(Inquiry inquiry) {
        User customer = inquiry.getCustomer();
        Vendor vendor = inquiry.getVendor();
        WeddingPlan plan = inquiry.getWeddingPlan();

        List<InquiryMessage> msgs = inquiry.getMessages();
        String latestMessage = (msgs != null && !msgs.isEmpty())
                ? msgs.get(msgs.size() - 1).getMessage()
                : inquiry.getMessage();

        return InquirySummaryResponse.builder()
                .id(inquiry.getId())
                .weddingPlanId(plan != null ? plan.getId() : null)
                .customerId(customer.getId())
                .customerName(customer.getFullname())
                .customerAvatar(customer.getAvatarUrl())
                .customerPhone(customer.getPhone())
                .customerEmail(customer.getEmail())
                .vendorId(vendor.getId())
                .vendorName(vendor.getBusinessName())
                .vendorAvatar(vendor.getUser() != null ? vendor.getUser().getAvatarUrl() : null)
                .title(inquiry.getTitle())
                .latestMessage(latestMessage)
                .status(inquiry.getStatus().name())
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(inquiry.getUpdatedAt())
                .weddingDate(plan != null ? plan.getWeddingDate() : null)
                .guestCount(plan != null ? plan.getGuestCount() : null)
                .budget(plan != null ? plan.getBudget() : null)
                .location(plan != null ? plan.getLocation() : null)
                .build();
    }

    private InquiryDetailResponse mapToDetailResponse(Inquiry inquiry) {
        User customer = inquiry.getCustomer();
        Vendor vendor = inquiry.getVendor();
        WeddingPlan plan = inquiry.getWeddingPlan();

        List<InquiryMessage> messages = messageRepository.findByInquiryIdOrderByCreatedAtAsc(inquiry.getId());
        List<InquiryMessageResponse> messageResponses = messages.stream()
                .map(this::mapToMessageResponse)
                .collect(Collectors.toList());

        return InquiryDetailResponse.builder()
                .id(inquiry.getId())
                .weddingPlanId(plan != null ? plan.getId() : null)
                .customerId(customer.getId())
                .customerName(customer.getFullname())
                .customerAvatar(customer.getAvatarUrl())
                .customerPhone(customer.getPhone())
                .customerEmail(customer.getEmail())
                .vendorId(vendor.getId())
                .vendorName(vendor.getBusinessName())
                .vendorAvatar(vendor.getUser() != null ? vendor.getUser().getAvatarUrl() : null)
                .title(inquiry.getTitle())
                .status(inquiry.getStatus().name())
                .createdAt(inquiry.getCreatedAt())
                .updatedAt(inquiry.getUpdatedAt())
                .weddingDate(plan != null ? plan.getWeddingDate() : null)
                .guestCount(plan != null ? plan.getGuestCount() : null)
                .budget(plan != null ? plan.getBudget() : null)
                .location(plan != null ? plan.getLocation() : null)
                .messages(messageResponses)
                .build();
    }

    private InquiryMessageResponse mapToMessageResponse(InquiryMessage msg) {
        User sender = msg.getSender();
        String roleName = sender.getRole() != null && sender.getRole().getRoleName() != null
                ? sender.getRole().getRoleName().name()
                : "USER";

        return InquiryMessageResponse.builder()
                .id(msg.getId())
                .inquiryId(msg.getInquiry().getId())
                .senderId(sender.getId())
                .senderName(sender.getFullname())
                .senderRole(roleName)
                .senderAvatar(sender.getAvatarUrl())
                .message(msg.getMessage())
                .createdAt(msg.getCreatedAt())
                .build();
    }
}

