import type {
  VendorReviewStatsResponse,
  ReviewResponse,
} from '@/types/vendor';

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

export async function getMyVendorReviews(): Promise<VendorReviewStatsResponse> {
  const response = await fetch('/api/vendor/reviews', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách đánh giá của khách hàng');
  }

  return response.json();
}

export async function replyToReview(
  reviewId: number,
  reply: string
): Promise<ReviewResponse> {
  const response = await fetch(`/api/vendor/reviews/${reviewId}/reply`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ reply }),
  });

  if (!response.ok) {
    let msg = 'Không thể gửi phản hồi đánh giá';
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

export async function deleteReviewReply(reviewId: number): Promise<void> {
  const response = await fetch(`/api/vendor/reviews/${reviewId}/reply`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể xóa phản hồi đánh giá');
  }
}
