import type {
  VendorServiceDetailResponse,
  CreateVendorServiceRequest,
  CreatePackageRequest,
  PackageResponse,
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

export async function getMyVendorServices(): Promise<VendorServiceDetailResponse[]> {
  const response = await fetch('/api/vendor/services', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách dịch vụ của nhà cung cấp');
  }

  return response.json();
}

export async function createVendorService(
  data: CreateVendorServiceRequest
): Promise<VendorServiceDetailResponse> {
  const response = await fetch('/api/vendor/services', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = 'Không thể tạo dịch vụ mới';
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

export async function updateVendorService(
  serviceId: number,
  data: CreateVendorServiceRequest
): Promise<VendorServiceDetailResponse> {
  const response = await fetch(`/api/vendor/services/${serviceId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = 'Không thể cập nhật dịch vụ';
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

export async function deleteVendorService(serviceId: number): Promise<void> {
  const response = await fetch(`/api/vendor/services/${serviceId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể xóa dịch vụ');
  }
}

export async function addVendorPackage(
  serviceId: number,
  data: CreatePackageRequest
): Promise<PackageResponse> {
  const response = await fetch(`/api/vendor/services/${serviceId}/packages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = 'Không thể thêm gói dịch vụ';
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

export async function updateVendorPackage(
  serviceId: number,
  packageId: number,
  data: CreatePackageRequest
): Promise<PackageResponse> {
  const response = await fetch(
    `/api/vendor/services/${serviceId}/packages/${packageId}`,
    {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    let msg = 'Không thể cập nhật gói dịch vụ';
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

export async function deleteVendorPackage(
  serviceId: number,
  packageId: number
): Promise<void> {
  const response = await fetch(
    `/api/vendor/services/${serviceId}/packages/${packageId}`,
    {
      method: 'DELETE',
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error('Không thể xóa gói dịch vụ');
  }
}

export async function getServiceCategories(): Promise<{ id: number; name: string }[]> {
  try {
    const response = await fetch('/api/service-categories', {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    if (response.ok) {
      return response.json();
    }
  } catch {
    // fallback
  }

  return [
    { id: 1, name: 'Venue & Banquet' },
    { id: 2, name: 'Photography & Studio' },
    { id: 3, name: 'Bridal Dress & Tuxedo' },
    { id: 4, name: 'Wedding Decoration' },
    { id: 5, name: 'Makeup & Beauty' },
    { id: 6, name: 'Music & Band' },
    { id: 7, name: 'Wedding Planner' },
  ];
}

