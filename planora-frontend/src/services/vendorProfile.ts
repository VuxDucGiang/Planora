import type {
  VendorProfileResponse,
  UpdateVendorProfileRequest,
  CreatePortfolioRequest,
  PortfolioResponse,
  FileUploadResponse,
  CollectionResponse,
  CollectionImageResponse,
  CreateCollectionRequest,
  UpdateCollectionRequest,
  AddCollectionImageRequest,
} from '@/types/vendor';

function getAuthHeaders(isMultipart = false): HeadersInit {
  const headers: HeadersInit = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('planora_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
}

export async function getVendorProfile(): Promise<VendorProfileResponse> {
  const response = await fetch('/api/vendor/profile', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải thông tin hồ sơ nhà cung cấp');
  }

  return response.json();
}

export async function updateVendorProfile(
  data: UpdateVendorProfileRequest
): Promise<VendorProfileResponse> {
  const response = await fetch('/api/vendor/profile', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = 'Không thể cập nhật hồ sơ nhà cung cấp';
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

export async function updateVendorAvatar(
  avatarUrl: string | null
): Promise<VendorProfileResponse> {
  const response = await fetch('/api/vendor/avatar', {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ avatarUrl: avatarUrl || '' }),
  });

  if (!response.ok) {
    let msg = 'Không thể cập nhật ảnh đại diện';
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

export async function uploadImage(
  file: File,
  folder: string = 'vendors'
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('folder', folder);

  const response = await fetch('/api/upload/image', {
    method: 'POST',
    headers: getAuthHeaders(true),
    body: formData,
  });

  if (!response.ok) {
    let msg = 'Không thể tải ảnh lên Cloudinary';
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

export async function getVendorPortfolios(): Promise<PortfolioResponse[]> {
  const response = await fetch('/api/vendor/portfolios', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải bộ sưu tập của nhà cung cấp');
  }

  return response.json();
}

export async function addVendorPortfolio(
  data: CreatePortfolioRequest
): Promise<PortfolioResponse> {
  const response = await fetch('/api/vendor/portfolios', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = 'Không thể thêm tác phẩm vào bộ sưu tập';
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

export async function deleteVendorPortfolio(portfolioId: number): Promise<void> {
  const response = await fetch(`/api/vendor/portfolios/${portfolioId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể xóa tác phẩm');
  }
}

// ==========================================
// MULTI-ALBUM COLLECTION SERVICES
// ==========================================

export async function getVendorCollections(): Promise<CollectionResponse[]> {
  const response = await fetch('/api/vendor/collections', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải danh sách bộ sưu tập');
  }

  return response.json();
}

export async function getVendorCollectionDetail(collectionId: number): Promise<CollectionResponse> {
  const response = await fetch(`/api/vendor/collections/${collectionId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải thông tin bộ sưu tập');
  }

  return response.json();
}

export async function createVendorCollection(
  data: CreateCollectionRequest
): Promise<CollectionResponse> {
  const response = await fetch('/api/vendor/collections', {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = 'Không thể tạo mới bộ sưu tập';
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

export async function updateVendorCollection(
  collectionId: number,
  data: UpdateCollectionRequest
): Promise<CollectionResponse> {
  const response = await fetch(`/api/vendor/collections/${collectionId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = 'Không thể cập nhật bộ sưu tập';
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

export async function deleteVendorCollection(collectionId: number): Promise<void> {
  const response = await fetch(`/api/vendor/collections/${collectionId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể xóa bộ sưu tập');
  }
}

export async function addCollectionImage(
  collectionId: number,
  data: AddCollectionImageRequest
): Promise<CollectionImageResponse> {
  const response = await fetch(`/api/vendor/collections/${collectionId}/images`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let msg = 'Không thể thêm ảnh vào bộ sưu tập';
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

export async function deleteCollectionImage(
  collectionId: number,
  imageId: number
): Promise<void> {
  const response = await fetch(`/api/vendor/collections/${collectionId}/images/${imageId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể xóa ảnh khỏi bộ sưu tập');
  }
}

export async function getAvailableWeddingStyles(): Promise<{ id: number; name: string }[]> {
  try {
    const response = await fetch('/api/wedding-styles', {
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
    { id: 1, name: 'Traditional' },
    { id: 2, name: 'Minimalist' },
    { id: 3, name: 'Luxury' },
    { id: 4, name: 'Garden' },
    { id: 5, name: 'Beach' },
    { id: 6, name: 'Rustic' },
  ];
}
