import type {
  InquirySummary,
  InquiryDetail,
  InquiryMessage,
  CreateInquiryRequest,
  InquiryStatus,
} from '@/types/inquiry';

function getAuthHeaders(): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('planora_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

// ================= CUSTOMER APIS =================

export async function createOrGetInquiry(
  data: CreateInquiryRequest
): Promise<InquiryDetail> {
  const response = await fetch('/api/inquiries', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = 'Không thể gửi yêu cầu tư vấn';
    try {
      const err = await response.json();
      if (err.message) msg = err.message;
    } catch {
      // ignore
    }
    throw new Error(msg);
  }

  return response.json();
}

export async function getMyCustomerInquiries(): Promise<InquirySummary[]> {
  const response = await fetch('/api/inquiries/my', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let msg = 'Không thể tải danh sách cuộc hội thoại';
    try {
      const err = await response.json();
      if (err.message) msg = err.message;
    } catch {
      // ignore
    }
    throw new Error(`[${response.status}] ${msg}`);
  }

  return response.json();
}

export async function getCustomerInquiryDetail(
  inquiryId: number
): Promise<InquiryDetail> {
  const response = await fetch(`/api/inquiries/${inquiryId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải chi tiết cuộc hội thoại');
  }

  return response.json();
}

export async function sendCustomerMessage(
  inquiryId: number,
  message: string
): Promise<InquiryMessage> {
  const response = await fetch(`/api/inquiries/${inquiryId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error('Không thể gửi tin nhắn');
  }

  return response.json();
}

// ================= VENDOR APIS =================

export async function getVendorInquiries(): Promise<InquirySummary[]> {
  const response = await fetch('/api/vendor/inquiries', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách yêu cầu tư vấn');
  }

  return response.json();
}

export async function getVendorInquiryDetail(
  inquiryId: number
): Promise<InquiryDetail> {
  const response = await fetch(`/api/vendor/inquiries/${inquiryId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải chi tiết yêu cầu tư vấn');
  }

  return response.json();
}

export async function sendVendorMessage(
  inquiryId: number,
  message: string
): Promise<InquiryMessage> {
  const response = await fetch(`/api/vendor/inquiries/${inquiryId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    throw new Error('Không thể gửi phản hồi cho khách hàng');
  }

  return response.json();
}

export async function updateInquiryStatus(
  inquiryId: number,
  status: InquiryStatus
): Promise<void> {
  const response = await fetch(
    `/api/vendor/inquiries/${inquiryId}/status?status=${status}`,
    {
      method: 'PATCH',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Không thể cập nhật trạng thái yêu cầu');
  }
}

