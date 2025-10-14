'use client';

/**
 * Permission Manager Component
 * Admin interface for managing user permissions
 */

import React, { useState, useEffect } from 'react';
import { Shield, Check, X, Loader2, User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { RoleService } from '@/lib/auth/services/role-service';
import { UserService } from '@/lib/auth/services/user-service';
import { RoleBadge } from './RoleBadge';
import { UserAvatar } from './UserAvatar';
import { PERMISSION_CATEGORIES, PERMISSION_DISPLAY_NAMES, PERMISSION_DESCRIPTIONS } from '@/lib/auth/utils/permissions';
import type { UserRole, UserProfile, Permission } from '@/lib/auth/config/auth-types';

interface PermissionManagerProps {
  className?: string;
}

export const PermissionManager: React.FC<PermissionManagerProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [userPermissions, setUserPermissions] = useState<Permission[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Load users
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const { users: usersData, error } = await UserService.getAllUsers();
      
      if (error) {
        toast({
          title: 'Lỗi tải danh sách người dùng',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setUsers(usersData || []);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: 'Lỗi tải danh sách người dùng',
        description: 'Đã xảy ra lỗi không mong muốn',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  // Load user permissions
  const loadUserPermissions = async (userId: string) => {
    try {
      const { permissions, error } = await RoleService.getUserPermissions(userId);
      
      if (error) {
        toast({
          title: 'Lỗi tải quyền người dùng',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      setUserPermissions(permissions || []);
    } catch (error) {
      console.error('Error loading user permissions:', error);
      toast({
        title: 'Lỗi tải quyền người dùng',
        description: 'Đã xảy ra lỗi không mong muốn',
        variant: 'destructive',
      });
    }
  };

  // Handle user selection
  const handleUserSelect = (user: UserProfile) => {
    setSelectedUser(user);
    loadUserPermissions(user.id);
  };

  // Handle permission toggle
  const handlePermissionToggle = async (permission: Permission) => {
    if (!selectedUser) return;

    try {
      // This would require a new API endpoint to update individual permissions
      // For now, we'll show a message
      toast({
        title: 'Tính năng đang phát triển',
        description: 'Cập nhật quyền riêng lẻ sẽ được thêm trong phiên bản tiếp theo',
      });
    } catch (error) {
      console.error('Error toggling permission:', error);
      toast({
        title: 'Lỗi cập nhật quyền',
        description: 'Đã xảy ra lỗi không mong muốn',
        variant: 'destructive',
      });
    }
  };

  // Filter users
  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if user has permission
  const hasPermission = (permission: Permission): boolean => {
    return userPermissions.includes(permission) || userPermissions.includes('admin:all');
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Quản lý quyền người dùng
            </h2>
            <p className="text-sm text-gray-600">
              Xem và quản lý quyền của từng người dùng
            </p>
          </div>
          <Button onClick={loadUsers} variant="outline" size="sm">
            Làm mới
          </Button>
        </div>
      </div>

      <div className="flex">
        {/* Users List */}
        <div className="w-1/3 border-r border-gray-200">
          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Input
                type="text"
                placeholder="Tìm kiếm người dùng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Users */}
          <div className="divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <div
                key={user.id}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedUser?.id === user.id ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                }`}
                onClick={() => handleUserSelect(user)}
              >
                <div className="flex items-center space-x-3">
                  <UserAvatar
                    src={user.avatar_url}
                    alt={user.full_name || user.email}
                    initials={user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                    size="sm"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {user.full_name || 'Không có tên'}
                    </h3>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <RoleBadge role={user.role} size="sm" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="flex-1 p-6">
          {selectedUser ? (
            <div>
              {/* Selected User Info */}
              <div className="flex items-center space-x-4 mb-6">
                <UserAvatar
                  src={selectedUser.avatar_url}
                  alt={selectedUser.full_name || selectedUser.email}
                  initials={selectedUser.full_name ? selectedUser.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  size="lg"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedUser.full_name || 'Không có tên'}
                  </h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <RoleBadge role={selectedUser.role} size="md" />
                </div>
              </div>

              {/* Permissions by Category */}
              <div className="space-y-6">
                {Object.entries(PERMISSION_CATEGORIES).map(([categoryKey, category]) => (
                  <div key={categoryKey} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">{category.icon}</span>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {category.name}
                      </h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.permissions.map((permission) => (
                        <div
                          key={permission}
                          className={`flex items-center justify-between p-3 rounded-lg border ${
                            hasPermission(permission)
                              ? 'bg-green-50 border-green-200'
                              : 'bg-gray-50 border-gray-200'
                          }`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              {hasPermission(permission) ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-sm font-medium text-gray-900">
                                {PERMISSION_DISPLAY_NAMES[permission]}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 mt-1">
                              {PERMISSION_DESCRIPTIONS[permission]}
                            </p>
                          </div>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePermissionToggle(permission)}
                            disabled={permission === 'admin:all'}
                          >
                            {hasPermission(permission) ? 'Tắt' : 'Bật'}
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Chọn người dùng
              </h3>
              <p className="text-gray-600">
                Chọn một người dùng từ danh sách bên trái để xem và quản lý quyền
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};















