import type { BudgetResponse, BudgetItemResponse, UpdateBudgetItemRequest } from '@/types/budget';

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

export async function getBudget(planId: number): Promise<BudgetResponse> {
  const response = await fetch(`/api/wedding-plans/${planId}/budget`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải thông tin ngân sách');
  }

  return response.json();
}

export async function updateBudgetItem(itemId: number, request: UpdateBudgetItemRequest): Promise<BudgetItemResponse> {
  const response = await fetch(`/api/budget-items/${itemId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = 'Cập nhật hạng mục chi tiêu thất bại';
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
