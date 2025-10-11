'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VideoAnalyzer } from '@/components/VideoAnalyzer';
import { AIContentEditor } from '@/components/AIContentEditor';
import { ReviewPreview } from '@/components/ReviewPreview';
import { FacebookPoster } from '@/components/FacebookPoster';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save } from 'lucide-react';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';
import { useAuth } from '@/lib/auth/providers/SupabaseAuthProvider';
import { useUser } from '@/lib/auth/hooks/useUser';
import type { VideoInfo, AIAnalysis, AffiliateLink, Category } from '@/types';

function CreateReviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { displayName } = useUser();

  const [step, setStep] = useState<'analyze' | 'edit' | 'preview'>('analyze');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [savedReview, setSavedReview] = useState<{ id: string; slug: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [reviewStatus, setReviewStatus] = useState<'draft' | 'published'>('draft');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      
      if (data.success) {
        // API trả về 'topics' chứ không phải 'categories'
        const categoriesData = (data.data?.topics || data.topics || data.categories || []).map((topic: any) => ({
          ...topic,
          icon: topic.icon || '📁' // Thêm icon mặc định nếu không có
        }));
        setCategories(categoriesData);
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Fallback to empty array
      setCategories([]);
    }
  };

  const handleAnalysisComplete = (info: VideoInfo, aiAnalysis: AIAnalysis) => {
    setVideoInfo(info);
    setAnalysis(aiAnalysis);
    setCustomTitle(info.title);
    setStep('edit');
  };

  const handleAnalysisUpdate = (updates: Partial<AIAnalysis>) => {
    if (analysis) {
      setAnalysis({ ...analysis, ...updates });
    }
  };

  const handleSaveReview = async () => {
    if (!videoInfo || !analysis) return;

    setIsSaving(true);

    try {
      const response = await fetch('/api/create-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoInfo.videoUrl || `https://youtube.com/watch?v=${videoInfo.videoId}`, // Store original URL if available
          videoInfo,
          analysis,
          customTitle,
          customContent,
          affiliateLinks,
          categoryId: selectedCategoryId || null,
          status: reviewStatus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Có lỗi xảy ra');
      }

      const data = await response.json();
      setSavedReview({ id: data.review.id, slug: data.review.slug });

      toast({
        title: 'Lưu thành công!',
        description: 'Review đã được lưu vào database',
      });

      setStep('preview');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Lỗi',
        description:
          error instanceof Error ? error.message : 'Không thể lưu review',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Tạo Review Mới</h1>
        <p className="text-gray-600 mt-1">
          Tạo landing page review từ video YouTube hoặc TikTok
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-4">
            <div
              className={`flex items-center gap-2 ${
                step === 'analyze' ? 'text-blue-600 font-bold' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'analyze' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                1
              </div>
              <span>Phân Tích</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300" />
            <div
              className={`flex items-center gap-2 ${
                step === 'edit' ? 'text-blue-600 font-bold' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'edit' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                2
              </div>
              <span>Chỉnh Sửa</span>
            </div>
            <div className="w-12 h-0.5 bg-gray-300" />
            <div
              className={`flex items-center gap-2 ${
                step === 'preview' ? 'text-blue-600 font-bold' : 'text-gray-400'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}
              >
                3
              </div>
              <span>Chia Sẻ</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Analyze */}
      {step === 'analyze' && (
        <VideoAnalyzer onAnalysisComplete={handleAnalysisComplete} />
      )}

      {/* Step 2: Edit */}
      {step === 'edit' && videoInfo && analysis && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="category">Danh mục *</Label>
                <select
                  id="category"
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">-- Chọn danh mục --</option>
                  {categories && categories.length > 0 ? categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon || '📁'} {cat.name}
                    </option>
                  )) : (
                    <option disabled>Đang tải danh mục...</option>
                  )}
                </select>
                <p className="text-xs text-muted-foreground mt-1">
                  Chọn danh mục phù hợp cho review này
                </p>
              </div>

              <div>
                <Label htmlFor="custom-title">Tiêu đề landing page</Label>
                <Input
                  id="custom-title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Nhập tiêu đề tùy chỉnh hoặc để trống để dùng tiêu đề video"
                />
              </div>

              <div>
                <Label htmlFor="status">Trạng thái</Label>
                <div className="flex gap-3 mt-2">
                  <Button
                    type="button"
                    variant={reviewStatus === 'draft' ? 'default' : 'outline'}
                    onClick={() => setReviewStatus('draft')}
                    className="flex-1"
                  >
                    📝 Nháp (Draft)
                  </Button>
                  <Button
                    type="button"
                    variant={reviewStatus === 'published' ? 'default' : 'outline'}
                    onClick={() => setReviewStatus('published')}
                    className="flex-1"
                  >
                    ✅ Xuất bản (Published)
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {reviewStatus === 'published'
                    ? '✅ Review sẽ hiển thị trên trang chủ công khai'
                    : '📝 Review chỉ hiển thị trong dashboard, không xuất hiện ngoài trang chủ'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="content">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">Nội Dung</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
            <TabsContent value="content" className="space-y-6">
              <AIContentEditor
                analysis={analysis}
                onChange={handleAnalysisUpdate}
                affiliateLinks={affiliateLinks}
                onAffiliateLinksChange={setAffiliateLinks}
              />
            </TabsContent>
            <TabsContent value="preview">
              <ReviewPreview
                videoInfo={videoInfo}
                analysis={analysis}
                affiliateLinks={affiliateLinks}
                customTitle={customTitle}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('analyze')}>
              Quay Lại
            </Button>
            <Button onClick={handleSaveReview} disabled={isSaving} className="flex-1">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu & Tiếp Tục
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & Share */}
      {step === 'preview' && videoInfo && analysis && savedReview && (
        <div className="space-y-6">
          <Tabs defaultValue="preview">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview">Preview Final</TabsTrigger>
              <TabsTrigger value="facebook">Đăng Facebook</TabsTrigger>
            </TabsList>
            <TabsContent value="preview">
              <ReviewPreview
                videoInfo={videoInfo}
                analysis={analysis}
                affiliateLinks={affiliateLinks}
                customTitle={customTitle}
              />
            </TabsContent>
            <TabsContent value="facebook">
              <FacebookPoster
                reviewId={savedReview.id}
                slug={savedReview.slug}
                videoTitle={customTitle || videoInfo.title}
                videoUrl={`https://www.${videoInfo.platform === 'youtube' ? 'youtube.com/watch?v=' : 'tiktok.com/@video/'}${videoInfo.videoId}`}
                videoThumbnail={videoInfo.thumbnail}
                channelName={videoInfo.channelName}
                analysis={analysis}
                affiliateLinks={affiliateLinks}
              />
            </TabsContent>
          </Tabs>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('edit')}>
              Chỉnh Sửa
            </Button>
            <Button onClick={() => router.push('/dashboard/reviews')} className="flex-1">
              Xem Tất Cả Reviews
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export with user route protection
export default withUserRoute(CreateReviewPage);
