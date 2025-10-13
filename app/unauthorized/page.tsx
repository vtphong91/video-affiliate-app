'use client';

import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnauthorizedPage() {
  const { user, userProfile, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    window.location.href = '/auth/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            Truy cập bị từ chối
          </CardTitle>
          <p className="text-slate-600 mt-2">
            Bạn không có quyền truy cập vào trang này
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {userProfile && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h3 className="font-semibold text-slate-900 mb-2">Thông tin tài khoản:</h3>
              <div className="space-y-1 text-sm text-slate-600">
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Tên:</strong> {userProfile.full_name}</p>
                <p><strong>Vai trò:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    userProfile.role === 'admin' ? 'bg-red-100 text-red-700' :
                    userProfile.role === 'editor' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {userProfile.role === 'admin' ? 'Quản trị viên' :
                     userProfile.role === 'editor' ? 'Biên tập viên' :
                     'Người xem'}
                  </span>
                </p>
                <p><strong>Trạng thái:</strong> 
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    userProfile.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {userProfile.is_active ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Button asChild className="w-full">
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Về trang chủ
              </Link>
            </Button>
            
            <Button variant="outline" asChild className="w-full">
              <Link href="/auth/login">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Đăng nhập lại
              </Link>
            </Button>

            {user && (
              <Button variant="destructive" onClick={handleLogout} className="w-full">
                Đăng xuất
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-slate-500">
            <p>Nếu bạn nghĩ đây là lỗi, vui lòng liên hệ quản trị viên</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
