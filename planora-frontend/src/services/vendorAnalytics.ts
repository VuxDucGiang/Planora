import type { VendorAnalyticsResponse } from '@/types/vendor';

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

export async function getVendorAnalytics(): Promise<VendorAnalyticsResponse> {
  const response = await fetch('/api/vendor/analytics', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải dữ liệu thống kê của nhà cung cấp');
  }

  return response.json();
}
