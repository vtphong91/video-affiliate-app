'use client';

import { ReactNode } from 'react';
import { SupabaseAuthProvider } from '@/lib/auth/SupabaseAuthProvider';
import { SettingsProvider } from '@/lib/contexts/settings-context';
import { ReactQueryProvider } from '@/lib/providers/ReactQueryProvider';
import { Toaster } from '@/components/ui/toaster';

interface ClientProvidersProps {
  children: ReactNode;
}

export function ClientProviders({ children }: ClientProvidersProps) {
  return (
    <ReactQueryProvider>
      <SupabaseAuthProvider>
        <SettingsProvider>
          {children}
          <Toaster />
        </SettingsProvider>
      </SupabaseAuthProvider>
    </ReactQueryProvider>
  );
}







