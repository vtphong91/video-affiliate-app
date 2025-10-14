'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { usePermissions } from '@/lib/auth/hooks/usePermissions';
import { 
  Key, 
  Search, 
  Shield,
  CheckCircle,
  XCircle,
  Users,
  FileText,
  Calendar,
  Tag,
  BarChart3,
  Settings,
  Activity
} from 'lucide-react';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useRoles } from '@/lib/auth/hooks/useEnhancedRoles';
import { PERMISSION_DESCRIPTIONS } from '@/lib/auth/config/auth-types';

interface Permission {
  id: string;
  name: string;
  display_name: string;
  description: string;
  resource: string;
  action: string;
  created_at: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  permissions: string[];
}

export default function PermissionManagement() {
  const { userProfile } = useAuth();
  const { checkPermission } = usePermissions();
  
  const canManageUsers = () => checkPermission('write:users') || checkPermission('admin:all');
  const canAccessAdmin = () => checkPermission('admin:all');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceFilter, setResourceFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [permissionsRes, rolesRes] = await Promise.all([
        fetch('/api/admin/permissions'),
        fetch('/api/admin/roles')
      ]);

      const [permissionsData, rolesData] = await Promise.all([
        permissionsRes.json(),
        rolesRes.json()
      ]);

      if (permissionsData.success) {
        setPermissions(permissionsData.data || []);
      }

      if (rolesData.success) {
        setRoles(rolesData.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getResourceIcon = (resource: string) => {
    switch (resource) {
      case 'users': return <Users className="h-4 w-4" />;
      case 'reviews': return <FileText className="h-4 w-4" />;
      case 'schedules': return <Calendar className="h-4 w-4" />;
      case 'categories': return <Tag className="h-4 w-4" />;
      case 'analytics': return <BarChart3 className="h-4 w-4" />;
      case 'settings': return <Settings className="h-4 w-4" />;
      case 'system': return <Shield className="h-4 w-4" />;
      default: return <Key className="h-4 w-4" />;
    }
  };

  const getResourceColor = (resource: string) => {
    switch (resource) {
      case 'users': return 'bg-blue-100 text-blue-800';
      case 'reviews': return 'bg-green-100 text-green-800';
      case 'schedules': return 'bg-purple-100 text-purple-800';
      case 'categories': return 'bg-orange-100 text-orange-800';
      case 'analytics': return 'bg-pink-100 text-pink-800';
      case 'settings': return 'bg-gray-100 text-gray-800';
      case 'system': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'read': return 'bg-green-100 text-green-800';
      case 'write': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredPermissions = permissions.filter(permission => {
    const matchesSearch = permission.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         permission.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesResource = resourceFilter === 'all' || permission.resource === resourceFilter;
    const matchesAction = actionFilter === 'all' || permission.action === actionFilter;

    return matchesSearch && matchesResource && matchesAction;
  });

  const groupedPermissions = filteredPermissions.reduce((acc, permission) => {
    if (!acc[permission.resource]) {
      acc[permission.resource] = [];
    }
    acc[permission.resource].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  const getUniqueResources = () => {
    return [...new Set(permissions.map(p => p.resource))];
  };

  const getUniqueActions = () => {
    return [...new Set(permissions.map(p => p.action))];
  };

  const hasPermissionInRole = (roleName: string, permissionName: string) => {
    const role = roles.find(r => r.name === roleName);
    return role?.permissions.includes(permissionName) || false;
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
          <h1 className="text-2xl font-bold text-gray-900">Quản lý quyền hạn</h1>
          <p className="text-gray-600">Xem và quản lý quyền hạn chi tiết trong hệ thống</p>
        </div>
        <Badge variant="outline" className="text-sm">
          {permissions.length} quyền hạn
        </Badge>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm quyền hạn..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={resourceFilter}
              onChange={(e) => setResourceFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Tất cả tài nguyên</option>
              {getUniqueResources().map(resource => (
                <option key={resource} value={resource}>
                  {resource === 'users' ? 'Thành viên' :
                   resource === 'reviews' ? 'Reviews' :
                   resource === 'schedules' ? 'Lịch đăng bài' :
                   resource === 'categories' ? 'Danh mục' :
                   resource === 'analytics' ? 'Thống kê' :
                   resource === 'settings' ? 'Cài đặt' :
                   resource === 'system' ? 'Hệ thống' : resource}
                </option>
              ))}
            </select>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">Tất cả hành động</option>
              {getUniqueActions().map(action => (
                <option key={action} value={action}>
                  {action === 'read' ? 'Xem' :
                   action === 'write' ? 'Ghi' :
                   action === 'delete' ? 'Xóa' :
                   action === 'admin' ? 'Quản trị' : action}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Permission Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Key className="h-5 w-5" />
            <span>Ma trận quyền hạn</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="animate-pulse p-4 border rounded-lg">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedPermissions).map(([resource, resourcePermissions]) => (
                <div key={resource}>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className={`p-2 rounded-lg ${getResourceColor(resource)}`}>
                      {getResourceIcon(resource)}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {resource === 'users' ? 'Thành viên' :
                       resource === 'reviews' ? 'Reviews' :
                       resource === 'schedules' ? 'Lịch đăng bài' :
                       resource === 'categories' ? 'Danh mục' :
                       resource === 'analytics' ? 'Thống kê' :
                       resource === 'settings' ? 'Cài đặt' :
                       resource === 'system' ? 'Hệ thống' : resource}
                    </h3>
                    <Badge variant="outline">
                      {resourcePermissions.length} quyền
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {resourcePermissions.map((permission) => (
                      <div key={permission.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 mb-1">
                              {permission.display_name}
                            </h4>
                            <p className="text-sm text-gray-600 mb-2">
                              {permission.description}
                            </p>
                          </div>
                          <Badge className={getActionColor(permission.action)}>
                            {permission.action === 'read' ? 'Xem' :
                             permission.action === 'write' ? 'Ghi' :
                             permission.action === 'delete' ? 'Xóa' :
                             permission.action === 'admin' ? 'Quản trị' : permission.action}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="text-xs font-medium text-gray-700">Có trong vai trò:</div>
                          <div className="flex flex-wrap gap-1">
                            {roles.map((role) => (
                              <div key={role.name} className="flex items-center space-x-1">
                                {hasPermissionInRole(role.name, permission.name) ? (
                                  <CheckCircle className="h-3 w-3 text-green-500" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-gray-300" />
                                )}
                                <span className={`text-xs ${
                                  hasPermissionInRole(role.name, permission.name) 
                                    ? 'text-green-700' 
                                    : 'text-gray-400'
                                }`}>
                                  {role.display_name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="mt-3 pt-3 border-t">
                          <div className="text-xs text-gray-500">
                            ID: {permission.name}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Key className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{permissions.length}</div>
                <div className="text-sm text-gray-600">Tổng quyền hạn</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{getUniqueResources().length}</div>
                <div className="text-sm text-gray-600">Tài nguyên</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{getUniqueActions().length}</div>
                <div className="text-sm text-gray-600">Hành động</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{roles.length}</div>
                <div className="text-sm text-gray-600">Vai trò</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
