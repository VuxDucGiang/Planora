export interface User {
  email: string;
  fullName?: string;
  role?: string;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
}

export interface RegisterRequest {
  fullName: string;
  fullname?: string;
  username: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
}
