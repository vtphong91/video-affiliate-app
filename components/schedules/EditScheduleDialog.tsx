'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, Save, X } from 'lucide-react';
import { createTimestampFromDatePicker } from '@/lib/utils/timezone-utils';

interface Schedule {
  id: string;
  scheduled_for: string;
  post_message: string;
  reviews: {
    video_title: string;
  };
}

interface EditScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onUpdate: (scheduleId: string, newScheduledFor: string) => Promise<void>;
}

export function EditScheduleDialog({ isOpen, onClose, schedule, onUpdate }: EditScheduleDialogProps) {
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Initialize form when schedule changes
  useEffect(() => {
    if (schedule) {
      // Parse GMT+7 timestamp from database
      const gmt7Date = new Date(schedule.scheduled_for);
      
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const year = gmt7Date.getFullYear();
      const month = (gmt7Date.getMonth() + 1).toString().padStart(2, '0');
      const day = gmt7Date.getDate().toString().padStart(2, '0');
      const hours = gmt7Date.getHours().toString().padStart(2, '0');
      const minutes = gmt7Date.getMinutes().toString().padStart(2, '0');
      
      const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      setScheduledDateTime(formattedDateTime);
    }
  }, [schedule]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schedule || !scheduledDateTime) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn thời gian đăng bài',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create GMT+7 timestamp from datetime picker
      const gmt7Timestamp = createTimestampFromDatePicker(scheduledDateTime);
      
      await onUpdate(schedule.id, gmt7Timestamp);
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thời gian đăng bài',
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating schedule:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật lịch đăng bài',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  if (!schedule) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Sửa Lịch Đăng Bài
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Schedule Info */}
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Thông tin lịch đăng bài</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>Review:</strong> {schedule.reviews.video_title}</p>
                <p><strong>Nội dung:</strong> {schedule.post_message.substring(0, 100)}...</p>
              </div>
            </div>

            {/* Time Selection */}
            <div className="space-y-2">
              <Label htmlFor="scheduledDateTime" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Thời gian đăng bài mới (GMT+7)
              </Label>
              <Input
                id="scheduledDateTime"
                type="datetime-local"
                value={scheduledDateTime}
                onChange={(e) => setScheduledDateTime(e.target.value)}
                className="w-full"
                required
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500">
                Chọn thời gian đăng bài mới. Chỉ có thể điều chỉnh thời gian, không thể thay đổi nội dung.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !scheduledDateTime}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}