'use client';

/**
 * Role Manager Component
 * Admin interface for managing user roles
 */

import React, { useState, useEffect } from 'react';
import { Shield, User, Eye, Edit, Save, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { RoleService } from '@/lib/auth/services/role-service';
import { UserService } from '@/lib/auth/services/user-service';
import { RoleBadge } from './RoleBadge';
import { UserAvatar } from './UserAvatar';
import type { UserRole, UserProfile } from '@/lib/auth/config/auth-types';

interface RoleManagerProps {
  className?: string;
}

export const RoleManager: React.FC<RoleManagerProps> = ({ className = '' }) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('user');
  const [reason, setReason] = useState('');
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

  // Handle role change
  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      const { error } = await RoleService.assignRole(userId, role, undefined, reason);
      
      if (error) {
        toast({
          title: 'Lỗi phân quyền',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Phân quyền thành công',
        description: `Đã thay đổi vai trò thành ${RoleService.getRoleDisplayName(role)}`,
      });

      // Reload users
      await loadUsers();
      setEditingUser(null);
      setReason('');
    } catch (error) {
      console.error('Error changing role:', error);
      toast({
        title: 'Lỗi phân quyền',
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

  // Get role icon
  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'user':
        return <User className="w-4 h-4" />;
      case 'guest':
        return <Eye className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
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
              Quản lý vai trò người dùng
            </h2>
            <p className="text-sm text-gray-600">
              Phân quyền và quản lý vai trò của người dùng
            </p>
          </div>
          <Button onClick={loadUsers} variant="outline" size="sm">
            Làm mới
          </Button>
        </div>
      </div>

      {/* Search */}
      <div className="p-6 border-b border-gray-200">
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

      {/* Users List */}
      <div className="divide-y divide-gray-200">
        {filteredUsers.map((user) => (
          <div key={user.id} className="p-6">
            <div className="flex items-center justify-between">
              {/* User Info */}
              <div className="flex items-center space-x-4">
                <UserAvatar
                  src={user.avatar_url}
                  alt={user.full_name || user.email}
                  initials={user.full_name ? user.full_name.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                  size="md"
                />
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {user.full_name || 'Không có tên'}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    {getRoleIcon(user.role)}
                    <RoleBadge role={user.role} size="sm" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                {editingUser === user.id ? (
                  <div className="flex items-center space-x-2">
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value as UserRole)}
                      className="px-3 py-1 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="guest">Khách</option>
                      <option value="user">Người dùng</option>
                      <option value="admin">Quản trị viên</option>
                    </select>
                    <Input
                      type="text"
                      placeholder="Lý do thay đổi"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      className="w-32 text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleRoleChange(user.id, newRole)}
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingUser(null);
                        setReason('');
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingUser(user.id);
                      setNewRole(user.role);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredUsers.length === 0 && (
        <div className="p-6 text-center">
          <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Không có người dùng nào
          </h3>
          <p className="text-gray-600">
            {searchTerm ? 'Không tìm thấy người dùng phù hợp' : 'Chưa có người dùng nào trong hệ thống'}
          </p>
        </div>
      )}
    </div>
  );
};










