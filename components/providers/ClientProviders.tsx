'use client';

import { ReactNode } from 'react';
import { SupabaseAuthProvider } from '@/lib/auth/SupabaseAuthProvider';
import { SettingsProvider } from '@/lib/contexts/settings-context';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <SupabaseAuthProvider>
      <SettingsProvider>
        {children}
      </SettingsProvider>
    </SupabaseAuthProvider>
  );
}







