'use client';

/**
 * User Profile Page
 * User profile management and settings
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Phone, Calendar, Shield, Save, Upload, Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/auth/providers/SupabaseAuthProvider';
import { useUser } from '@/lib/auth/hooks/useUserSimple';
import { useRoles } from '@/lib/auth/hooks/useRolesSimple';
import { UserAvatar } from '@/components/auth/ui/UserAvatar';
import { RoleBadge } from '@/components/auth/ui/RoleBadge';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';
import { ClientProviders } from '@/components/providers/ClientProviders';
import type { ProfileUpdateData } from '@/lib/auth/config/auth-types';

function ProfilePageContent() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, updateProfile } = useAuth();
  const { profile, displayName, avatarUrl, initials, isVerified, createdAt, lastSignIn } = useUser();
  const { currentRole, roleDisplayName } = useRoles();
  
  const [formData, setFormData] = useState<ProfileUpdateData>({
    full_name: '',
    phone: '',
    avatar_url: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
        avatar_url: profile.avatar_url || '',
      });
    }
  }, [profile]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Lỗi',
        description: 'Chỉ được phép tải lên file ảnh',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: 'Lỗi',
        description: 'Kích thước file không được vượt quá 5MB',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);
    
    try {
      // Here you would upload the file to your storage service
      // For now, we'll just show a message
      toast({
        title: 'Tính năng đang phát triển',
        description: 'Tải lên ảnh đại diện sẽ được thêm trong phiên bản tiếp theo',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Lỗi tải lên ảnh',
        description: 'Đã xảy ra lỗi không mong muốn',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    
    try {
      const { error } = await updateProfile(formData);
      
      if (error) {
        toast({
          title: 'Lỗi cập nhật',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Cập nhật thành công',
        description: 'Thông tin cá nhân đã được cập nhật',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Lỗi cập nhật',
        description: 'Đã xảy ra lỗi không mong muốn',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <User className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Hồ sơ cá nhân
                </h1>
                <p className="text-sm text-gray-600">
                  Quản lý thông tin tài khoản
                </p>
              </div>
            </div>
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
            >
              Quay lại Dashboard
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin tài khoản</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Avatar */}
                <div className="text-center">
                  <div className="relative inline-block">
                    <UserAvatar
                      src={avatarUrl}
                      alt={displayName}
                      initials={initials}
                      size="xl"
                    />
                    <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
                      <Camera className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mt-4">
                    {displayName}
                  </h3>
                  <p className="text-gray-600">{user?.email}</p>
                  <RoleBadge role={currentRole} size="md" />
                </div>

                {/* Account Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Trạng thái</span>
                    <span className={`text-sm font-medium ${
                      isVerified ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {isVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Ngày tạo</span>
                    <span className="text-sm text-gray-900">
                      {createdAt ? new Date(createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Đăng nhập cuối</span>
                    <span className="text-sm text-gray-900">
                      {lastSignIn ? new Date(lastSignIn).toLocaleDateString('vi-VN') : 'N/A'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Cập nhật thông tin</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Full Name */}
                  <div>
                    <Label htmlFor="full_name">Họ tên</Label>
                    <div className="relative mt-1">
                      <Input
                        id="full_name"
                        name="full_name"
                        type="text"
                        value={formData.full_name}
                        onChange={handleInputChange}
                        placeholder="Nhập họ tên"
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <div className="relative mt-1">
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="pl-10 bg-gray-50"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Email không thể thay đổi
                    </p>
                  </div>

                  {/* Phone */}
                  <div>
                    <Label htmlFor="phone">Số điện thoại</Label>
                    <div className="relative mt-1">
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0123456789"
                        className="pl-10"
                        disabled={isSubmitting}
                      />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Role (Read-only) */}
                  <div>
                    <Label htmlFor="role">Vai trò</Label>
                    <div className="relative mt-1">
                      <Input
                        id="role"
                        type="text"
                        value={roleDisplayName}
                        disabled
                        className="pl-10 bg-gray-50"
                      />
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Vai trò được quản lý bởi quản trị viên
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Save className="w-4 h-4 mr-2 animate-spin" />
                          Đang cập nhật...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Cập nhật thông tin
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <ClientProviders>
      <ProfilePageContent />
    </ClientProviders>
  );
}

// Export without user route protection temporarily
export default ProfilePage;
