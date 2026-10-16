import type { 
  AdminSummaryResponse, 
  AdminFunnelResponse, 
  PaginatedActivities, 
  UserJourneyResponse,
  AIInsightResponse,
  DormantAnalysisResponse
} from '@/types/admin';

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

export async function getAdminSummary(): Promise<AdminSummaryResponse> {
  const res = await fetch('/api/admin/dashboard/summary', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải số liệu tổng quan');
  }
  return res.json();
}

export async function getAdminFunnel(): Promise<AdminFunnelResponse> {
  const res = await fetch('/api/admin/dashboard/funnel', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải dữ liệu phễu chuyển đổi');
  }
  return res.json();
}

export async function getAdminActivities(page = 0, size = 20): Promise<PaginatedActivities> {
  const res = await fetch(`/api/admin/dashboard/activities?page=${page}&size=${size}`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải nhật ký hoạt động');
  }
  return res.json();
}

export async function getUserJourney(userId: number): Promise<UserJourneyResponse> {
  const res = await fetch(`/api/admin/dashboard/users/${userId}/journey`, {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải lịch sử hành trình người dùng');
  }
  return res.json();
}

export async function getAIInsights(): Promise<AIInsightResponse> {
  const res = await fetch('/api/admin/dashboard/ai-insights', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải số liệu AI & Insight thị trường');
  }
  return res.json();
}

export async function getDormantAnalysis(): Promise<DormantAnalysisResponse> {
  const res = await fetch('/api/admin/dashboard/dormant-users', {
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    throw new Error('Không thể tải dữ liệu tài khoản ngủ đông');
  }
  return res.json();
}
