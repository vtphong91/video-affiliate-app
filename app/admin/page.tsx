'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Shield, 
  Activity, 
  BarChart3, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useRoles } from '@/lib/auth/hooks/useEnhancedRoles';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPermissions: number;
  recentActivity: number;
  systemHealth: 'healthy' | 'warning' | 'error';
}

interface RecentActivity {
  id: string;
  user: string;
  action: string;
  resource: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error';
}

export default function AdminDashboard() {
  const { userProfile } = useAuth();
  const { canAccessAdmin, canManageUsers, canViewAnalytics } = useRoles();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalRoles: 0,
    totalPermissions: 0,
    recentActivity: 0,
    systemHealth: 'healthy'
  });
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch stats from APIs
      const [membersRes, rolesRes, permissionsRes] = await Promise.all([
        fetch('/api/admin/members'),
        fetch('/api/admin/roles'),
        fetch('/api/admin/permissions')
      ]);

      const [membersData, rolesData, permissionsData] = await Promise.all([
        membersRes.json(),
        rolesRes.json(),
        permissionsRes.json()
      ]);

      // Calculate stats
      const totalUsers = membersData.data?.length || 0;
      const activeUsers = membersData.data?.filter((user: any) => user.is_active !== false).length || 0;
      const totalRoles = rolesData.data?.length || 0;
      const totalPermissions = permissionsData.data?.length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalRoles,
        totalPermissions,
        recentActivity: 0, // Will be implemented later
        systemHealth: 'healthy'
      });

      // Mock recent activities (will be replaced with real data)
      setRecentActivities([
        {
          id: '1',
          user: userProfile?.full_name || 'Admin',
          action: 'Đăng nhập',
          resource: 'Hệ thống',
          timestamp: new Date().toISOString(),
          status: 'success'
        },
        {
          id: '2',
          user: userProfile?.full_name || 'Admin',
          action: 'Xem dashboard',
          resource: 'Admin Panel',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          status: 'success'
        }
      ]);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats(prev => ({ ...prev, systemHealth: 'error' }));
    } finally {
      setLoading(false);
    }
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertCircle className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-100';
      case 'warning': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Chào mừng trở lại, {userProfile?.full_name || 'Admin'}!
        </h1>
        <p className="text-blue-100">
          Quản lý hệ thống Video Affiliate App với đầy đủ quyền hạn {userProfile?.role === 'admin' ? 'quản trị viên' : 'biên tập viên'}.
        </p>
        <div className="mt-4 flex items-center space-x-4">
          <Badge variant="secondary" className="bg-white/20 text-white">
            {userProfile?.role === 'admin' ? 'Quản trị viên' : 
             userProfile?.role === 'editor' ? 'Biên tập viên' : 'Người xem'}
          </Badge>
          <Badge variant="secondary" className="bg-white/20 text-white">
            {stats.systemHealth === 'healthy' ? 'Hệ thống hoạt động tốt' : 'Có cảnh báo'}
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng thành viên</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} đang hoạt động
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vai trò</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRoles}</div>
            <p className="text-xs text-muted-foreground">
              Admin, Editor, Viewer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quyền hạn</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPermissions}</div>
            <p className="text-xs text-muted-foreground">
              Quyền hạn chi tiết
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trạng thái hệ thống</CardTitle>
            <div className={`p-2 rounded-full ${getHealthColor(stats.systemHealth)}`}>
              {getHealthIcon(stats.systemHealth)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">
              {stats.systemHealth === 'healthy' ? 'Tốt' : 
               stats.systemHealth === 'warning' ? 'Cảnh báo' : 'Lỗi'}
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.systemHealth === 'healthy' ? 'Hoạt động bình thường' : 'Cần kiểm tra'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Hoạt động gần đây</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-full ${getStatusColor(activity.status)}`}>
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">
                      {activity.user} {activity.action} {activity.resource}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className={getStatusColor(activity.status)}>
                  {activity.status === 'success' ? 'Thành công' :
                   activity.status === 'warning' ? 'Cảnh báo' : 'Lỗi'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Thao tác nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {canManageUsers() && (
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Users className="h-6 w-6" />
                <span>Quản lý thành viên</span>
              </Button>
            )}
            {canManageUsers() && (
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <Shield className="h-6 w-6" />
                <span>Phân quyền</span>
              </Button>
            )}
            {canViewAnalytics() && (
              <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>Xem thống kê</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
