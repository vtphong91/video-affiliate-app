'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { Eye, MousePointer, ExternalLink, Edit, Trash2, PlusCircle, Loader2 } from 'lucide-react';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';
import { useAuth } from '@/lib/auth/providers/SupabaseAuthProvider';
import { useUser } from '@/lib/auth/hooks/useUser';
import type { Review } from '@/types';

function ReviewsPage() {
  const { user } = useAuth();
  const { displayName } = useUser();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 6; // Show 6 reviews per page

  useEffect(() => {
    fetchReviews();
  }, [currentPage]); // Refetch when page changes

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reviews?page=${currentPage}&limit=${itemsPerPage}`);
      const data = await response.json();
      
      if (data.success) {
        setReviews(data.data?.reviews || []);
        setTotalPages(data.data?.totalPages || 1);
        setTotalItems(data.data?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa review này?')) return;

    try {
      setDeleting(id);
      const response = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        alert('Không thể xóa review');
      }
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Lỗi khi xóa review');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
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
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
        </div>
      )}
    </div>
  );
}

// Export with user route protection
export default withUserRoute(ReviewsPage);
