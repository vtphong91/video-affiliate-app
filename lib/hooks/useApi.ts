'use client';

import { useState, useCallback } from 'react';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
}

export function useApi<T = any>(
  apiFunction: (...args: any[]) => Promise<T>,
  options: UseApiOptions = {}
) {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(
    async (...args: any[]) => {
      setState(prev => ({ ...prev, loading: true, error: null }));

      try {
        const result = await apiFunction(...args);
        setState({ data: result, loading: false, error: null });
        
        if (options.onSuccess) {
          options.onSuccess(result);
        }
        
        return result;
      } catch (error: any) {
        const errorMessage = error.message || 'An error occurred';
        setState({ data: null, loading: false, error: errorMessage });
        
        if (options.onError) {
          options.onError(errorMessage);
        }
        
        throw error;
      }
    },
    [apiFunction, options]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// Specific API hooks
export function useSchedules() {
  const fetchSchedules = async () => {
    const response = await fetch('/api/schedules');
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch schedules');
    }
    
    return result.data.schedules;
  };

  return useApi(fetchSchedules);
}

export function useReviews() {
  const fetchReviews = async () => {
    const response = await fetch('/api/reviews');
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch reviews');
    }
    
    return result.data;
  };

  return useApi(fetchReviews);
}

export function useDashboardStats() {
  const fetchStats = async () => {
    const response = await fetch('/api/dashboard/stats');
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.error || 'Failed to fetch dashboard stats');
    }
    
    return result.data;
  };

  return useApi(fetchStats);
}







