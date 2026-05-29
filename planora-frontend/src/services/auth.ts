import type { LoginRequest, LoginResponse, User } from '../types/auth';

export async function login(request: LoginRequest): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    let errorMessage = 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin!';
    try {
      const errorData = await response.json();
      if (errorData && typeof errorData.message === 'string') {
        errorMessage = errorData.message;
      } else if (errorData && typeof errorData.error === 'string') {
        errorMessage = errorData.error;
      }
    } catch {
      if (response.statusText) {
        errorMessage = response.statusText;
      }
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export function parseToken(token: string): User | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    return {
      email: payload.sub || '',
      fullName: payload.sub ? payload.sub.split('@')[0] : 'User',
      role: 'USER', // Default fallback role
    };
  } catch (e) {
    console.error('Error parsing token:', e);
    return null;
  }
}
