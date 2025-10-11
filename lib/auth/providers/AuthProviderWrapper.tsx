'use client';

import React, { ReactNode } from 'react';
import { SimpleAuthProvider } from './SimpleAuthProvider';
import { SupabaseAuthProvider } from './SupabaseAuthProvider';

interface AuthProviderWrapperProps {
  children: ReactNode;
  useSupabase?: boolean;
}

export function AuthProviderWrapper({ children, useSupabase = false }: AuthProviderWrapperProps) {
  if (useSupabase) {
    return <SupabaseAuthProvider>{children}</SupabaseAuthProvider>;
  }
  
  return <SimpleAuthProvider>{children}</SimpleAuthProvider>;
}







