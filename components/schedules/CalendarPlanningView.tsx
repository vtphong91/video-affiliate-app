'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Lightbulb,
  CheckCircle,
  Clock,
  AlertCircle,
  GripVertical,
  Move,
} from 'lucide-react';
import { supabase } from '@/lib/db/supabase';

// Types
interface CalendarItem {
  id: string;
  title: string;
  type: 'schedule' | 'review';
  status: string;
  scheduledFor?: string;
  createdAt: string;
  thumbnail?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  items: CalendarItem[];
}

interface CalendarPlanningViewProps {
  onItemClick?: (item: CalendarItem) => void;
  onViewDetails?: (id: string, type: 'schedule' | 'review') => void;
  onScheduleUpdated?: () => void;
}

// Status configuration
const statusConfig = {
  // Schedule statuses
  pending: { label: 'Chờ đăng', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  processing: { label: 'Đang xử lý', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  posted: { label: 'Đã đăng', color: 'bg-green-100 text-green-800 border-green-200' },
  failed: { label: 'Thất bại', color: 'bg-red-100 text-red-800 border-red-200' },
  cancelled: { label: 'Đã hủy', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  // Review statuses
  draft: { label: 'Ý tưởng', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  published: { label: 'Đã xuất bản', color: 'bg-teal-100 text-teal-800 border-teal-200' },
};

// Day names in Vietnamese
const dayNames = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const dayNamesFull = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];

// Month names in Vietnamese
const monthNames = [
  'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
  'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export function CalendarPlanningView({ onItemClick, onViewDetails, onScheduleUpdated }: CalendarPlanningViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [items, setItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [draggedItem, setDraggedItem] = useState<CalendarItem | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  // Get the first day of the month
  const firstDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  }, [currentDate]);

  // Get the last day of the month
  const lastDayOfMonth = useMemo(() => {
    return new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  }, [currentDate]);

  // Fetch items for the current month
  useEffect(() => {
    fetchMonthItems();
  }, [currentDate]);

  const fetchMonthItems = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.user) {
        headers['x-user-id'] = session.user.id;
        headers['x-user-email'] = session.user.email || '';
        headers['x-user-role'] = session.user.user_metadata?.role || 'user';
      }

      // Calculate date range for the month (include padding days)
      const startDate = new Date(firstDayOfMonth);
      startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

      const endDate = new Date(lastDayOfMonth);
      endDate.setDate(endDate.getDate() + (6 - endDate.getDay())); // End on Saturday

      // Fetch schedules
      const schedulesResponse = await fetch(
        `/api/schedules?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=100`,
        { headers }
      );
      const schedulesResult = await schedulesResponse.json();

      // Fetch reviews (drafts/ideas)
      const reviewsResponse = await fetch(
        `/api/reviews?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}&limit=100`,
        { headers }
      );
      const reviewsResult = await reviewsResponse.json();

      const calendarItems: CalendarItem[] = [];

      // Process schedules
      if (schedulesResult.success && schedulesResult.data?.schedules) {
        schedulesResult.data.schedules.forEach((schedule: any) => {
          calendarItems.push({
            id: schedule.id,
            title: schedule.video_title || schedule.title || 'Bài đăng không có tiêu đề',
            type: 'schedule',
            status: schedule.status,
            scheduledFor: schedule.scheduled_for,
            createdAt: schedule.created_at,
            thumbnail: schedule.video_thumbnail,
          });
        });
      }

      // Process reviews (show as ideas if draft)
      if (reviewsResult.success && reviewsResult.data?.reviews) {
        reviewsResult.data.reviews.forEach((review: any) => {
          // Only show reviews that are not already scheduled
          const isScheduled = calendarItems.some(item =>
            item.type === 'schedule' && item.title === review.title
          );

          if (!isScheduled && review.status !== 'published') {
            calendarItems.push({
              id: review.id,
              title: review.title || 'Review không có tiêu đề',
              type: 'review',
              status: review.status || 'draft',
              createdAt: review.created_at,
              thumbnail: review.video_thumbnail,
            });
          }
        });
      }

      setItems(calendarItems);
    } catch (error) {
      console.error('Error fetching calendar items:', error);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Start from Sunday of the first week
    const startDate = new Date(firstDayOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    // Generate 6 weeks (42 days)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const isCurrentMonth = date.getMonth() === currentDate.getMonth();
      const isToday = date.getTime() === today.getTime();

      // Find items for this day
      const dayItems = items.filter(item => {
        const itemDate = new Date(item.scheduledFor || item.createdAt);
        itemDate.setHours(0, 0, 0, 0);
        return itemDate.getTime() === date.getTime();
      });

      days.push({
        date,
        isCurrentMonth,
        isToday,
        items: dayItems,
      });
    }

    return days;
  }, [currentDate, firstDayOfMonth, items]);

  // Navigation functions
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Check if item is draggable (only pending schedules)
  const isDraggable = (item: CalendarItem) => {
    return item.type === 'schedule' && item.status === 'pending';
  };

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, item: CalendarItem) => {
    if (!isDraggable(item)) {
      e.preventDefault();
      return;
    }

    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify(item));

    // Add visual feedback
    const target = e.target as HTMLElement;
    target.style.opacity = '0.5';
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    const target = e.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedItem(null);
    setDragOverDate(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, day: CalendarDay) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverDate(day.date);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    // Only clear if leaving the cell entirely
    const relatedTarget = e.relatedTarget as HTMLElement;
    const currentTarget = e.currentTarget as HTMLElement;
    if (!currentTarget.contains(relatedTarget)) {
      setDragOverDate(null);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, day: CalendarDay) => {
    e.preventDefault();
    setDragOverDate(null);

    if (!draggedItem || !isDraggable(draggedItem)) {
      return;
    }

    // Check if dropping on the same day
    const originalDate = new Date(draggedItem.scheduledFor || draggedItem.createdAt);
    originalDate.setHours(0, 0, 0, 0);
    if (originalDate.getTime() === day.date.getTime()) {
      setDraggedItem(null);
      return;
    }

    // Update schedule date via API
    setIsUpdating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (session?.user) {
        headers['x-user-id'] = session.user.id;
        headers['x-user-role'] = session.user.user_metadata?.role || 'user';
      }

      // Create new scheduled_for date (keep original time, change date)
      const originalDateTime = new Date(draggedItem.scheduledFor || draggedItem.createdAt);
      const newScheduledFor = new Date(day.date);
      newScheduledFor.setHours(originalDateTime.getHours());
      newScheduledFor.setMinutes(originalDateTime.getMinutes());
      newScheduledFor.setSeconds(0);
      newScheduledFor.setMilliseconds(0);

      // Convert to UTC ISO string for API
      const utcISOString = newScheduledFor.toISOString();

      const response = await fetch(`/api/schedules/${draggedItem.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          scheduled_for: utcISOString,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: 'Đã cập nhật lịch',
          description: `"${draggedItem.title.substring(0, 30)}..." đã được chuyển sang ngày ${day.date.getDate()}/${day.date.getMonth() + 1}`,
        });

        // Refresh calendar items
        await fetchMonthItems();

        // Notify parent component
        if (onScheduleUpdated) {
          onScheduleUpdated();
        }
      } else {
        throw new Error(result.error || 'Failed to update schedule');
      }
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: 'Lỗi cập nhật',
        description: error instanceof Error ? error.message : 'Không thể cập nhật lịch đăng bài',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
      setDraggedItem(null);
    }
  }, [draggedItem, toast, onScheduleUpdated]);

  // Get status badge
  const getStatusBadge = (status: string) => {
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    return (
      <Badge className={`text-[10px] px-1.5 py-0 border ${config.color}`}>
        {config.label}
      </Badge>
    );
  };

  // Get status icon
  const getStatusIcon = (status: string, type: 'schedule' | 'review') => {
    if (type === 'review') {
      return <Lightbulb className="h-3 w-3 text-purple-500" />;
    }
    switch (status) {
      case 'posted':
        return <CheckCircle className="h-3 w-3 text-green-500" />;
      case 'pending':
        return <Clock className="h-3 w-3 text-amber-500" />;
      case 'failed':
        return <AlertCircle className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3 text-gray-500" />;
    }
  };

  // Handle day click
  const handleDayClick = (day: CalendarDay) => {
    if (day.items.length > 0) {
      setSelectedDay(day);
    }
  };

  // Handle item click
  const handleItemClick = (item: CalendarItem) => {
    if (onViewDetails) {
      onViewDetails(item.id, item.type);
    } else if (onItemClick) {
      onItemClick(item);
    }
  };

  // Check if a date is being dragged over
  const isDropTarget = (day: CalendarDay) => {
    return dragOverDate && dragOverDate.getTime() === day.date.getTime();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-green-50 border-b border-green-100 p-4">
        <div className="flex items-start gap-2 mb-2">
          <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
          <div>
            <h2 className="text-lg font-semibold text-green-800">Content Planning - Calendar View</h2>
            <p className="text-sm text-green-600">
              <span className="font-medium">Tip:</span> Visualize your content schedule and track publish dates.
            </p>
            <p className="text-sm text-green-600">
              <span className="font-medium">Features:</span> Click on articles to view details, navigate months, see unscheduled articles
            </p>
            <p className="text-sm text-green-600">
              <Move className="inline h-3 w-3 mr-1" />
              <span className="font-medium">Drag & Drop:</span> Kéo thả các bài viết <Badge className="text-[10px] px-1.5 py-0 border bg-amber-100 text-amber-800 border-amber-200 mx-1">Chờ đăng</Badge> để thay đổi ngày đăng
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="text-xl font-semibold text-gray-900">
          <Calendar className="inline-block h-5 w-5 mr-2 text-gray-400" />
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          {isUpdating && (
            <span className="ml-2 text-sm text-blue-600 font-normal animate-pulse">
              Đang cập nhật...
            </span>
          )}
        </h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-sm"
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 mb-2">
          {dayNames.map((day, index) => (
            <div
              key={day}
              className={`text-center text-sm font-medium py-2 ${
                index === 0 ? 'text-red-500' : 'text-gray-600'
              }`}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        {loading ? (
          <div className="grid grid-cols-7 gap-1">
            {[...Array(42)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gray-50 animate-pulse rounded-lg"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => (
              <div
                key={index}
                className={`min-h-[120px] p-2 rounded-lg border transition-all
                  ${day.isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                  ${day.isToday ? 'border-green-500 border-2' : 'border-gray-100'}
                  ${day.items.length > 0 ? 'hover:border-green-300 hover:shadow-sm cursor-pointer' : ''}
                  ${isDropTarget(day) ? 'border-blue-500 border-2 bg-blue-50 shadow-lg' : ''}
                  ${draggedItem ? 'transition-colors duration-150' : ''}
                `}
                onClick={() => handleDayClick(day)}
                onDragOver={(e) => handleDragOver(e, day)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, day)}
              >
                {/* Date number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium ${
                      !day.isCurrentMonth
                        ? 'text-gray-400'
                        : day.isToday
                        ? 'text-green-600'
                        : day.date.getDay() === 0
                        ? 'text-red-500'
                        : 'text-gray-700'
                    }`}
                  >
                    {day.date.getDate()}
                  </span>
                  {day.items.length > 0 && (
                    <span className="flex items-center justify-center h-5 w-5 rounded-full bg-green-500 text-white text-[10px] font-bold">
                      {day.items.length}
                    </span>
                  )}
                </div>

                {/* Drop indicator when dragging */}
                {isDropTarget(day) && draggedItem && (
                  <div className="mb-1 p-1 bg-blue-100 border-2 border-dashed border-blue-400 rounded text-[10px] text-blue-600 text-center">
                    Thả vào đây
                  </div>
                )}

                {/* Items */}
                <div className="space-y-1 overflow-hidden">
                  {day.items.slice(0, 2).map((item) => (
                    <div
                      key={item.id}
                      draggable={isDraggable(item)}
                      onDragStart={(e) => handleDragStart(e, item)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-start gap-1 p-1 rounded text-xs
                        ${item.type === 'review'
                          ? 'bg-purple-50 hover:bg-purple-100'
                          : item.status === 'posted'
                          ? 'bg-green-50 hover:bg-green-100'
                          : 'bg-amber-50 hover:bg-amber-100'
                        }
                        ${isDraggable(item)
                          ? 'cursor-grab active:cursor-grabbing hover:shadow-md hover:ring-2 hover:ring-amber-300 transition-shadow'
                          : 'cursor-pointer'
                        }
                        ${draggedItem?.id === item.id ? 'opacity-50 ring-2 ring-blue-400' : ''}
                      `}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!draggedItem) {
                          handleItemClick(item);
                        }
                      }}
                    >
                      <GripVertical
                        className={`h-3 w-3 flex-shrink-0 mt-0.5 ${
                          isDraggable(item) ? 'text-amber-500' : 'text-gray-400'
                        }`}
                      />
                      {getStatusBadge(item.type === 'review' ? 'draft' : item.status)}
                      <span className="truncate text-gray-700 flex-1">
                        {item.title.length > 20 ? item.title.substring(0, 20) + '...' : item.title}
                      </span>
                    </div>
                  ))}
                  {day.items.length > 2 && (
                    <div className="text-[10px] text-gray-500 text-center">
                      +{day.items.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-gray-500 font-medium">Chú thích:</span>
          <div className="flex items-center gap-1">
            <Badge className="text-[10px] px-1.5 py-0 border bg-green-100 text-green-800 border-green-200">
              Đã đăng
            </Badge>
            <span className="text-gray-600">Đã xuất bản</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="text-[10px] px-1.5 py-0 border bg-amber-100 text-amber-800 border-amber-200">
              Chờ đăng
            </Badge>
            <span className="text-gray-600">Có thể kéo thả</span>
          </div>
          <div className="flex items-center gap-1">
            <Badge className="text-[10px] px-1.5 py-0 border bg-purple-100 text-purple-800 border-purple-200">
              Ý tưởng
            </Badge>
            <span className="text-gray-600">Bản nháp</span>
          </div>
          <div className="flex items-center gap-1 ml-4 text-gray-500">
            <GripVertical className="h-3 w-3 text-amber-500" />
            <span>= Có thể kéo thả</span>
          </div>
        </div>
      </div>

      {/* Day Detail Modal */}
      {selectedDay && selectedDay.items.length > 0 && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setSelectedDay(null)}
        >
          <Card
            className="w-full max-w-lg mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>
                  {dayNamesFull[selectedDay.date.getDay()]}, {selectedDay.date.getDate()}/{selectedDay.date.getMonth() + 1}/{selectedDay.date.getFullYear()}
                </span>
                <Badge variant="secondary">{selectedDay.items.length} bài viết</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {selectedDay.items.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors
                      ${isDraggable(item)
                        ? 'hover:border-amber-300 hover:bg-amber-50 cursor-grab'
                        : 'hover:border-green-300 hover:bg-green-50 cursor-pointer'
                      }
                    `}
                    onClick={() => {
                      handleItemClick(item);
                      setSelectedDay(null);
                    }}
                  >
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(item.status, item.type)}
                        {getStatusBadge(item.type === 'review' ? 'draft' : item.status)}
                        {isDraggable(item) && (
                          <Badge variant="outline" className="text-[10px] px-1 py-0 text-amber-600 border-amber-300">
                            <GripVertical className="h-2 w-2 mr-0.5" />
                            Có thể kéo
                          </Badge>
                        )}
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.type === 'schedule' ? 'Lịch đăng bài' : 'Bài review'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedDay(null)}
                >
                  Đóng
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
