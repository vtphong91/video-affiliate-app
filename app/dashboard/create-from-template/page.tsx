'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, Save, Plus, X, AlertCircle, CheckCircle } from 'lucide-react';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';

type Step = 'video-input' | 'config' | 'edit' | 'preview';
type Platform = 'youtube' | 'tiktok';

interface VideoData {
  videoTitle: string;
  videoDescription: string;
  channelName: string;
  platform: Platform;
  transcript: string;
  videoUrl: string;
  videoId: string;
}

interface ReviewContent {
  summary: string;
  pros: string[];
  cons: string[];
  keyPoints: Array<{ time: string; content: string }>;
  mainContent: string;
  cta: string;
  targetAudience: string[];
  seoKeywords: string[];
}

function CreateFromTemplatePage() {
  const router = useRouter();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>('video-input');
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Step 1: Video Data (auto-filled)
  const [videoData, setVideoData] = useState<VideoData | null>(null);

  // Step 2: Config (user selects)
  const [tone, setTone] = useState<string>('');
  const [language, setLanguage] = useState<string>('');
  const [length, setLength] = useState<string>('');

  // Step 3: Review Content (AI-generated + editable)
  const [reviewContent, setReviewContent] = useState<ReviewContent>({
    summary: '',
    pros: [],
    cons: [],
    keyPoints: [],
    mainContent: '',
    cta: '',
    targetAudience: [],
    seoKeywords: [],
  });

  // Step 4: Affiliate Links
  const [affiliateLinks, setAffiliateLinks] = useState<Array<{ platform: string; price: string; url: string }>>([]);

  // Step 5: Status
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  const toneOptions = [
    { value: 'professional', label: 'Chuyên nghiệp' },
    { value: 'natural', label: 'Tự nhiên' },
    { value: 'friendly', label: 'Thân thiện' },
    { value: 'casual', label: 'Thoải mái' },
    { value: 'authoritative', label: 'Có thẩm quyền' },
  ];

  const languageOptions = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'Tiếng Anh' },
  ];

  const lengthOptions = [
    { value: 'short', label: 'Ngắn (300-500 từ)' },
    { value: 'medium', label: 'Trung bình (500-800 từ)' },
    { value: 'long', label: 'Dài (800-1200 từ)' },
  ];

  // Step 1: Analyze Video
  const handleAnalyzeVideo = async () => {
    if (!videoUrl.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập URL video',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể phân tích video');
      }

      // Map API response to VideoData
      const videoInfo = data.data.videoInfo;
      setVideoData({
        videoTitle: videoInfo.title || '',
        videoDescription: videoInfo.description || '',
        channelName: videoInfo.channelName || '',
        platform: videoInfo.platform || 'youtube',
        transcript: videoInfo.transcript || '',
        videoUrl: videoUrl,
        videoId: videoInfo.videoId || '',
      });

      toast({
        title: 'Thành công!',
        description: 'Đã phân tích video thành công',
      });

      setStep('config');
    } catch (error) {
      console.error('Analyze error:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể phân tích video',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Step 2: Generate Review Content with Template
  const handleGenerateContent = async () => {
    if (!videoData || !tone || !language || !length) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn đầy đủ tone, ngôn ngữ và độ dài',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Use the facebook_product_review_optimized template
      // We need to get the template ID first
      const templatesResponse = await fetch('/api/templates?category=general&platform=facebook&is_system=true');
      const templatesData = await templatesResponse.json();

      if (!templatesData.success || !templatesData.data || templatesData.data.length === 0) {
        throw new Error('Không tìm thấy template Facebook Product Review');
      }

      // Find the facebook_product_review_optimized template
      const template = templatesData.data.find((t: any) =>
        t.name?.toLowerCase().includes('facebook') && t.name?.toLowerCase().includes('product')
      );

      if (!template) {
        throw new Error('Không tìm thấy template Facebook Product Review');
      }

      const response = await fetch('/api/generate-review-from-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          videoData: {
            videoTitle: videoData.videoTitle,
            videoDescription: videoData.videoDescription,
            channelName: videoData.channelName,
            platform: videoData.platform,
            transcript: videoData.transcript,
          },
          config: {
            tone,
            language,
            length,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo nội dung review');
      }

      // Set generated content
      setReviewContent(data.data);

      toast({
        title: 'Thành công!',
        description: 'Đã tạo nội dung review từ template',
      });

      setStep('edit');
    } catch (error) {
      console.error('Generate error:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo nội dung review',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Step 3: Save Review
  const handleSaveReview = async () => {
    if (!videoData) return;

    setIsSaving(true);

    try {
      const response = await fetch('/api/create-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoData.videoUrl,
          videoInfo: {
            videoId: videoData.videoId,
            title: videoData.videoTitle,
            description: videoData.videoDescription,
            channelName: videoData.channelName,
            platform: videoData.platform,
            transcript: videoData.transcript,
          },
          analysis: {
            summary: reviewContent.summary,
            pros: reviewContent.pros,
            cons: reviewContent.cons,
            keyPoints: reviewContent.keyPoints,
            targetAudience: reviewContent.targetAudience,
            seoKeywords: reviewContent.seoKeywords,
            cta: reviewContent.cta,
          },
          customTitle: videoData.videoTitle,
          customContent: reviewContent.mainContent,
          affiliateLinks: affiliateLinks,
          status: status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể lưu review');
      }

      toast({
        title: 'Thành công!',
        description: 'Review đã được lưu thành công',
      });

      // Redirect to reviews list
      router.push('/dashboard/reviews');
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể lưu review',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Helper: Add Affiliate Link
  const handleAddAffiliateLink = () => {
    setAffiliateLinks([...affiliateLinks, { platform: '', price: '', url: '' }]);
  };

  // Helper: Remove Affiliate Link
  const handleRemoveAffiliateLink = (index: number) => {
    setAffiliateLinks(affiliateLinks.filter((_, i) => i !== index));
  };

  // Helper: Update Affiliate Link
  const handleUpdateAffiliateLink = (index: number, field: keyof typeof affiliateLinks[0], value: string) => {
    const updated = [...affiliateLinks];
    updated[index] = { ...updated[index], [field]: value };
    setAffiliateLinks(updated);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto p-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Tạo Review Từ Template</h1>
        <p className="text-gray-600 mt-1">
          Tạo review chuyên nghiệp từ video với template tối ưu cho Facebook
        </p>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center gap-2">
            {/* Step 1 */}
            <div className={`flex items-center gap-2 ${step === 'video-input' ? 'text-blue-600 font-bold' : 'text-green-600'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'video-input' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white'}`}>
                1
              </div>
              <span className="hidden sm:inline">Video</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300" />

            {/* Step 2 */}
            <div className={`flex items-center gap-2 ${step === 'config' ? 'text-blue-600 font-bold' : (step === 'edit' || step === 'preview') ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'config' ? 'bg-blue-600 text-white' : (step === 'edit' || step === 'preview') ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                2
              </div>
              <span className="hidden sm:inline">Cấu hình</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300" />

            {/* Step 3 */}
            <div className={`flex items-center gap-2 ${step === 'edit' ? 'text-blue-600 font-bold' : step === 'preview' ? 'text-green-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'edit' ? 'bg-blue-600 text-white' : step === 'preview' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="hidden sm:inline">Chỉnh sửa</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Video Input */}
      {step === 'video-input' && (
        <Card>
          <CardHeader>
            <CardTitle>Bước 1: Nhập Video URL</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="video-url">URL Video (YouTube hoặc TikTok)</Label>
              <Input
                id="video-url"
                type="url"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="mt-1"
              />
            </div>

            <Button onClick={handleAnalyzeVideo} disabled={isAnalyzing || !videoUrl.trim()} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang phân tích video...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Phân tích Video
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Config */}
      {step === 'config' && videoData && (
        <div className="space-y-6">
          {/* Auto-filled Video Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Thông tin Video (Tự động điền)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm text-gray-600">Tiêu đề</Label>
                <p className="font-medium">{videoData.videoTitle}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Kênh</Label>
                <p className="font-medium">{videoData.channelName}</p>
              </div>
              <div>
                <Label className="text-sm text-gray-600">Platform</Label>
                <p className="font-medium capitalize">{videoData.platform}</p>
              </div>
              {videoData.videoDescription && (
                <div>
                  <Label className="text-sm text-gray-600">Mô tả</Label>
                  <p className="text-sm line-clamp-3">{videoData.videoDescription}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Config */}
          <Card>
            <CardHeader>
              <CardTitle>Bước 2: Cấu hình Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Tone */}
              <div>
                <Label htmlFor="tone">Tone *</Label>
                <select
                  id="tone"
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Chọn tone --</option>
                  {toneOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Language */}
              <div>
                <Label htmlFor="language">Ngôn ngữ *</Label>
                <select
                  id="language"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Chọn ngôn ngữ --</option>
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Length */}
              <div>
                <Label htmlFor="length">Độ dài *</Label>
                <select
                  id="length"
                  value={length}
                  onChange={(e) => setLength(e.target.value)}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="">-- Chọn độ dài --</option>
                  {lengthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('video-input')}>
              Quay lại
            </Button>
            <Button
              onClick={handleGenerateContent}
              disabled={isGenerating || !tone || !language || !length}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang tạo nội dung...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Tạo Nội Dung Review
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Edit Content */}
      {step === 'edit' && (
        <div className="space-y-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Nội dung đã được AI tạo tự động. Bạn có thể chỉnh sửa trước khi lưu.
            </AlertDescription>
          </Alert>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={reviewContent.summary}
                onChange={(e) => setReviewContent({ ...reviewContent, summary: e.target.value })}
                rows={4}
                placeholder="Tóm tắt ngắn gọn về sản phẩm"
              />
            </CardContent>
          </Card>

          {/* Pros */}
          <Card>
            <CardHeader>
              <CardTitle>Ưu điểm (Tối thiểu 3)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reviewContent.pros.map((pro, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={pro}
                    onChange={(e) => {
                      const updated = [...reviewContent.pros];
                      updated[index] = e.target.value;
                      setReviewContent({ ...reviewContent, pros: updated });
                    }}
                    placeholder={`Ưu điểm ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updated = reviewContent.pros.filter((_, i) => i !== index);
                      setReviewContent({ ...reviewContent, pros: updated });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setReviewContent({ ...reviewContent, pros: [...reviewContent.pros, ''] })}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm ưu điểm
              </Button>
            </CardContent>
          </Card>

          {/* Cons */}
          <Card>
            <CardHeader>
              <CardTitle>Nhược điểm (Tối thiểu 2)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {reviewContent.cons.map((con, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={con}
                    onChange={(e) => {
                      const updated = [...reviewContent.cons];
                      updated[index] = e.target.value;
                      setReviewContent({ ...reviewContent, cons: updated });
                    }}
                    placeholder={`Nhược điểm ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const updated = reviewContent.cons.filter((_, i) => i !== index);
                      setReviewContent({ ...reviewContent, cons: updated });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                onClick={() => setReviewContent({ ...reviewContent, cons: [...reviewContent.cons, ''] })}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Thêm nhược điểm
              </Button>
            </CardContent>
          </Card>

          {/* Main Content */}
          <Card>
            <CardHeader>
              <CardTitle>Nội dung chính</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={reviewContent.mainContent}
                onChange={(e) => setReviewContent({ ...reviewContent, mainContent: e.target.value })}
                rows={10}
                placeholder="Nội dung chi tiết review..."
              />
            </CardContent>
          </Card>

          {/* CTA */}
          <Card>
            <CardHeader>
              <CardTitle>Call to Action</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={reviewContent.cta}
                onChange={(e) => setReviewContent({ ...reviewContent, cta: e.target.value })}
                rows={2}
                placeholder="Lời kêu gọi hành động"
              />
            </CardContent>
          </Card>

          {/* Affiliate Links */}
          <Card>
            <CardHeader>
              <CardTitle>Link Affiliate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {affiliateLinks.map((link, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <Label>Link {index + 1}</Label>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveAffiliateLink(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    value={link.platform}
                    onChange={(e) => handleUpdateAffiliateLink(index, 'platform', e.target.value)}
                    placeholder="Tên nền tảng (VD: Shopee, Lazada, Tiki)"
                  />
                  <Input
                    value={link.price}
                    onChange={(e) => handleUpdateAffiliateLink(index, 'price', e.target.value)}
                    placeholder="Giá (VD: 299.000đ)"
                  />
                  <Input
                    value={link.url}
                    onChange={(e) => handleUpdateAffiliateLink(index, 'url', e.target.value)}
                    placeholder="URL affiliate"
                    type="url"
                  />
                </div>
              ))}
              <Button variant="outline" onClick={handleAddAffiliateLink} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Thêm link affiliate
              </Button>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Trạng thái xuất bản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={status === 'draft' ? 'default' : 'outline'}
                  onClick={() => setStatus('draft')}
                  className="flex-1"
                >
                  📝 Nháp
                </Button>
                <Button
                  type="button"
                  variant={status === 'published' ? 'default' : 'outline'}
                  onClick={() => setStatus('published')}
                  className="flex-1"
                >
                  ✅ Xuất bản
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button variant="outline" onClick={() => setStep('config')}>
              Quay lại
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
                  Lưu Review
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default withUserRoute(CreateFromTemplatePage);
