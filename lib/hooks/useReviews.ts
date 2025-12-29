/**
 * React Query hooks for reviews API
 *
 * Features:
 * - Automatic caching and background refetching
 * - Optimistic updates for mutations
 * - Pagination support
 * - Smart invalidation
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthHeaders } from './useAuthHeaders';
import type { Review } from '@/types';

interface ReviewsResponse {
  success: boolean;
  data?: {
    reviews: Review[];
    total: number;
    totalPages: number;
    currentPage: number;
  };
  error?: string;
}

interface UseReviewsOptions {
  page?: number;
  limit?: number;
  status?: 'draft' | 'published';
  excludeScheduled?: boolean;
  enabled?: boolean; // Allow disabling the query
}

/**
 * Fetch reviews with pagination and caching
 */
export function useReviews(options: UseReviewsOptions = {}) {
  const {
    page = 1,
    limit = 6,
    status,
    excludeScheduled = false,
    enabled = true,
  } = options;

  const headers = useAuthHeaders();

  return useQuery({
    queryKey: ['reviews', { page, limit, status, excludeScheduled }],
    queryFn: async (): Promise<ReviewsResponse> => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (status) params.append('status', status);
      if (excludeScheduled) params.append('excludeScheduled', 'true');

      const response = await fetch(`/api/reviews?${params.toString()}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }

      return response.json();
    },
    enabled: enabled && !!headers['x-user-id'], // Only run when authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter than default for fresh data)
    placeholderData: (previousData) => previousData, // Keep previous data while loading
  });
}

/**
 * Fetch single review by ID
 */
export function useReview(reviewId: string | undefined) {
  const headers = useAuthHeaders();

  return useQuery({
    queryKey: ['review', reviewId],
    queryFn: async (): Promise<Review> => {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch review');
      }

      const data = await response.json();
      return data.data;
    },
    enabled: !!reviewId && !!headers['x-user-id'],
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Delete review mutation with optimistic updates
 */
export function useDeleteReview() {
  const queryClient = useQueryClient();
  const headers = useAuthHeaders();

  return useMutation({
    mutationFn: async (reviewId: string) => {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete review');
      }

      return response.json();
    },
    onMutate: async (reviewId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['reviews'] });

      // Snapshot previous value
      const previousReviews = queryClient.getQueriesData({ queryKey: ['reviews'] });

      // Optimistically remove the review from all cached queries
      queryClient.setQueriesData<ReviewsResponse>(
        { queryKey: ['reviews'] },
        (old) => {
          if (!old?.data) return old;

          return {
            ...old,
            data: {
              ...old.data,
              reviews: old.data.reviews.filter((r) => r.id !== reviewId),
              total: old.data.total - 1,
            },
          };
        }
      );

      return { previousReviews };
    },
    onError: (err, reviewId, context) => {
      // Rollback on error
      if (context?.previousReviews) {
        context.previousReviews.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
}

/**
 * Update review mutation
 */
export function useUpdateReview() {
  const queryClient = useQueryClient();
  const headers = useAuthHeaders();

  return useMutation({
    mutationFn: async ({
      reviewId,
      data,
    }: {
      reviewId: string;
      data: Partial<Review>;
    }) => {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update review');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['review', variables.reviewId] });
    },
  });
}

/**
 * Prefetch next page for smoother pagination
 */
export function usePrefetchReviews() {
  const queryClient = useQueryClient();
  const headers = useAuthHeaders();

  return (page: number, limit: number = 6) => {
    queryClient.prefetchQuery({
      queryKey: ['reviews', { page, limit }],
      queryFn: async () => {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        const response = await fetch(`/api/reviews?${params.toString()}`, {
          headers,
        });

        if (!response.ok) {
          throw new Error('Failed to prefetch reviews');
        }

        return response.json();
      },
      staleTime: 2 * 60 * 1000,
    });
  };
}
