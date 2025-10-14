'use client';

import { useAuth as useSimpleAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useToast } from './useToast';

export function useAuth() {
  const auth = useSimpleAuth();
  const { success, error } = useToast();

  const loginWithToast = async (email: string, password: string) => {
    try {
      const result = await auth.login(email, password);
      
      if (result.success) {
        success('Đăng nhập thành công!');
        return result;
      } else {
        error(result.error || 'Đăng nhập thất bại');
        return result;
      }
    } catch (err: any) {
      error(err.message || 'Đăng nhập thất bại');
      throw err;
    }
  };

  const logoutWithToast = async () => {
    try {
      await auth.logout();
      success('Đăng xuất thành công!');
      return { success: true };
    } catch (err: any) {
      error(err.message || 'Đăng xuất thất bại');
      return { success: false, error: err.message };
    }
  };

  const registerWithToast = async (email: string, password: string, name: string) => {
    try {
      const result = await auth.register(email, password, name);
      
      if (result.success) {
        success('Đăng ký thành công!');
        return result;
      } else {
        error(result.error || 'Đăng ký thất bại');
        return result;
      }
    } catch (err: any) {
      error(err.message || 'Đăng ký thất bại');
      throw err;
    }
  };

  return {
    ...auth,
    login: loginWithToast,
    logout: logoutWithToast,
    register: registerWithToast,
  };
}






