'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { Activity, Clock, User, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AuditLogsPage() {
  const { userProfile, hasRole } = useAuth();

  // Check if user is admin
  if (!hasRole('admin')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Không có quyền truy cập</CardTitle>
            <CardDescription>
              Bạn cần quyền admin để xem trang này.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Nhật Ký Hoạt Động</h1>
        <p className="text-gray-600 mt-1">
          Xem lịch sử hoạt động và thay đổi trong hệ thống
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm Kiếm & Lọc
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Tìm kiếm theo người dùng, hành động..."
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Tìm Kiếm
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Nhật Ký Hoạt Động
          </CardTitle>
          <CardDescription>
            Lịch sử các thay đổi và hoạt động trong hệ thống
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-medium mb-2">Chưa có nhật ký</p>
              <p className="text-sm">
                Nhật ký hoạt động sẽ được hiển thị ở đây khi có hoạt động trong hệ thống.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>Thông Báo</CardTitle>
          <CardDescription>
            Tính năng nhật ký đang được phát triển
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700">
            Tính năng xem nhật ký hoạt động chi tiết sẽ được thêm vào trong các phiên bản tiếp theo.
            Hiện tại hệ thống đang tự động ghi lại các hoạt động quan trọng vào database.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

