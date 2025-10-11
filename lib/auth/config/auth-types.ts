// lib/auth/config/auth-types.ts

export interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name?: string;
  role: 'admin' | 'user';
  permissions?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdateData {
  full_name?: string;
  role?: 'admin' | 'user';
  permissions?: string[];
}

export interface AuthUser {
  id: string;
  email: string;
  user_metadata?: {
    full_name?: string;
    role?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}