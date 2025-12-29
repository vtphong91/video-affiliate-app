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
  ChevronRight,
  Crown,
  Zap,
  TrendingUp,
  Globe,
  DollarSign,
  Brain,
  Link as LinkIcon
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
  href?: string;
  icon: React.ComponentType<any>;
  permission?: string;
  badge?: string;
  children?: MenuItem[];
  isGroup?: boolean;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);
  const pathname = usePathname();
  const { user, userProfile } = useAuth();
  const { canAccessAdmin, canManageUsers, canViewAnalytics, canManageSettings } = useRoles();

  // Menu items with permissions - Grouped by functionality
  const menuItems: MenuItem[] = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: Home,
    },
    {
      title: 'Quản Lý Người Dùng',
      icon: Users,
      isGroup: true,
      permission: 'read:users',
      children: [
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
      ],
    },
    {
      title: 'Affiliate Marketing',
      icon: DollarSign,
      isGroup: true,
      permission: 'read:settings',
      children: [
        {
          title: 'Cấu Hình',
          href: '/admin/affiliate-settings',
          icon: DollarSign,
          permission: 'read:settings',
        },
        {
          title: 'Lịch Sử Links',
          href: '/admin/affiliate-links',
          icon: LinkIcon,
          permission: 'read:settings',
          badge: 'NEW',
        },
        {
          title: 'Dashboard',
          href: '/admin/affiliate-dashboard',
          icon: TrendingUp,
          permission: 'read:settings',
        },
      ],
    },
    {
      title: 'Hệ Thống',
      icon: Settings,
      isGroup: true,
      permission: 'read:settings',
      children: [
        {
          title: 'AI Settings',
          href: '/admin/ai-settings',
          icon: Brain,
          permission: 'read:settings',
        },
        {
          title: 'Cài đặt',
          href: '/admin/settings',
          icon: Settings,
          permission: 'read:settings',
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
      ],
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
    if (href === '/dashboard') {
      return false; // Never highlight dashboard when in admin
    }
    if (href === '/admin') {
      return pathname === '/admin';
    }
    return pathname.startsWith(href);
  };

  return (
    <div 
      className="admin-layout bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100"
      style={{
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        height: '100vh',
        minHeight: '100vh'
      }}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`
          admin-sidebar bg-white/95 backdrop-blur-xl shadow-2xl border-r border-slate-200/50
          ${sidebarOpen ? 'open' : ''}
        `}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '288px',
          height: '100vh',
          zIndex: 50,
          overflowY: 'auto'
        }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-200/50 bg-gradient-to-r from-blue-600 to-indigo-600">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Crown className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-blue-100">Video Affiliate App</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-white/20"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0) || 'U'}
              </div>
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <div className="w-2 h-2 bg-white rounded-full"></div>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {userProfile?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-600 truncate">
                {user?.email}
              </p>
              <Badge 
                variant={userProfile?.role === 'admin' ? 'default' : 'secondary'}
                className={`mt-2 text-xs font-medium ${
                  userProfile?.role === 'admin' 
                    ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white' 
                    : userProfile?.role === 'editor'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                    : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                }`}
              >
                {userProfile?.role === 'admin' ? '👑 Quản trị viên' : 
                 userProfile?.role === 'editor' ? '✏️ Biên tập viên' : '👁️ Người xem'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {menuItems.map((item) => {
            if (!hasPermission(item.permission)) return null;

            const Icon = item.icon;
            const isExpanded = isMenuExpanded(item.title);

            // Group with children
            if (item.isGroup && item.children) {
              return (
                <div key={item.title} className="space-y-1">
                  {/* Group Header */}
                  <button
                    onClick={() => toggleMenu(item.title)}
                    className="w-full group flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-xl transition-all duration-200 ease-in-out text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {/* Group Children */}
                  {isExpanded && (
                    <div className="ml-3 pl-4 border-l-2 border-slate-200 space-y-1">
                      {item.children.map((child) => {
                        if (!hasPermission(child.permission)) return null;

                        const ChildIcon = child.icon;
                        const active = child.href ? isActive(child.href) : false;

                        return (
                          <Link
                            key={child.title}
                            href={child.href || '#'}
                            className={`
                              group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ease-in-out
                              ${active
                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                              }
                            `}
                          >
                            <div className="flex items-center space-x-3">
                              <ChildIcon className={`h-3.5 w-3.5 ${active ? 'text-white' : 'text-slate-500'}`} />
                              <span>{child.title}</span>
                            </div>
                            {child.badge && (
                              <Badge
                                variant="secondary"
                                className={`text-xs ${
                                  active
                                    ? 'bg-white/20 text-white border-white/30'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {child.badge}
                              </Badge>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Single menu item (no children)
            const active = item.href ? isActive(item.href) : false;

            return (
              <div key={item.title}>
                <Link
                  href={item.href || '#'}
                  className={`
                    group flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out
                    ${active
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900 hover:shadow-md'
                    }
                  `}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`p-1.5 rounded-lg transition-colors ${
                      active ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-slate-200'
                    }`}>
                      <Icon className={`h-4 w-4 ${active ? 'text-white' : 'text-slate-600'}`} />
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>
                  {item.badge && (
                    <Badge
                      variant="secondary"
                      className={`text-xs ${
                        active
                          ? 'bg-white/20 text-white border-white/30'
                          : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-blue-50">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Globe className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Video Affiliate App</span>
            </div>
            <div className="text-xs text-slate-500">v1.0 • Admin Panel</div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div 
        className="admin-content"
        style={{
          marginLeft: '288px',
          width: 'calc(100% - 288px)',
          minHeight: '100vh',
          flex: 1,
          minWidth: 0,
          overflowX: 'hidden'
        }}
      >
        {/* Top bar */}
        <div className="admin-top-bar sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm">
          <div className="flex items-center justify-between h-20 px-8">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden hover:bg-slate-100"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {pathname === '/admin' ? '📊 Dashboard' :
                   pathname.includes('/affiliate-links') ? '🔗 Quản Lý Affiliate Links' :
                   pathname.includes('/affiliate-settings') ? '💰 Affiliate System' :
                   pathname.includes('/ai-settings') ? '🤖 AI Settings' :
                   pathname.includes('/members') ? '👥 Quản lý thành viên' :
                   pathname.includes('/roles') ? '🛡️ Phân quyền' :
                   pathname.includes('/permissions') ? '🔑 Quyền hạn' :
                   pathname.includes('/audit-logs') ? '📋 Nhật ký' :
                   pathname.includes('/analytics') ? '📈 Thống kê' :
                   pathname.includes('/settings') ? '⚙️ Cài đặt' : '👑 Admin'}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {pathname === '/admin' ? 'Tổng quan hệ thống và thống kê' :
                   pathname.includes('/affiliate-links') ? 'Xem lịch sử và thống kê affiliate links đã tạo' :
                   pathname.includes('/affiliate-settings') ? 'Quản lý Affiliate Settings & Merchants' :
                   pathname.includes('/ai-settings') ? 'Cấu hình AI Providers và Prompts' :
                   pathname.includes('/members') ? 'Quản lý thành viên và phân quyền' :
                   pathname.includes('/roles') ? 'Quản lý vai trò người dùng' :
                   pathname.includes('/permissions') ? 'Quản lý quyền hạn chi tiết' :
                   pathname.includes('/audit-logs') ? 'Xem nhật ký hoạt động hệ thống' :
                   pathname.includes('/analytics') ? 'Báo cáo và phân tích dữ liệu' :
                   pathname.includes('/settings') ? 'Cài đặt hệ thống và cấu hình' : 'Quản trị hệ thống'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <Badge 
                  variant="outline" 
                  className={`text-xs font-medium ${
                    userProfile?.is_active !== false 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {userProfile?.is_active !== false ? '🟢 Hoạt động' : '🔴 Tạm khóa'}
                </Badge>
              </div>
              <div className="text-sm text-slate-600 font-medium">
                {new Date().toLocaleDateString('vi-VN', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 md:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
