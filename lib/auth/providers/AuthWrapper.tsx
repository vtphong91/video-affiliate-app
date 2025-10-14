'use client';

/**
 * Auth Wrapper Component
 * Wraps the entire app with AuthProvider
 */

import React from 'react';
import { SupabaseAuthProvider } from '../SupabaseAuthProvider';
import { Toaster } from '@/components/ui/toaster';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <SupabaseAuthProvider>
      {children}
      <Toaster />
    </SupabaseAuthProvider>
  );
};

export default AuthWrapper;
