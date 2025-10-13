'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Users, 
  Shield, 
  Settings, 
  BarChart3, 
  Menu, 
  X, 
  Home,
  Key,
  Activity,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useRoles } from '@/lib/auth/hooks/useEnhancedRoles';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface MenuItem {
  title: string;
  href: string;
  icon: React.ComponentType<any>;
  permission?: string;
  badge?: string;
  children?: MenuItem[];
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, userProfile } = useAuth();
  const { canAccessAdmin, canManageUsers, canViewAnalytics, canManageSettings } = useRoles();

  // Menu items with permissions
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/admin',
      icon: Home,
    },
    {
      title: 'Thành viên',
      href: '/admin/members',
      icon: Users,
      permission: 'read:users',
    },
    {
      title: 'Phân quyền',
      href: '/admin/roles',
      icon: Shield,
      permission: 'read:users',
    },
    {
      title: 'Quyền hạn',
      href: '/admin/permissions',
      icon: Key,
      permission: 'read:users',
    },
    {
      title: 'Nhật ký',
      href: '/admin/audit-logs',
      icon: Activity,
      permission: 'read:audit_logs',
    },
    {
      title: 'Thống kê',
      href: '/admin/analytics',
      icon: BarChart3,
      permission: 'read:analytics',
    },
    {
      title: 'Cài đặt',
      href: '/admin/settings',
      icon: Settings,
      permission: 'read:settings',
    },
  ];

  const toggleMenu = (menuTitle: string) => {
    setExpandedMenus(prev => 
      prev.includes(menuTitle) 
        ? prev.filter(item => item !== menuTitle)
        : [...prev, menuTitle]
    );
  };

  const isMenuExpanded = (menuTitle: string) => expandedMenus.includes(menuTitle);

  const hasPermission = (permission?: string) => {
    if (!permission) return true;
    return canAccessAdmin() || canManageUsers() || canViewAnalytics() || canManageSettings();
  };

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
              {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {userProfile?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email}
              </p>
              <Badge 
                variant={userProfile?.role === 'admin' ? 'default' : 'secondary'}
                className="mt-1 text-xs"
              >
                {userProfile?.role === 'admin' ? 'Quản trị viên' : 
                 userProfile?.role === 'editor' ? 'Biên tập viên' : 'Người xem'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            if (!hasPermission(item.permission)) return null;

            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <div key={item.title}>
                <Link
                  href={item.href}
                  className={`
                    flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors
                    ${active 
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t">
          <div className="text-xs text-gray-500 text-center">
            Video Affiliate App v1.0
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {pathname === '/admin' ? 'Dashboard' :
                   pathname.includes('/members') ? 'Quản lý thành viên' :
                   pathname.includes('/roles') ? 'Phân quyền' :
                   pathname.includes('/permissions') ? 'Quyền hạn' :
                   pathname.includes('/audit-logs') ? 'Nhật ký' :
                   pathname.includes('/analytics') ? 'Thống kê' :
                   pathname.includes('/settings') ? 'Cài đặt' : 'Admin'}
                </h2>
                <p className="text-sm text-gray-500">
                  {pathname === '/admin' ? 'Tổng quan hệ thống' :
                   pathname.includes('/members') ? 'Quản lý thành viên và phân quyền' :
                   pathname.includes('/roles') ? 'Quản lý vai trò người dùng' :
                   pathname.includes('/permissions') ? 'Quản lý quyền hạn chi tiết' :
                   pathname.includes('/audit-logs') ? 'Xem nhật ký hoạt động' :
                   pathname.includes('/analytics') ? 'Báo cáo và thống kê' :
                   pathname.includes('/settings') ? 'Cài đặt hệ thống' : 'Quản trị hệ thống'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="text-xs">
                {userProfile?.is_active !== false ? 'Hoạt động' : 'Tạm khóa'}
              </Badge>
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('vi-VN')}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
