'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VideoAnalyzer } from '@/components/VideoAnalyzer';
import { AIContentEditor } from '@/components/AIContentEditor';
import { ReviewPreview } from '@/components/ReviewPreview';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, Sparkles, FileText, AlertCircle } from 'lucide-react';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useUser } from '@/lib/auth/hooks/useUser';
import { supabaseBrowser as supabase } from '@/lib/auth/supabase-browser';
import type { VideoInfo, AIAnalysis, AffiliateLink, Category } from '@/types';

type CreateStep = 'analyze' | 'template' | 'edit' | 'preview';
type CreationMode = 'template' | 'traditional';

function CreateReviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useAuth();
  const { displayName } = useUser();

  const [step, setStep] = useState<CreateStep>('analyze');
  const [mode, setMode] = useState<CreationMode | null>(null);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);

  // Review states
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

      if (data.success && data.data) {
        // API returns { success: true, data: { topics: [...] } }
        const topicsArray = data.data.topics || [];

        // Ensure it's an array before mapping
        if (Array.isArray(topicsArray)) {
          const categoriesData = topicsArray.map((topic: any) => ({
            ...topic,
            icon: topic.icon || '📁'
          }));
          setCategories(categoriesData);
        } else {
          console.error('Topics is not an array:', topicsArray);
          setCategories([]);
        }
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      setCategories([]);
    }
  };

  const handleAnalysisComplete = (info: VideoInfo, aiAnalysis: AIAnalysis) => {
    console.log('📹 handleAnalysisComplete - VideoInfo:', {
      title: info.title.substring(0, 50),
      hasDescription: !!info.description,
      hasTranscript: !!info.transcript,
      transcriptLength: info.transcript?.length,
      channelName: info.channelName
    });

    setVideoInfo(info);
    setAnalysis(aiAnalysis);
    setCustomTitle(info.title);

    // After analysis, ask user to choose mode
    setMode(null);
    setStep('template');
  };

  const handleModeSelect = (selectedMode: CreationMode) => {
    setMode(selectedMode);

    if (selectedMode === 'traditional') {
      // Skip template selection, go directly to edit
      setStep('edit');
    } else {
      // Stay on template step for selection
      setStep('template');
    }
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
      // Try to get session, refresh if needed
      let { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.log('Session not found, attempting refresh...');
        const { data: { session: refreshedSession } } = await supabase.auth.refreshSession();
        session = refreshedSession;
      }

      if (!session?.access_token) {
        throw new Error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
      }

      const response = await fetch('/api/create-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          videoUrl: `https://youtube.com/watch?v=${videoInfo.videoId}`,
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

  const getStepNumber = (currentStep: CreateStep) => {
    const steps: CreateStep[] = ['analyze', 'template', 'edit', 'preview'];
    return steps.indexOf(currentStep) + 1;
  };

  const getStepLabel = (currentStep: CreateStep) => {
    const labels: Record<CreateStep, string> = {
      analyze: 'Phân tích',
      template: 'Chọn chế độ',
      edit: 'Chỉnh sửa',
      preview: 'Preview',
    };
    return labels[currentStep];
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
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {/* Step 1: Analyze */}
            <div className={`flex items-center gap-2 ${
              step === 'analyze' ? 'text-blue-600 font-bold' :
              getStepNumber(step) > 1 ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'analyze' ? 'bg-blue-600 text-white' :
                getStepNumber(step) > 1 ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              <span className="hidden sm:inline">Phân tích</span>
            </div>

            <div className="w-8 h-0.5 bg-gray-300" />

            {/* Step 2: Template/Mode Selection */}
            <div className={`flex items-center gap-2 ${
              step === 'template' ? 'text-blue-600 font-bold' :
              getStepNumber(step) > 2 ? 'text-green-600' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'template' ? 'bg-blue-600 text-white' :
                getStepNumber(step) > 2 ? 'bg-green-600 text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              <span className="hidden sm:inline">Chọn chế độ</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300" />

            {/* Step 3: Preview */}
            <div className={`flex items-center gap-2 ${
              step === 'preview' ? 'text-blue-600 font-bold' : 'text-gray-400'
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step === 'preview' ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              <span className="hidden sm:inline">Hoàn tất</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Analyze Video */}
      {step === 'analyze' && (
        <VideoAnalyzer onAnalysisComplete={handleAnalysisComplete} />
      )}

      {/* Step 2: Choose Mode & Template */}
      {step === 'template' && videoInfo && (
        <div className="space-y-6">
          {!mode ? (
            <Card>
              <CardHeader>
                <CardTitle>Chọn cách tạo review</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <Sparkles className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Mới!</strong> Sử dụng Templates để tạo review với phong cách chuyên nghiệp và đa dạng
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Template Mode - Redirect to new page */}
                  <button
                    onClick={() => router.push('/dashboard/create-from-template')}
                    className="p-6 border-2 border-blue-200 hover:border-blue-500 rounded-lg text-left transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                        <Sparkles className="h-6 w-6 text-blue-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Dùng Template</h3>
                        <span className="text-xs text-blue-600">✨ Được khuyên dùng</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>✅ Quy trình 3 bước đơn giản</li>
                      <li>✅ Tự động phân tích video</li>
                      <li>✅ Tùy chỉnh tone, ngôn ngữ, độ dài</li>
                      <li>✅ AI tạo nội dung chất lượng cao</li>
                    </ul>
                  </button>

                  {/* Traditional Mode */}
                  <button
                    onClick={() => handleModeSelect('traditional')}
                    className="p-6 border-2 border-gray-200 hover:border-gray-400 rounded-lg text-left transition-all hover:shadow-lg group"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-500 transition-colors">
                        <FileText className="h-6 w-6 text-gray-600 group-hover:text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">Cách truyền thống</h3>
                        <span className="text-xs text-gray-600">Quen thuộc</span>
                      </div>
                    </div>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li>📝 AI phân tích tự động</li>
                      <li>✏️ Chỉnh sửa nội dung trực tiếp</li>
                      <li>📊 Pros/Cons structure</li>
                      <li>⚡ Nhanh và đơn giản</li>
                    </ul>
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}

      {/* Step 3: Edit (Traditional Mode) */}
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
              </div>

              <div>
                <Label htmlFor="custom-title">Tiêu đề landing page</Label>
                <Input
                  id="custom-title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Nhập tiêu đề tùy chỉnh"
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
                    📝 Nháp
                  </Button>
                  <Button
                    type="button"
                    variant={reviewStatus === 'published' ? 'default' : 'outline'}
                    onClick={() => setReviewStatus('published')}
                    className="flex-1"
                  >
                    ✅ Xuất bản
                  </Button>
                </div>
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
            <Button variant="outline" onClick={() => {
              setMode(null);
              setStep('template');
            }}>
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

      {/* Step 4: Preview & Share */}
      {step === 'preview' && savedReview && (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              ✅ Review đã được lưu thành công
            </AlertDescription>
          </Alert>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold mb-2">Nội dung đã tạo:</h3>
                  {videoInfo && analysis ? (
                    <ReviewPreview
                      videoInfo={videoInfo}
                      analysis={analysis}
                      affiliateLinks={affiliateLinks}
                      customTitle={customTitle}
                    />
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => router.push(`/dashboard/reviews/${savedReview.id}/edit`)}>
              Chỉnh Sửa
            </Button>
            <Button variant="outline" onClick={() => window.open(`/review/${savedReview.slug}`, '_blank')}>
              Xem Công Khai
            </Button>
            <Button onClick={() => {
              // Force refresh reviews page by adding timestamp parameter
              router.push(`/dashboard/reviews?refresh=${Date.now()}`);
            }} className="flex-1">
              Xem Tất Cả Reviews
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withUserRoute(CreateReviewPage);
