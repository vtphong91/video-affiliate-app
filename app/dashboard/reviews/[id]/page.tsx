'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Edit, 
  ExternalLink, 
  Eye, 
  MousePointer, 
  TrendingUp,
  Calendar,
  User,
  Globe,
  Loader2
} from 'lucide-react';
import { ReviewPreview } from '@/components/ReviewPreview';
import type { Review, VideoInfo, AIAnalysis } from '@/types';

export default function ReviewDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reviewId = params.id as string;

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReview();
  }, [reviewId]);

  const fetchReview = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/reviews/${reviewId}`);
      const data = await response.json();

      if (data.success) {
        setReview(data.review);
      } else {
        setError(data.error || 'Không thể tải review');
      }
    } catch (err) {
      console.error('Error fetching review:', err);
      setError('Lỗi khi tải review');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (error || !review) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
        
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-gray-500">
              <p className="text-lg font-medium mb-2">Không tìm thấy review</p>
              <p className="mb-4">{error}</p>
              <Button onClick={() => router.push('/dashboard/reviews')}>
                Xem tất cả reviews
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert database format to component props
  const videoInfo: VideoInfo = {
    platform: review.video_platform,
    videoId: review.video_id,
    title: review.video_title,
    thumbnail: review.video_thumbnail,
    description: review.video_description || '',
    duration: '0:00',
    channelName: review.channel_name || '',
    channelUrl: review.channel_url || '',
  };

  const analysis: AIAnalysis = {
    summary: review.summary,
    pros: review.pros,
    cons: review.cons,
    keyPoints: review.key_points,
    comparisonTable: review.comparison_table,
    targetAudience: review.target_audience,
    cta: review.cta,
    seoKeywords: review.seo_keywords,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {review.custom_title || review.video_title}
            </h1>
            <p className="text-gray-600">
              Tạo lúc: {formatDate(review.created_at)}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={review.status === 'published' ? 'default' : 'secondary'}>
            {review.status === 'published' ? 'Published' : 'Draft'}
          </Badge>
          
          <Link href={`/dashboard/reviews/${review.id}/edit`}>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Chỉnh sửa
            </Button>
          </Link>
          
          <Link href={`/review/${review.slug}`} target="_blank">
            <Button>
              <ExternalLink className="h-4 w-4 mr-2" />
              Xem Public
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{review.views}</div>
                <div className="text-sm text-gray-600">Lượt xem</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MousePointer className="h-4 w-4 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{review.clicks}</div>
                <div className="text-sm text-gray-600">Clicks</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{review.conversions}</div>
                <div className="text-sm text-gray-600">Conversions</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-purple-600" />
              <div>
                <div className="text-sm font-bold">{review.video_platform}</div>
                <div className="text-sm text-gray-600">Platform</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="preview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="preview">Preview</TabsTrigger>
          <TabsTrigger value="facebook">Facebook Post</TabsTrigger>
          <TabsTrigger value="details">Chi tiết</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Preview Landing Page</CardTitle>
            </CardHeader>
            <CardContent>
              <ReviewPreview
                videoInfo={videoInfo}
                analysis={analysis}
                affiliateLinks={review.affiliate_links}
                customTitle={review.custom_title}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="facebook">
          <Card>
            <CardHeader>
              <CardTitle>Đăng lên Facebook</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-8 text-center text-gray-500">
                <p>Facebook Poster component đã được tạm thời vô hiệu hóa để fix lỗi deploy.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin Video</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-600">Video URL</label>
                  <p className="text-sm break-all text-blue-600">
                    <a href={review.video_url} target="_blank" rel="noopener noreferrer">
                      {review.video_url}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Video ID</label>
                  <p className="text-sm font-mono">{review.video_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Platform</label>
                  <p className="text-sm">{review.video_platform}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Channel</label>
                  <p className="text-sm">{review.channel_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">Slug</label>
                  <p className="text-sm font-mono">{review.slug}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Affiliate Links</CardTitle>
              </CardHeader>
              <CardContent>
                {review.affiliate_links.length === 0 ? (
                  <p className="text-gray-500 text-sm">Chưa có affiliate links</p>
                ) : (
                  <div className="space-y-2">
                    {review.affiliate_links.map((link, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="font-medium">{link.platform}</div>
                        <div className="text-sm text-gray-600">{link.price}</div>
                        <div className="text-xs text-blue-600 break-all">{link.url}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
