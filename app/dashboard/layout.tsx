'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Video, List, Settings, Tag, Home, Calendar, PlusCircle, LayoutDashboard } from 'lucide-react';
import { AuthButton } from '@/components/auth/ui/AuthButton';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { withDashboardRoute } from '@/lib/auth/middleware/route-protection';
import { ClientProviders } from '@/components/providers/ClientProviders';

function DashboardLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, userProfile, loading } = useAuth();
  
  // Debug logging
  console.log('DashboardLayout - user:', user, 'userProfile:', userProfile, 'loading:', loading);
  console.log('DashboardLayout - user type:', typeof user, 'user exists:', !!user);
  console.log('DashboardLayout - userProfile type:', typeof userProfile, 'userProfile exists:', !!userProfile);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cần đăng nhập</h1>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để truy cập dashboard</p>
          <a 
            href="/auth/login" 
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Đăng nhập ngay
          </a>
        </div>
      </div>
    );
  }

  return (
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2">
              <Video className="h-6 w-6 text-blue-600" />
              <span className="text-xl font-bold">VideoAffiliate</span>
            </Link>
            {/* User info and logout - always show AuthButton */}
            <div className="flex items-center gap-2">
              {user && (
                <span className="text-sm text-gray-600 hidden sm:inline">
                  {userProfile?.full_name || user.email || 'User'}
                </span>
              )}
              <AuthButton showText={false} variant="ghost" size="sm" />
            </div>
          </nav>
        </div>
      </header>

      {/* Sidebar + Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="w-64 flex-shrink-0">
            <nav className="space-y-1">
              <Link href="/" target="_blank">
                <Button variant="ghost" className="w-full justify-start">
                  <Home className="h-4 w-4 mr-2" />
                  Trang Chủ
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/dashboard/create">
                <Button variant="ghost" className="w-full justify-start">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Tạo Review
                </Button>
              </Link>
              <Link href="/dashboard/reviews">
                <Button variant="ghost" className="w-full justify-start">
                  <List className="h-4 w-4 mr-2" />
                  Reviews
                </Button>
              </Link>
              <Link href="/dashboard/schedules">
                <Button variant="ghost" className="w-full justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  Lịch Đăng Bài
                </Button>
              </Link>
              <Link href="/dashboard/categories">
                <Button variant="ghost" className="w-full justify-start">
                  <Tag className="h-4 w-4 mr-2" />
                  Danh Mục
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button variant="ghost" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Cài Đặt
                </Button>
              </Link>
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">{children}</main>
        </div>
      </div>
      </div>
  );
}

function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientProviders useSupabase={true}>
      <DashboardLayoutContent>{children}</DashboardLayoutContent>
    </ClientProviders>
  );
}

// Export with dashboard route protection
export default withDashboardRoute(DashboardLayout);
