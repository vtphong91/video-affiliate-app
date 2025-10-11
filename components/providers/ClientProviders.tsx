'use client';

import { AuthProviderWrapper } from '@/lib/auth/providers/AuthProviderWrapper';
import { SettingsProvider } from '@/lib/contexts/settings-context';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

interface ClientProvidersProps {
  children: React.ReactNode;
  useSupabase?: boolean;
}

export function ClientProviders({ children, useSupabase = false }: ClientProvidersProps) {
  return (
    <ErrorBoundary>
      <SettingsProvider>
        <AuthProviderWrapper useSupabase={useSupabase}>
          {children}
          <Toaster />
        </AuthProviderWrapper>
      </SettingsProvider>
    </ErrorBoundary>
  );
}
