'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Eye, MousePointer, ExternalLink, Edit, Trash2, PlusCircle } from 'lucide-react';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';
import { useReviews, useDeleteReview, usePrefetchReviews } from '@/lib/hooks/useReviews';
import type { Review } from '@/types';

function ReviewsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // ✅ Use React Query for data fetching
  const { data, isLoading, isError, error } = useReviews({
    page: currentPage,
    limit: itemsPerPage,
  });

  // ✅ Use mutation for delete with optimistic updates
  const deleteReview = useDeleteReview();

  // ✅ Prefetch next page
  const prefetchReviews = usePrefetchReviews();

  const reviews = data?.data?.reviews || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalItems = data?.data?.total || 0;

  // Prefetch next page when hovering on pagination
  const handlePrefetchNextPage = () => {
    if (currentPage < totalPages) {
      prefetchReviews(currentPage + 1, itemsPerPage);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa review này?')) return;

    try {
      await deleteReview.mutateAsync(id);

      // Check if we need to go back a page
      const remainingItems = reviews.length - 1;
      if (remainingItems === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error('❌ Error deleting review:', error);
      alert(error instanceof Error ? error.message : 'Lỗi khi xóa review');
    }
  };

  // ✅ Skeleton loading state
  if (isLoading && reviews.length === 0) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reviews</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả landing pages đã tạo</p>
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

  // ✅ Error state
  if (isError) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Reviews</h1>
            <p className="text-gray-600 mt-1">Quản lý tất cả landing pages đã tạo</p>
          </div>
          <Link href="/dashboard/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Tạo Mới
            </Button>
          </Link>
        </div>

        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <p className="text-red-600 mb-4">
                {error instanceof Error ? error.message : 'Không thể tải reviews'}
              </p>
              <Button onClick={() => window.location.reload()}>Thử lại</Button>
            </div>
          </CardContent>
        </Card>
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
                    <p className="text-sm text-gray-600 line-clamp-2">{review.summary}</p>

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
                        disabled={deleteReview.isPending}
                      >
                        {deleteReview.isPending ? (
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
        <div className="mt-8" onMouseEnter={handlePrefetchNextPage}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={totalItems}
            showInfo={true}
          />
        </div>
      )}
    </div>
  );
}

// Export with user route protection
export default withUserRoute(ReviewsPage);
