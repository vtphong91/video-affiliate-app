'use client';

/**
 * Login Page
 * Standalone login page
 */

import React, { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoginForm } from '@/components/auth/forms/LoginForm';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useToast } from '@/components/ui/use-toast';
import { ClientProviders } from '@/components/providers/ClientProviders';
import { clearSupabaseCache } from '@/lib/utils/clear-cache';
import { Button } from '@/components/ui/button';

function LoginPageContent() {
  return (
    <ClientProviders>
      <LoginPageForm />
    </ClientProviders>
  );
}

function LoginPageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { toast } = useToast();

  // Check if user is already authenticated
  useEffect(() => {
    console.log('🔍 LoginPage useEffect - loading:', loading, 'user:', user?.email);
    if (!loading && user) {
      console.log('🔍 User already authenticated, redirecting to dashboard');
      // Check if there's a redirect parameter
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      // Don't decode if it's already decoded
      const finalRedirect = redirectTo.startsWith('%') ? decodeURIComponent(redirectTo) : redirectTo;
      console.log('🔍 Redirecting to:', finalRedirect);
      // Use router.push for safer redirect
      router.push(finalRedirect);
    }
  }, [user, loading, searchParams, router]);

  // Handle success
  const handleSuccess = () => {
    const redirectTo = searchParams.get('redirect') || '/dashboard';
    // Decode URL-encoded characters
    const decodedRedirect = decodeURIComponent(redirectTo);
    console.log('Login success handler - redirecting to:', decodedRedirect);
    // Use router.push for safer redirect
    router.push(decodedRedirect);
  };

  // Handle switch to register
  const handleSwitchToRegister = () => {
    router.push('/auth/register');
  };

  // Handle forgot password
  const handleForgotPassword = () => {
    router.push('/auth/forgot-password');
  };

  // Handle clear cache
  const handleClearCache = () => {
    clearSupabaseCache();
    toast({
      title: "Cache Cleared",
      description: "Supabase cache and cookies have been cleared. Please try logging in again.",
    });
    // Reload the page
    window.location.reload();
  };

  // Show message if redirected from register
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'check-email') {
      toast({
        title: 'Kiểm tra email',
        description: 'Vui lòng kiểm tra email để xác nhận tài khoản',
      });
    }
  }, [searchParams, toast]);

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show login form
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <LoginForm
          onSuccess={handleSuccess}
          onSwitchToRegister={handleSwitchToRegister}
          onForgotPassword={handleForgotPassword}
        />
        
        {/* Debug button */}
        <div className="text-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleClearCache}
            className="text-xs text-gray-500"
          >
            Clear Cache & Reload
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <LoginPageContent />;
}
