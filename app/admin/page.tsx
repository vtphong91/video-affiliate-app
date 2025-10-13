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
  Clock,
  CheckCircle,
  AlertCircle,
  Zap,
  Crown,
  Star,
  Target,
  ArrowUpRight,
  Sparkles,
  Rocket
} from 'lucide-react';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useRoles } from '@/lib/auth/hooks/useEnhancedRoles';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  totalPermissions: number;
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

      const totalUsers = membersData.data?.length || 0;
      const activeUsers = membersData.data?.filter((user: any) => user.is_active !== false).length || 0;
      const totalRoles = rolesData.data?.length || 0;
      const totalPermissions = permissionsData.data?.length || 0;

      setStats({
        totalUsers,
        activeUsers,
        totalRoles,
        totalPermissions,
        systemHealth: 'healthy'
      });

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

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': 
        return <CheckCircle className="h-4 w-4" />;
      case 'warning': 
        return <AlertCircle className="h-4 w-4" />;
      case 'error': 
        return <AlertCircle className="h-4 w-4" />;
      default: 
        return <Activity className="h-4 w-4" />;
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
    <div className="w-full space-y-8">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <Crown className="h-8 w-8 text-yellow-300" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    Chào mừng trở lại!
                  </h1>
                  <p className="text-xl text-blue-100 font-medium">
                    {userProfile?.full_name || 'Admin'}
                  </p>
                </div>
              </div>
              
              <p className="text-lg text-blue-100 mb-6 max-w-2xl">
                Quản lý hệ thống Video Affiliate App với đầy đủ quyền hạn{' '}
                <span className="font-semibold text-yellow-300">
                  {userProfile?.role === 'admin' ? 'quản trị viên' : 
                   userProfile?.role === 'editor' ? 'biên tập viên' : 'người xem'}
                </span>
              </p>
              
              <div className="flex items-center space-x-4">
                <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm font-medium">
                  <Star className="h-4 w-4 mr-2" />
                  {userProfile?.role === 'admin' ? '👑 Quản trị viên' : 
                   userProfile?.role === 'editor' ? '✏️ Biên tập viên' : '👁️ Người xem'}
                </Badge>
                <Badge className={`px-4 py-2 text-sm font-medium ${
                  stats.systemHealth === 'healthy' 
                    ? 'bg-green-500/20 text-green-100 border-green-400/30' 
                    : 'bg-yellow-500/20 text-yellow-100 border-yellow-400/30'
                }`}>
                  <Zap className="h-4 w-4 mr-2" />
                  {stats.systemHealth === 'healthy' ? '🚀 Hệ thống hoạt động tốt' : '⚠️ Có cảnh báo'}
                </Badge>
              </div>
            </div>
            
            <div className="hidden lg:block">
              <div className="p-6 bg-white/10 backdrop-blur-sm rounded-2xl">
                <Rocket className="h-16 w-16 text-yellow-300" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Tổng thành viên</CardTitle>
            <div className="p-2 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors">
              <Users className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalUsers}</div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <ArrowUpRight className="h-3 w-3" />
                <span className="font-medium">{stats.activeUsers}</span>
              </div>
              <span className="text-xs text-slate-500">đang hoạt động</span>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Vai trò</CardTitle>
            <div className="p-2 bg-purple-500 rounded-xl group-hover:bg-purple-600 transition-colors">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalRoles}</div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-purple-600">
                <Target className="h-3 w-3" />
                <span className="font-medium">Admin, Editor, Viewer</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Quyền hạn</CardTitle>
            <div className="p-2 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors">
              <Activity className="h-5 w-5 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 mb-1">{stats.totalPermissions}</div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 text-sm text-green-600">
                <Sparkles className="h-3 w-3" />
                <span className="font-medium">Quyền hạn chi tiết</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-orange-50 to-red-100 hover:from-orange-100 hover:to-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-slate-700">Trạng thái hệ thống</CardTitle>
            <div className={`p-2 rounded-xl group-hover:scale-110 transition-transform ${
              stats.systemHealth === 'healthy' ? 'bg-green-500 group-hover:bg-green-600' : 
              stats.systemHealth === 'warning' ? 'bg-yellow-500 group-hover:bg-yellow-600' : 
              'bg-red-500 group-hover:bg-red-600'
            }`}>
              {getHealthIcon(stats.systemHealth)}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900 mb-1 capitalize">
              {stats.systemHealth === 'healthy' ? 'Tốt' : 
               stats.systemHealth === 'warning' ? 'Cảnh báo' : 'Lỗi'}
            </div>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 text-sm ${
                stats.systemHealth === 'healthy' ? 'text-green-600' :
                stats.systemHealth === 'warning' ? 'text-yellow-600' : 'text-red-600'
              }`}>
                <span className="font-medium">
                  {stats.systemHealth === 'healthy' ? 'Hoạt động bình thường' : 'Cần kiểm tra'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-xl">
          <CardTitle className="flex items-center space-x-3 text-slate-800">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Hoạt động gần đây</span>
            <Badge variant="outline" className="ml-auto bg-blue-100 text-blue-700 border-blue-200">
              {recentActivities.length} hoạt động
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 border border-slate-200/50">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-xl transition-transform group-hover:scale-110 ${
                    activity.status === 'success' ? 'bg-green-100 group-hover:bg-green-200' :
                    activity.status === 'warning' ? 'bg-yellow-100 group-hover:bg-yellow-200' :
                    'bg-red-100 group-hover:bg-red-200'
                  }`}>
                    <Activity className={`h-5 w-5 ${
                      activity.status === 'success' ? 'text-green-600' :
                      activity.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 group-hover:text-slate-800">
                      {activity.user} {activity.action} {activity.resource}
                    </p>
                    <p className="text-xs text-slate-600 group-hover:text-slate-700">
                      {new Date(activity.timestamp).toLocaleString('vi-VN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`font-medium ${
                    activity.status === 'success' ? 'bg-green-50 text-green-700 border-green-200' :
                    activity.status === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                    'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {activity.status === 'success' ? '✅ Thành công' :
                   activity.status === 'warning' ? '⚠️ Cảnh báo' : '❌ Lỗi'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-purple-50 rounded-t-xl">
          <CardTitle className="flex items-center space-x-3 text-slate-800">
            <div className="p-2 bg-purple-500 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">Thao tác nhanh</span>
            <Badge variant="outline" className="ml-auto bg-purple-100 text-purple-700 border-purple-200">
              Quick Access
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {canManageUsers() && (
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-blue-50 to-indigo-100 hover:from-blue-100 hover:to-indigo-200 border-blue-200 hover:border-blue-300 transition-all duration-200 group"
              >
                <div className="p-3 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-slate-700">Quản lý thành viên</span>
              </Button>
            )}
            {canManageUsers() && (
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-purple-50 to-pink-100 hover:from-purple-100 hover:to-pink-200 border-purple-200 hover:border-purple-300 transition-all duration-200 group"
              >
                <div className="p-3 bg-purple-500 rounded-xl group-hover:bg-purple-600 transition-colors">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-slate-700">Phân quyền</span>
              </Button>
            )}
            {canViewAnalytics() && (
              <Button 
                variant="outline" 
                className="h-24 flex flex-col items-center justify-center space-y-3 bg-gradient-to-br from-green-50 to-emerald-100 hover:from-green-100 hover:to-emerald-200 border-green-200 hover:border-green-300 transition-all duration-200 group"
              >
                <div className="p-3 bg-green-500 rounded-xl group-hover:bg-green-600 transition-colors">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <span className="font-semibold text-slate-700">Xem thống kê</span>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}