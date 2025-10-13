'use client';

import { useCallback } from 'react';
import { useToast as useRadixToast } from '@/components/ui/use-toast';

export function useToast() {
  const { toast: radixToast } = useRadixToast();

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
      const config = {
        success: {
          title: 'Thành công',
          variant: 'default' as const,
        },
        error: {
          title: 'Lỗi',
          variant: 'destructive' as const,
        },
        warning: {
          title: 'Cảnh báo',
          variant: 'default' as const,
        },
        info: {
          title: 'Thông tin',
          variant: 'default' as const,
        },
      };

      radixToast({
        ...config[type],
        description: message,
      });
    },
    [radixToast]
  );

  const success = useCallback((message: string) => showToast(message, 'success'), [showToast]);
  const error = useCallback((message: string) => showToast(message, 'error'), [showToast]);
  const warning = useCallback((message: string) => showToast(message, 'warning'), [showToast]);
  const info = useCallback((message: string) => showToast(message, 'info'), [showToast]);

  return {
    toast: radixToast,
    showToast,
    success,
    error,
    warning,
    info,
  };
}










