import type { 
  VendorResponse, 
  VendorDetailResponse, 
  VendorMatchResponse, 
  VendorFilters 
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

export async function getVendors(filters: VendorFilters): Promise<{ content: VendorResponse[]; totalPages: number; totalElements: number }> {
  const queryParams = new URLSearchParams();
  if (filters.query) queryParams.append('query', filters.query);
  if (filters.categoryId) queryParams.append('categoryId', filters.categoryId.toString());
  if (filters.city) queryParams.append('city', filters.city);
  if (filters.styleId) queryParams.append('styleId', filters.styleId.toString());
  if (filters.priceFrom) queryParams.append('priceFrom', filters.priceFrom.toString());
  if (filters.priceTo) queryParams.append('priceTo', filters.priceTo.toString());
  if (filters.page !== undefined) queryParams.append('page', filters.page.toString());
  if (filters.size !== undefined) queryParams.append('size', filters.size.toString());

  const response = await fetch(`/api/vendors?${queryParams.toString()}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách nhà cung cấp');
  }

  return response.json();
}

export async function getVendorDetail(vendorId: number): Promise<VendorDetailResponse> {
  const response = await fetch(`/api/vendors/${vendorId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải chi tiết nhà cung cấp');
  }

  return response.json();
}

export async function getShortlist(planId: number): Promise<VendorResponse[]> {
  const response = await fetch(`/api/wedding-plans/${planId}/shortlist`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách yêu thích');
  }

  return response.json();
}

export async function addToShortlist(planId: number, vendorId: number): Promise<void> {
  const response = await fetch(`/api/wedding-plans/${planId}/shortlist?vendorId=${vendorId}`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể lưu nhà cung cấp');
  }
}

export async function removeFromShortlist(planId: number, vendorId: number): Promise<void> {
  const response = await fetch(`/api/wedding-plans/${planId}/shortlist/${vendorId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể xoá nhà cung cấp khỏi danh sách yêu thích');
  }
}

export async function getMatches(planId: number): Promise<VendorMatchResponse[]> {
  const response = await fetch(`/api/wedding-plans/${planId}/matches`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải gợi ý nhà cung cấp');
  }

  return response.json();
}
