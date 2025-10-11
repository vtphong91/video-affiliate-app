'use client';

/**
 * Auth Wrapper Component
 * Wraps the entire app with AuthProvider
 */

import React from 'react';
import { SimpleAuthProvider } from './SimpleAuthProvider';
import { Toaster } from '@/components/ui/toaster';

interface AuthWrapperProps {
  children: React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  return (
    <SimpleAuthProvider>
      {children}
      <Toaster />
    </SimpleAuthProvider>
  );
};

export default AuthWrapper;
