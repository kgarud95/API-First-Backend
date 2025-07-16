export enum UserRole {
  STUDENT = 'student',
  INSTRUCTOR = 'instructor',
  ADMIN = 'admin',
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: UserRole;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthResponse {
  user: UserProfile;
  accessToken: string;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}