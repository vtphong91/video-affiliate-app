'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Shield, 
  Plus, 
  Edit, 
  Trash2, 
  Users,
  CheckCircle,
  XCircle,
  Settings
} from 'lucide-react';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useRoles } from '@/lib/auth/hooks/useEnhancedRoles';
import { ROLE_DISPLAY_NAMES, ROLE_COLORS, PERMISSION_DESCRIPTIONS } from '@/lib/auth/config/auth-types';

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

interface CreateRoleData {
  name: string;
  display_name: string;
  description: string;
  permissions: string[];
}

export default function RoleManagement() {
  const { userProfile } = useAuth();
  const { canManageUsers, canAccessAdmin } = useRoles();
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // Create role form
  const [createForm, setCreateForm] = useState<CreateRoleData>({
    name: '',
    display_name: '',
    description: '',
    permissions: []
  });

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/admin/roles');
      const data = await response.json();

      if (data.success) {
        setRoles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await fetch('/api/admin/permissions');
      const data = await response.json();

      if (data.success) {
        setPermissions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      const response = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm)
      });

      const data = await response.json();
      
      if (data.success) {
        setCreateDialogOpen(false);
        setCreateForm({ name: '', display_name: '', description: '', permissions: [] });
        fetchRoles();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      console.error('Error creating role:', error);
      alert('Có lỗi xảy ra khi tạo vai trò');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa vai trò này?')) return;

    try {
      const response = await fetch(`/api/admin/roles/${roleId}`, {
        method: 'DELETE'
      });

      const data = await response.json();
      
      if (data.success) {
        fetchRoles();
      } else {
        alert('Lỗi: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting role:', error);
      alert('Có lỗi xảy ra khi xóa vai trò');
    }
  };

  const openEditDialog = (role: Role) => {
    setSelectedRole(role);
    setEditDialogOpen(true);
  };

  const getRoleColor = (roleName: string) => {
    switch (roleName) {
      case 'admin': return 'bg-red-100 text-red-800 border-red-200';
      case 'editor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'viewer': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const togglePermission = (permission: string) => {
    if (createForm.permissions.includes(permission)) {
      setCreateForm(prev => ({
        ...prev,
        permissions: prev.permissions.filter(p => p !== permission)
      }));
    } else {
      setCreateForm(prev => ({
        ...prev,
        permissions: [...prev.permissions, permission]
      }));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!canManageUsers() && !canAccessAdmin()) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có quyền truy cập</h3>
        <p className="text-gray-500">Bạn cần quyền quản lý thành viên để truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý vai trò</h1>
          <p className="text-gray-600">Quản lý vai trò và quyền hạn trong hệ thống</p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Thêm vai trò
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Thêm vai trò mới</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tên vai trò</label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="custom_role"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tên hiển thị</label>
                  <Input
                    value={createForm.display_name}
                    onChange={(e) => setCreateForm(prev => ({ ...prev, display_name: e.target.value }))}
                    placeholder="Vai trò tùy chỉnh"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <Input
                  value={createForm.description}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Mô tả vai trò này..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Quyền hạn</label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-3">
                    {permissions.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          id={permission.id}
                          checked={createForm.permissions.includes(permission.name)}
                          onChange={() => togglePermission(permission.name)}
                          className="rounded border-gray-300"
                        />
                        <label htmlFor={permission.id} className="flex-1">
                          <div className="font-medium">{permission.display_name}</div>
                          <div className="text-sm text-gray-500">{permission.description}</div>
                        </label>
                        <Badge variant="outline" className="text-xs">
                          {permission.resource}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                  Hủy
                </Button>
                <Button onClick={handleCreateRole}>
                  Tạo vai trò
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          roles.map((role) => (
            <Card key={role.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{role.display_name}</CardTitle>
                  <Badge className={getRoleColor(role.name)}>
                    {role.name}
                  </Badge>
                </div>
                {role.is_system_role && (
                  <Badge variant="outline" className="w-fit">
                    <Settings className="h-3 w-3 mr-1" />
                    Hệ thống
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 text-sm mb-4">{role.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="text-sm font-medium text-gray-700">Quyền hạn:</div>
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((permission) => (
                      <Badge key={permission} variant="secondary" className="text-xs">
                        {PERMISSION_DESCRIPTIONS[permission as keyof typeof PERMISSION_DESCRIPTIONS] || permission}
                      </Badge>
                    ))}
                    {role.permissions.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{role.permissions.length - 3} khác
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-500 mb-4">
                  Tạo: {formatDate(role.created_at)}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-500">0 thành viên</span>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(role)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!role.is_system_role && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRole(role.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Empty State */}
      {!loading && roles.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có vai trò</h3>
            <p className="text-gray-500">Chưa có vai trò nào được tạo trong hệ thống.</p>
          </CardContent>
        </Card>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chỉnh sửa vai trò</DialogTitle>
          </DialogHeader>
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Tên hiển thị</label>
                <Input value={selectedRole.display_name} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Mô tả</label>
                <Input value={selectedRole.description} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Quyền hạn</label>
                <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                  <div className="space-y-2">
                    {selectedRole.permissions.map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">
                          {PERMISSION_DESCRIPTIONS[permission as keyof typeof PERMISSION_DESCRIPTIONS] || permission}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                  Đóng
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
