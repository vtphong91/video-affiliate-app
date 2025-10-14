'use client';

import { useState, useCallback } from 'react';
import { useApi } from './useApi';
import { useToast } from './useToast';
import type { Schedule } from '@/types';

export function useSchedules() {
  const { success, error } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSchedules = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/schedules');
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch schedules');
      }
      
      setSchedules(result.data.schedules);
      return result.data.schedules;
    } catch (err: any) {
      error(err.message || 'Lỗi khi tải danh sách lịch đăng bài');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [error]);

  const createSchedule = useCallback(async (scheduleData: any) => {
    try {
      const response = await fetch('/api/schedules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(scheduleData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to create schedule');
      }
      
      success('Tạo lịch đăng bài thành công!');
      await fetchSchedules(); // Refresh the list
      return result.data;
    } catch (err: any) {
      error(err.message || 'Lỗi khi tạo lịch đăng bài');
      throw err;
    }
  }, [success, error, fetchSchedules]);

  const updateSchedule = useCallback(async (id: string, updateData: any) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update schedule');
      }
      
      success('Cập nhật lịch đăng bài thành công!');
      await fetchSchedules(); // Refresh the list
      return result.data;
    } catch (err: any) {
      error(err.message || 'Lỗi khi cập nhật lịch đăng bài');
      throw err;
    }
  }, [success, error, fetchSchedules]);

  const deleteSchedule = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete schedule');
      }
      
      success('Xóa lịch đăng bài thành công!');
      await fetchSchedules(); // Refresh the list
      return result;
    } catch (err: any) {
      error(err.message || 'Lỗi khi xóa lịch đăng bài');
      throw err;
    }
  }, [success, error, fetchSchedules]);

  const retrySchedule = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/schedules/${id}/retry`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to retry schedule');
      }
      
      success('Thử lại lịch đăng bài thành công!');
      await fetchSchedules(); // Refresh the list
      return result;
    } catch (err: any) {
      error(err.message || 'Lỗi khi thử lại lịch đăng bài');
      throw err;
    }
  }, [success, error, fetchSchedules]);

  return {
    schedules,
    loading,
    fetchSchedules,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    retrySchedule,
  };
}














