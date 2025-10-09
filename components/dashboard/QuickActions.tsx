'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Calendar, 
  BarChart3, 
  Settings, 
  Video, 
  Share2,
  FileText,
  Users
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  badge?: string;
}

interface QuickActionsProps {
  className?: string;
}

export function QuickActions({ className }: QuickActionsProps) {
  const actions: QuickAction[] = [
    {
      id: 'create-review',
      title: 'Tạo Review Mới',
      description: 'Phân tích video và tạo review',
      icon: Plus,
      href: '/dashboard/create',
      color: 'bg-blue-500 hover:bg-blue-600',
    },
    {
      id: 'schedule-post',
      title: 'Lên Lịch Đăng Bài',
      description: 'Lên lịch đăng bài tự động',
      icon: Calendar,
      href: '/dashboard/schedules',
      color: 'bg-green-500 hover:bg-green-600',
    },
    {
      id: 'view-reviews',
      title: 'Quản Lý Reviews',
      description: 'Xem và chỉnh sửa reviews',
      icon: FileText,
      href: '/dashboard/reviews',
      color: 'bg-purple-500 hover:bg-purple-600',
    },
    {
      id: 'analytics',
      title: 'Phân Tích',
      description: 'Xem thống kê và báo cáo',
      icon: BarChart3,
      href: '/dashboard/analytics',
      color: 'bg-orange-500 hover:bg-orange-600',
    },
    {
      id: 'categories',
      title: 'Danh Mục',
      description: 'Quản lý danh mục sản phẩm',
      icon: Users,
      href: '/dashboard/categories',
      color: 'bg-pink-500 hover:bg-pink-600',
    },
    {
      id: 'settings',
      title: 'Cài Đặt',
      description: 'Cấu hình hệ thống',
      icon: Settings,
      href: '/dashboard/settings',
      color: 'bg-gray-500 hover:bg-gray-600',
    },
  ];

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Thao tác nhanh</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link key={action.id} href={action.href}>
                <Button
                  variant="outline"
                  className="w-full h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all"
                >
                  <div className={cn('p-2 rounded-lg text-white', action.color)}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-sm font-medium">{action.title}</h3>
                    <p className="text-xs text-gray-600 mt-1">
                      {action.description}
                    </p>
                  </div>
                  {action.badge && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {action.badge}
                    </span>
                  )}
                </Button>
              </Link>
            );
          })}
        </div>
        
        {/* Additional quick stats */}
        <div className="mt-6 pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-semibold text-blue-600">12</div>
              <div className="text-xs text-gray-600">Reviews hôm nay</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-green-600">8</div>
              <div className="text-xs text-gray-600">Đã đăng</div>
            </div>
            <div>
              <div className="text-lg font-semibold text-orange-600">4</div>
              <div className="text-xs text-gray-600">Chờ lịch</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
