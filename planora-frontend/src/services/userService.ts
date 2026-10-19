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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserProfile {
  id: number;
  email: string;
  fullname: string;
  phone?: string;
  avatarUrl?: string;
  role: string;
  provider: string;
  status: string;
}

export async function getMyProfile(): Promise<UserProfile> {
  const response = await fetch('/api/users/profile', {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Không thể tải thông tin hồ sơ');
  }

  return response.json();
}

export async function changePassword(data: ChangePasswordRequest): Promise<{ message: string }> {
  const response = await fetch('/api/users/change-password', {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    let errorMessage = 'Đổi mật khẩu thất bại!';
    try {
      const errorData = await response.json();
      if (errorData?.message) errorMessage = errorData.message;
      else if (errorData?.error) errorMessage = errorData.error;
    } catch {
      if (response.statusText) errorMessage = response.statusText;
    }
    throw new Error(errorMessage);
  }

  return response.json();
}
