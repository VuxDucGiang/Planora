package com.fudn.planora.service;

import com.fudn.planora.dto.request.CreateInquiryRequest;
import com.fudn.planora.dto.request.SendInquiryMessageRequest;
import com.fudn.planora.dto.response.InquiryDetailResponse;
import com.fudn.planora.dto.response.InquiryMessageResponse;
import com.fudn.planora.dto.response.InquirySummaryResponse;
import com.fudn.planora.enums.EInquiryStatus;

import java.util.List;

public interface InquiryService {

    // Customer Actions
    InquiryDetailResponse createOrGetInquiry(String customerEmail, CreateInquiryRequest request);

    List<InquirySummaryResponse> getMyCustomerInquiries(String customerEmail);

    InquiryDetailResponse getCustomerInquiryDetail(String customerEmail, Long inquiryId);

    InquiryMessageResponse sendCustomerMessage(String customerEmail, Long inquiryId, SendInquiryMessageRequest request);

    // Vendor Actions
    List<InquirySummaryResponse> getVendorInquiries(String vendorEmail);

    InquiryDetailResponse getVendorInquiryDetail(String vendorEmail, Long inquiryId);

    InquiryMessageResponse sendVendorMessage(String vendorEmail, Long inquiryId, SendInquiryMessageRequest request);

    void updateInquiryStatus(String vendorEmail, Long inquiryId, EInquiryStatus status);
}

