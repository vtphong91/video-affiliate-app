'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Eye, MousePointer, ExternalLink, Edit, Trash2, PlusCircle } from 'lucide-react';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useUser } from '@/lib/auth/hooks/useUser';
import { useAuthHeaders } from '@/lib/hooks/useAuthHeaders';
import { cachedFetch, invalidateCache } from '@/lib/utils/request-cache';
import { SkeletonGrid, ReviewCardSkeleton } from '@/components/ui/skeleton';
import type { Review } from '@/types';

function ReviewsPage() {
  const { user } = useAuth();
  const { displayName } = useUser();
  const headers = useAuthHeaders();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6; // Show 6 reviews per page

  // ✅ FIX: Use user?.id instead of user object to prevent unnecessary re-fetches
  const userId = user?.id;

  // Fetch reviews with caching
  const fetchReviews = useCallback(async (page: number, force = false) => {
    try {
      setLoading(true);

      console.log('🔍 ReviewsPage: Fetching reviews for page', page);

      // ✅ Use cachedFetch with 60 second TTL
      const data = await cachedFetch(
        `/api/reviews?page=${page}&limit=${itemsPerPage}`,
        {
          headers,
          ttl: 60000, // 60 seconds cache
          force, // Force refresh if specified
        }
      );

      if (data.success) {
        setReviews(data.data?.reviews || []);
        setTotalPages(data.data?.totalPages || 1);
        setTotalItems(data.data?.total || 0);
      }
    } catch (error) {
      console.error('❌ Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [headers, itemsPerPage]);

  // ✅ FIX: Simplified dependency - only need userId and currentPage
  useEffect(() => {
    if (userId) {
      console.log('🔍 ReviewsPage: User ID available, fetching reviews for page:', currentPage);
      fetchReviews(currentPage);
    } else {
      console.log('🔍 ReviewsPage: No user ID, skipping fetch');
      setLoading(false);
    }
  }, [currentPage, userId, fetchReviews]);

  // ✅ Prefetch next page on mount
  useEffect(() => {
    if (currentPage < totalPages && headers['x-user-id']) {
      // Prefetch next page in background
      const timer = setTimeout(() => {
        console.log('🔮 Prefetching next page:', currentPage + 1);
        cachedFetch(
          `/api/reviews?page=${currentPage + 1}&limit=${itemsPerPage}`,
          { headers, ttl: 60000 }
        ).catch(() => {}); // Silently fail
      }, 1000); // Delay 1 second

      return () => clearTimeout(timer);
    }
  }, [currentPage, totalPages, headers, itemsPerPage]);

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa review này?')) return;

    try {
      setDeleting(id);

      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (response.ok) {
        console.log('✅ Review deleted successfully');

        // ✅ Invalidate cache for reviews
        invalidateCache(/\/api\/reviews/);

        // Check if we need to go back a page (if this was the last item on current page)
        const remainingItems = reviews.length - 1;
        if (remainingItems === 0 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          // Force refetch current page
          await fetchReviews(currentPage, true);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.error || 'Không thể xóa review');
      }
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      alert('Lỗi khi xóa review');
    } finally {
      setDeleting(null);
    }
  };

  // ✅ Prefetch next page on hover
  const prefetchNextPage = useCallback(() => {
    if (currentPage < totalPages && headers['x-user-id']) {
      cachedFetch(
        `/api/reviews?page=${currentPage + 1}&limit=${itemsPerPage}`,
        { headers, ttl: 60000 }
      ).catch(() => {});
    }
  }, [currentPage, totalPages, headers, itemsPerPage]);

  // ✅ Show skeleton loading instead of spinner
  if (loading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reviews</h1>
            <p className="text-gray-600 mt-1">
              Quản lý tất cả landing pages đã tạo
            </p>
          </div>
          <Link href="/dashboard/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tạo Mới
            </Button>
          </Link>
        </div>

        {/* Skeleton Grid */}
        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="flex gap-4">
                  <div className="w-40 h-24 bg-gray-200 rounded" />
                  <div className="flex-1 space-y-3">
                    <div className="h-6 bg-gray-200 rounded w-3/4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                    <div className="h-4 bg-gray-200 rounded w-full" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded w-20" />
                      <div className="h-8 bg-gray-200 rounded w-20" />
                      <div className="h-8 bg-gray-200 rounded w-20" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Show auth loading
  if (!userId) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent mb-4" />
          <p className="text-gray-600">Đang xác thực...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-gray-600 mt-1">
            Quản lý tất cả landing pages đã tạo ({totalItems} reviews)
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tạo Mới
          </Button>
        </Link>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Chưa có review nào</p>
              <p className="mb-4">Tạo landing page review đầu tiên của bạn</p>
              <Link href="/dashboard/create">
                <Button>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Tạo Review Ngay
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <img
                    src={review.video_thumbnail}
                    alt={review.video_title}
                    className="w-40 h-24 object-cover rounded"
                    loading="lazy"
                  />

                  {/* Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-lg">
                          {review.custom_title || review.video_title}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {review.video_platform === 'youtube' ? '📺 YouTube' : '🎵 TikTok'}
                          {' • '}
                          {new Date(review.created_at).toLocaleDateString('vi-VN')}
                        </p>
                      </div>
                      <Badge variant={review.status === 'published' ? 'default' : 'secondary'}>
                        {review.status === 'published' ? 'Đã đăng' : 'Nháp'}
                      </Badge>
                    </div>

                    {/* Summary */}
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {review.summary}
                    </p>

                    {/* Stats */}
                    <div className="flex gap-6 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" />
                        {review.views} lượt xem
                      </span>
                      <span className="flex items-center gap-1">
                        <MousePointer className="h-4 w-4" />
                        {review.clicks} clicks
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/review/${review.slug}`} target="_blank">
                        <Button variant="outline" size="sm">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Xem
                        </Button>
                      </Link>
                      <Link href={`/dashboard/reviews/${review.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-2" />
                          Sửa
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(review.id)}
                        disabled={deleting === review.id}
                      >
                        {deleting === review.id ? (
                          <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                        ) : (
                          <Trash2 className="h-4 w-4 mr-2" />
                        )}
                        Xóa
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {reviews.length > 0 && totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            showInfo={true}
          />

          {/* ✅ Prefetch button (hidden, triggers on hover) */}
          {currentPage < totalPages && (
            <div
              className="hidden"
              onMouseEnter={prefetchNextPage}
              aria-hidden="true"
            />
          )}
        </div>
      )}
    </div>
  );
}

// Export with user route protection
export default withUserRoute(ReviewsPage);
