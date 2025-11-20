export interface User {
  id: string;
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  picture?: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface Address {
  id?: string;
  userId?: string;
  line1?: string;
  line2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}