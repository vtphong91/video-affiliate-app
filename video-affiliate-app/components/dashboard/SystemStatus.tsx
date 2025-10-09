'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Clock,
  Server,
  Database,
  Zap,
  Globe
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SystemStatusItem {
  id: string;
  name: string;
  status: 'online' | 'offline' | 'warning' | 'maintenance';
  description: string;
  lastChecked: Date;
  responseTime?: number;
  icon: React.ComponentType<{ className?: string }>;
}

interface SystemStatusProps {
  className?: string;
}

export function SystemStatus({ className }: SystemStatusProps) {
  const statusItems: SystemStatusItem[] = [
    {
      id: 'app-server',
      name: 'App Server',
      status: 'online',
      description: 'Next.js application server',
      lastChecked: new Date(),
      responseTime: 45,
      icon: Server,
    },
    {
      id: 'database',
      name: 'Database',
      status: 'online',
      description: 'Supabase PostgreSQL',
      lastChecked: new Date(),
      responseTime: 12,
      icon: Database,
    },
    {
      id: 'make-webhook',
      name: 'Make.com Webhook',
      status: 'online',
      description: 'Automation webhook endpoint',
      lastChecked: new Date(),
      responseTime: 234,
      icon: Zap,
    },
    {
      id: 'facebook-api',
      name: 'Facebook API',
      status: 'online',
      description: 'Facebook Graph API',
      lastChecked: new Date(),
      responseTime: 156,
      icon: Globe,
    },
    {
      id: 'youtube-api',
      name: 'YouTube API',
      status: 'warning',
      description: 'YouTube Data API v3',
      lastChecked: new Date(Date.now() - 300000), // 5 minutes ago
      responseTime: 1200,
      icon: Globe,
    },
    {
      id: 'ai-services',
      name: 'AI Services',
      status: 'online',
      description: 'OpenAI, Claude, Gemini',
      lastChecked: new Date(),
      responseTime: 890,
      icon: Zap,
    },
  ];

  const getStatusIcon = (status: SystemStatusItem['status']) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'offline':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'maintenance':
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status: SystemStatusItem['status']) => {
    const statusConfig = {
      online: { label: 'Hoạt động', className: 'bg-green-100 text-green-800' },
      offline: { label: 'Tắt', className: 'bg-red-100 text-red-800' },
      warning: { label: 'Cảnh báo', className: 'bg-yellow-100 text-yellow-800' },
      maintenance: { label: 'Bảo trì', className: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status];
    return (
      <Badge className={cn('text-xs', config.className)}>
        {config.label}
      </Badge>
    );
  };

  const formatLastChecked = (lastChecked: Date) => {
    const now = new Date();
    const diff = now.getTime() - lastChecked.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return 'Vừa xong';
    if (minutes < 60) return `${minutes} phút trước`;
    
    return lastChecked.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getOverallStatus = () => {
    const hasOffline = statusItems.some(item => item.status === 'offline');
    const hasWarning = statusItems.some(item => item.status === 'warning');
    
    if (hasOffline) return { status: 'offline', label: 'Có sự cố', color: 'text-red-600' };
    if (hasWarning) return { status: 'warning', label: 'Cảnh báo', color: 'text-yellow-600' };
    return { status: 'online', label: 'Tất cả hoạt động tốt', color: 'text-green-600' };
  };

  const overallStatus = getOverallStatus();

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Trạng thái hệ thống</CardTitle>
          <div className="flex items-center space-x-2">
            {getStatusIcon(overallStatus.status as any)}
            <span className={cn('text-sm font-medium', overallStatus.color)}>
              {overallStatus.label}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {statusItems.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50">
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <div>
                    <h4 className="text-sm font-medium">{item.name}</h4>
                    <p className="text-xs text-gray-600">{item.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  {item.responseTime && (
                    <span className="text-xs text-gray-500">
                      {item.responseTime}ms
                    </span>
                  )}
                  {getStatusBadge(item.status)}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* System metrics */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-green-600">
                {statusItems.filter(item => item.status === 'online').length}
              </div>
              <div className="text-xs text-gray-600">Dịch vụ hoạt động</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-yellow-600">
                {statusItems.filter(item => item.status === 'warning').length}
              </div>
              <div className="text-xs text-gray-600">Cảnh báo</div>
            </div>
          </div>
        </div>
        
        {/* Last updated */}
        <div className="mt-4 pt-3 border-t text-center">
          <p className="text-xs text-gray-500">
            Cập nhật lần cuối: {new Date().toLocaleTimeString('vi-VN')}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
