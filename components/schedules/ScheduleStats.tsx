'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle, XCircle, RefreshCw, Calendar } from 'lucide-react';

interface ScheduleStatsProps {
  stats: {
    total: number;
    pending: number;
    posted: number;
    failed: number;
    processing: number;
  };
}

export function ScheduleStats({ stats }: ScheduleStatsProps) {
  const statItems = [
    {
      title: 'Tổng Lịch',
      value: stats.total,
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Chờ Đăng',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Đang Xử Lý',
      value: stats.processing,
      icon: RefreshCw,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Đã Đăng',
      value: stats.posted,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Thất Bại',
      value: stats.failed,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      {statItems.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {item.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${item.bgColor}`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${item.color}`}>
                {item.value.toLocaleString('vi-VN')}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.total > 0 ? `${((item.value / stats.total) * 100).toFixed(1)}%` : '0%'} tổng số
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
