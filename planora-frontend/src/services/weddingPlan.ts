import type { 
  WeddingStyle, 
  ServiceCategory, 
  OnboardingRequest, 
  ActivePlanResponse 
} from '@/types/weddingPlan';

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

export async function getWeddingStyles(): Promise<WeddingStyle[]> {
  const response = await fetch('/api/wedding-styles', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách phong cách đám cưới');
  }

  return response.json();
}

export async function getServiceCategories(): Promise<ServiceCategory[]> {
  const response = await fetch('/api/service-categories', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách dịch vụ ưu tiên');
  }

  return response.json();
}

export async function createOnboardingPlan(request: OnboardingRequest): Promise<ActivePlanResponse> {
  const response = await fetch('/api/wedding-plans/onboarding', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = 'Tạo kế hoạch cưới thất bại. Vui lòng kiểm tra lại!';
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      }
    } catch {}
    throw new Error(errorMessage);
  }

  return response.json();
}

export async function getActivePlan(): Promise<ActivePlanResponse | null> {
  const response = await fetch('/api/wedding-plans/active', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (response.status === 404 || response.status === 500) {
    // If backend throws an exception for no active plan, return null
    return null;
  }

  if (!response.ok) {
    // Other errors
    throw new Error('Không thể tải thông tin kế hoạch cưới hiện tại');
  }

  return response.json();
}
