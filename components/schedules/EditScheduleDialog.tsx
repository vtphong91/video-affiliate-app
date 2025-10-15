'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, Save, X } from 'lucide-react';
import { createTimestampFromDateTimeLocal } from '@/lib/utils/timezone-utils';
import { toZonedTime } from 'date-fns-tz';

interface Schedule {
  id: string;
  scheduled_for: string;
  post_message: string;
  video_title?: string; // Review data is stored directly in schedule
  video_thumbnail?: string;
  video_url?: string;
  channel_name?: string;
  review_summary?: string;
  review_pros?: any[];
  review_cons?: any[];
  review_key_points?: any[];
  review_target_audience?: any[];
  review_cta?: string;
  review_seo_keywords?: any[];
}

interface EditScheduleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: Schedule | null;
  onUpdate: (scheduleId: string, newScheduledFor: string) => Promise<boolean>; // Return boolean for success/failure
}

export function EditScheduleDialog({ isOpen, onClose, schedule, onUpdate }: EditScheduleDialogProps) {
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [timeValidation, setTimeValidation] = useState<{ isValid: boolean; message: string }>({ isValid: true, message: '' });
  const { toast } = useToast();

  // Initialize form when schedule changes
  useEffect(() => {
    if (schedule) {
      console.log('🔍 EditScheduleDialog - Parsing scheduled_for:', schedule.scheduled_for);

      // Parse UTC timestamp from database and convert to GMT+7
      const utcDate = new Date(schedule.scheduled_for);
      const gmt7Date = toZonedTime(utcDate, 'Asia/Ho_Chi_Minh');

      console.log('🔍 UTC Date:', utcDate.toISOString());
      console.log('🔍 GMT+7 Date:', gmt7Date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }));

      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const year = gmt7Date.getFullYear();
      const month = (gmt7Date.getMonth() + 1).toString().padStart(2, '0');
      const day = gmt7Date.getDate().toString().padStart(2, '0');
      const hours = gmt7Date.getHours().toString().padStart(2, '0');
      const minutes = gmt7Date.getMinutes().toString().padStart(2, '0');

      const formattedDateTime = `${year}-${month}-${day}T${hours}:${minutes}`;
      console.log('🔍 Formatted datetime-local:', formattedDateTime);

      setScheduledDateTime(formattedDateTime);

      // Validate initial time
      validateTime(formattedDateTime);
    }
  }, [schedule]);

  // Real-time time validation
  const validateTime = (dateTimeString: string) => {
    if (!dateTimeString) {
      setTimeValidation({ isValid: false, message: 'Vui lòng chọn thời gian' });
      return;
    }

    const selectedTime = new Date(dateTimeString);
    const now = new Date();
    const maxFutureTime = new Date();
    maxFutureTime.setFullYear(maxFutureTime.getFullYear() + 1);

    if (selectedTime <= now) {
      setTimeValidation({ isValid: false, message: 'Thời gian phải trong tương lai' });
      return;
    }

    if (selectedTime > maxFutureTime) {
      setTimeValidation({ isValid: false, message: 'Thời gian không được quá 1 năm trong tương lai' });
      return;
    }

    setTimeValidation({ isValid: true, message: 'Thời gian hợp lệ' });
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    setScheduledDateTime(newTime);
    validateTime(newTime);
  };

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

    if (!timeValidation.isValid) {
      toast({
        title: 'Lỗi',
        description: timeValidation.message,
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Create GMT+7 timestamp from datetime-local input
      const gmt7Timestamp = createTimestampFromDateTimeLocal(scheduledDateTime);
      
      // Call onUpdate and get success status
      const success = await onUpdate(schedule.id, gmt7Timestamp);
      
      if (success) {
        // Success! Parent component will handle closing the dialog
        console.log('✅ Update successful, parent will handle dialog closing');
        // No need to show toast here, it's handled by handleUpdateSchedule
        // No need to auto-close here, parent handles it
      }
      // If success is false, error toast was already shown by onUpdate
      
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
          {/* Schedule Info - Simplified */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Thông tin lịch đăng bài
            </h4>
            <div className="text-sm text-blue-800">
              <p className="font-medium">{schedule.video_title || 'Không có tiêu đề'}</p>
              <p className="text-xs mt-1">Chỉ có thể thay đổi thời gian đăng bài</p>
            </div>
          </div>

          {/* Time Selection */}
          <div className="space-y-3">
            <Label htmlFor="scheduledDateTime" className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-blue-600" />
              Thời gian đăng bài mới (GMT+7)
            </Label>
            <Input
              id="scheduledDateTime"
              type="datetime-local"
              value={scheduledDateTime}
              onChange={handleTimeChange}
              className={`w-full ${!timeValidation.isValid ? 'border-red-500 focus:border-red-500' : 'border-green-500 focus:border-green-500'}`}
              required
              disabled={isLoading}
            />
            
            {/* Validation Feedback */}
            <div className={`text-xs flex items-center gap-1 ${
              timeValidation.isValid ? 'text-green-600' : 'text-red-600'
            }`}>
              {timeValidation.isValid ? (
                <span className="text-green-500">✓</span>
              ) : (
                <span className="text-red-500">⚠</span>
              )}
              {timeValidation.message}
            </div>
            
            {/* Time Preview */}
            {scheduledDateTime && timeValidation.isValid && (
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-green-800">
                  <strong>Thời gian mới:</strong> {new Date(scheduledDateTime).toLocaleString('vi-VN', {
                    timeZone: 'Asia/Ho_Chi_Minh',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    weekday: 'long'
                  })}
                </p>
              </div>
            )}
            
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
              disabled={isLoading || !scheduledDateTime || !timeValidation.isValid}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật thời gian'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}