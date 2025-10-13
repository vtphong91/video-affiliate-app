'use client';

import { ReactNode } from 'react';
import { SupabaseAuthProvider } from '@/lib/auth/SupabaseAuthProvider';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SupabaseAuthProvider>
      {children}
    </SupabaseAuthProvider>
  );
}

