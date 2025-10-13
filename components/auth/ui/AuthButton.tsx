'use client';

/**
 * Auth Button Component
 * Conditional login/logout button with user avatar
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogIn, LogOut, User, Settings, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';

interface AuthButtonProps {
  showText?: boolean;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AuthButton: React.FC<AuthButtonProps> = ({
  showText = true,
  variant = 'default',
  size = 'md',
  className = '',
}) => {
  const router = useRouter();
  const { user, logout, loading } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Debug logging
  console.log('AuthButton - user:', user, 'loading:', loading, 'mounted:', mounted);
  
  // Don't render until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        {showText && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  // Handle login
  const handleLogin = () => {
    router.push('/auth/login');
  };

  // Handle logout
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        {showText && <span className="ml-2">Loading...</span>}
      </Button>
    );
  }

  // Show logout button if user is authenticated
  if (user) {
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleLogout}
        disabled={isLoggingOut}
        title="Đăng xuất"
      >
        {isLoggingOut ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <LogOut className="w-4 h-4" />
        )}
        {showText && <span className="ml-2">Đăng xuất</span>}
      </Button>
    );
  }

  // Show login button if user is not authenticated
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleLogin}
    >
      <LogIn className="w-4 h-4" />
      {showText && <span className="ml-2">Đăng nhập</span>}
    </Button>
  );
};
