'use client';

import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useRoles } from '@/lib/auth/hooks/useRoles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Users, UserCheck, Settings, ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function AdminPage() {
  const { user, userProfile, loading } = useAuth();
  const { canAccessAdmin, currentRole, roleDisplayName } = useRoles();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Cần đăng nhập</h1>
          <p className="text-gray-600 mb-6">Bạn cần đăng nhập để truy cập admin panel</p>
          <Link href="/auth/login">
            <Button>Đăng nhập ngay</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!canAccessAdmin()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không có quyền truy cập</h1>
          <p className="text-gray-600 mb-6">Bạn không có quyền admin để truy cập trang này</p>
          <p className="text-sm text-gray-500 mb-6">
            Quyền hiện tại: <span className="font-semibold">{roleDisplayName}</span>
          </p>
          <Link href="/dashboard">
            <Button variant="outline">Quay lại Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-600" />
              <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            </div>
            <Link href="/dashboard">
              <Button variant="outline" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Quay lại Dashboard
              </Button>
            </Link>
          </div>
          <p className="text-gray-600">
            Chào mừng {userProfile?.full_name || user.email} - {roleDisplayName}
          </p>
        </div>

        {/* Admin Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Quản lý thành viên */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Quản Lý Thành Viên
              </CardTitle>
              <CardDescription>
                Xem và quản lý tất cả thành viên trong hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/members">
                <Button className="w-full">Truy cập</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Duyệt đăng ký */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-orange-600" />
                Duyệt Đăng Ký
              </CardTitle>
              <CardDescription>
                Duyệt và phê duyệt các đăng ký thành viên mới
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/admin/members-new">
                <Button className="w-full">Truy cập</Button>
              </Link>
            </CardContent>
          </Card>

          {/* Cài đặt hệ thống */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-purple-600" />
                Cài Đặt Hệ Thống
              </CardTitle>
              <CardDescription>
                Cấu hình và quản lý các thiết lập hệ thống
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" disabled>
                Sắp có
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Thông Tin Hệ Thống</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Admin</div>
                  <div className="text-sm text-gray-600">Quyền hiện tại</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Active</div>
                  <div className="text-sm text-gray-600">Trạng thái tài khoản</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">Full</div>
                  <div className="text-sm text-gray-600">Quyền truy cập</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}