'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface SimpleAuthProviderProps {
  children: ReactNode;
}

export function SimpleAuthProvider({ children }: SimpleAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for existing session in localStorage
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    // Mock authentication - in real app, this would call your auth API
    if (email === 'admin@example.com' && password === 'admin123') {
      const mockUser: User = {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${mockUser.id}; path=/; max-age=86400; samesite=strict`;
      
      setLoading(false);
      return { success: true, user: mockUser };
    } else if (email === 'vtphong91@gmail.com' && password === 'admin123') {
      const mockUser: User = {
        id: '3',
        email: 'vtphong91@gmail.com',
        name: 'Phong Admin',
        role: 'admin',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${mockUser.id}; path=/; max-age=86400; samesite=strict`;
      
      setLoading(false);
      return { success: true, user: mockUser };
    } else if (email === 'user@example.com' && password === 'user123') {
      const mockUser: User = {
        id: '2',
        email: 'user@example.com',
        name: 'Regular User',
        role: 'user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setUser(mockUser);
      localStorage.setItem('auth_user', JSON.stringify(mockUser));
      
      // Set auth cookie for middleware
      document.cookie = `auth_token=${mockUser.id}; path=/; max-age=86400; samesite=strict`;
      
      setLoading(false);
      return { success: true, user: mockUser };
    }
    
    setLoading(false);
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    
    // Clear auth cookie
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    return { success: true };
  };

  const register = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    // Mock registration
    const mockUser: User = {
      id: Date.now().toString(),
      email,
      name,
      role: 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    setUser(mockUser);
    localStorage.setItem('auth_user', JSON.stringify(mockUser));
    setLoading(false);
    
    return { success: true, user: mockUser };
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Admin has all permissions
    if (user.role === 'admin') return true;
    
    // Basic user permissions
    const userPermissions = [
      'read:reviews',
      'write:reviews',
      'read:schedules',
      'write:schedules',
      'read:profile',
      'write:profile'
    ];
    
    return userPermissions.includes(permission);
  };

  const updateProfile = async (data: any) => {
    if (!user) return { error: { message: 'User not authenticated' } };
    
    // Mock profile update
    const updatedUser = {
      ...user,
      name: data.full_name || user.name,
      updated_at: new Date().toISOString()
    };
    
    setUser(updatedUser);
    localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    
    return { error: null };
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    register,
    hasRole,
    hasPermission,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a SimpleAuthProvider');
  }
  return context;
}