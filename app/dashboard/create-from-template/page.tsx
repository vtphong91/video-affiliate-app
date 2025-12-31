'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Sparkles, Save, Plus, X, AlertCircle, CheckCircle, CheckCircle2 } from 'lucide-react';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RichTextEditor } from '@/components/editors/RichTextEditor';
import { cleanReviewContent } from '@/lib/utils/clean-ai-content';
import { AffiliateLinkManager } from '@/components/AffiliateLinkManager';
import type { AffiliateLink } from '@/types';

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
  videoThumbnail: string;
  channelUrl?: string;
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
  const [availableTemplates, setAvailableTemplates] = useState<any[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
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
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);

  // Step 5: Status
  const [status, setStatus] = useState<'draft' | 'published'>('draft');

  // Auto-saved draft tracking
  const [savedDraftId, setSavedDraftId] = useState<string | null>(null);
  const [autoSaving, setAutoSaving] = useState(false);

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

  // Load templates when reaching config step
  useEffect(() => {
    if (step === 'config' && videoData && availableTemplates.length === 0) {
      fetchTemplates();
    }
  }, [step, videoData]);

  const fetchTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await fetch('/api/templates-simple');
      const data = await response.json();

      if (data.success && data.data) {
        setAvailableTemplates(data.data);
        // Set first template as default if none selected
        if (data.data.length > 0 && !selectedTemplateId) {
          setSelectedTemplateId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách template',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingTemplates(false);
    }
  };

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
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      console.log('📹 API Response:', { ok: response.ok, status: response.status, data });

      if (!response.ok || !data.success) {
        console.error('❌ API Error:', data);
        throw new Error(data.error || 'Không thể phân tích video');
      }

      // Map API response to VideoData
      const videoInfo = data.data.videoInfo;
      setVideoData({
        videoTitle: videoInfo.title || '',
        videoDescription: videoInfo.description || '',
        channelName: videoInfo.channelName || '',
        channelUrl: videoInfo.channelUrl || '',
        platform: videoInfo.platform || 'youtube',
        transcript: videoInfo.transcript || '',
        videoUrl: videoUrl,
        videoId: videoInfo.videoId || '',
        videoThumbnail: videoInfo.thumbnail || '',
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
    if (!videoData || !selectedTemplateId || !tone || !language || !length) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn đầy đủ template, tone, ngôn ngữ và độ dài',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Find selected template
      const template = availableTemplates.find(t => t.id === selectedTemplateId);

      if (!template) {
        throw new Error('Không tìm thấy template đã chọn');
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

      // Set generated content with proper array handling
      const responseData = data.data;
      console.log('🔍 API Response Data:', {
        keys: Object.keys(responseData),
        pros: responseData.pros,
        cons: responseData.cons,
        prosType: Array.isArray(responseData.pros),
        consType: Array.isArray(responseData.cons),
      });

      // Clean AI content to remove emojis and *** markers
      const cleanedStringContent = cleanReviewContent({
        summary: responseData.summary || '',
        pros: Array.isArray(responseData.pros) ? responseData.pros : [],
        cons: Array.isArray(responseData.cons) ? responseData.cons : [],
        keyPoints: Array.isArray(responseData.keyPoints) ? responseData.keyPoints : [],
        mainContent: responseData.mainContent || '',
        cta: responseData.cta || '',
        targetAudience: Array.isArray(responseData.targetAudience) ? responseData.targetAudience : [],
        seoKeywords: Array.isArray(responseData.seoKeywords) ? responseData.seoKeywords : [],
      });

      // Convert keyPoints strings to objects (template flow uses simple strings, page expects objects)
      const cleanedContent: ReviewContent = {
        ...cleanedStringContent,
        keyPoints: cleanedStringContent.keyPoints.map((point, index) => ({
          time: `00:${String(index * 30).padStart(2, '0')}`, // Generate dummy timestamps
          content: point,
        })),
      };

      console.log('✨ Content cleaned (emojis and *** removed)');
      setReviewContent(cleanedContent);

      toast({
        title: 'Thành công!',
        description: 'Đã tạo nội dung review từ template',
      });

      setStep('edit');

      // Auto-save draft to preserve AI-generated content
      await autoSaveDraft(cleanedContent);
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

  // Auto-save draft after generation to preserve AI content
  const autoSaveDraft = async (content: ReviewContent) => {
    if (!videoData) return;

    setAutoSaving(true);

    try {
      console.log('💾 Auto-saving draft...');

      const response = await fetch('/api/create-review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoData.videoUrl,
          videoInfo: {
            videoId: videoData.videoId,
            title: videoData.videoTitle,
            description: videoData.videoDescription,
            thumbnail: videoData.videoThumbnail,
            channelName: videoData.channelName,
            channelUrl: videoData.channelUrl,
            platform: videoData.platform,
            transcript: videoData.transcript,
          },
          analysis: {
            summary: content.summary,
            pros: content.pros,
            cons: content.cons,
            keyPoints: content.keyPoints,
            comparisonTable: null,
            targetAudience: content.targetAudience,
            seoKeywords: content.seoKeywords,
            cta: content.cta,
          },
          customTitle: videoData.videoTitle,
          customContent: content.mainContent,
          affiliateLinks: affiliateLinks,
          status: 'draft', // Always save as draft
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể lưu draft');
      }

      setSavedDraftId(data.review.id);

      toast({
        title: '✅ Đã lưu nháp tự động',
        description: 'Nội dung đã được lưu an toàn. Bạn có thể tiếp tục chỉnh sửa.',
      });

      console.log('✅ Draft auto-saved with ID:', data.review.id);
    } catch (error) {
      console.error('Auto-save error:', error);
      // Don't show error toast for auto-save - it's background operation
      console.warn('⚠️ Auto-save failed, but user can still save manually');
    } finally {
      setAutoSaving(false);
    }
  };

  // Step 3: Save/Update Review
  const handleSaveReview = async () => {
    if (!videoData) return;

    setIsSaving(true);

    try {
      // If already auto-saved, UPDATE instead of CREATE
      const endpoint = savedDraftId ? `/api/reviews/${savedDraftId}` : '/api/create-review';
      const method = savedDraftId ? 'PATCH' : 'POST';

      console.log(savedDraftId ? `📝 Updating draft ${savedDraftId}` : '💾 Creating new review');

      // Prepare payload based on method
      const payload = savedDraftId
        ? {
            // PATCH: Direct field updates for existing review
            summary: reviewContent.summary,
            pros: reviewContent.pros,
            cons: reviewContent.cons,
            key_points: reviewContent.keyPoints,
            comparison_table: null,
            target_audience: reviewContent.targetAudience,
            seo_keywords: reviewContent.seoKeywords,
            cta: reviewContent.cta,
            custom_title: videoData.videoTitle,
            custom_content: reviewContent.mainContent,
            affiliate_links: affiliateLinks,
            status: status,
          }
        : {
            // POST: Full review creation with nested structure
            videoUrl: videoData.videoUrl,
            videoInfo: {
              videoId: videoData.videoId,
              title: videoData.videoTitle,
              description: videoData.videoDescription,
              thumbnail: videoData.videoThumbnail,
              channelName: videoData.channelName,
              channelUrl: videoData.channelUrl,
              platform: videoData.platform,
              transcript: videoData.transcript,
            },
            analysis: {
              summary: reviewContent.summary,
              pros: reviewContent.pros,
              cons: reviewContent.cons,
              keyPoints: reviewContent.keyPoints,
              comparisonTable: null,
              targetAudience: reviewContent.targetAudience,
              seoKeywords: reviewContent.seoKeywords,
              cta: reviewContent.cta,
            },
            customTitle: videoData.videoTitle,
            customContent: reviewContent.mainContent,
            affiliateLinks: affiliateLinks,
            status: status,
          };

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể lưu review');
      }

      toast({
        title: 'Thành công!',
        description: savedDraftId ? 'Review đã được cập nhật' : 'Review đã được lưu thành công',
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

  // Affiliate link management now handled by AffiliateLinkGenerator component

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
              {/* Template Selector */}
              <div>
                <Label htmlFor="template">Template *</Label>
                {isLoadingTemplates ? (
                  <div className="flex items-center gap-2 mt-1 px-3 py-2 border border-gray-300 rounded-md">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-gray-500">Đang tải templates...</span>
                  </div>
                ) : (
                  <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Chọn template" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{template.name}</span>
                            <span className="text-xs text-gray-500">{template.category}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
                {selectedTemplateId && availableTemplates.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {availableTemplates.find(t => t.id === selectedTemplateId)?.name || ''}
                  </p>
                )}
              </div>

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
              disabled={isGenerating || !selectedTemplateId || !tone || !language || !length}
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

          {/* Auto-save Status Indicator */}
          {autoSaving && (
            <Alert className="bg-blue-50 border-blue-200">
              <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
              <AlertDescription className="text-blue-700">
                Đang lưu nháp tự động...
              </AlertDescription>
            </Alert>
          )}

          {savedDraftId && !autoSaving && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                ✅ Đã lưu nháp tự động. Nội dung của bạn đã được bảo toàn an toàn.
              </AlertDescription>
            </Alert>
          )}

          {/* Status - Moved to top for better UX */}
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
              <RichTextEditor
                content={reviewContent.mainContent}
                onChange={(content) => setReviewContent({ ...reviewContent, mainContent: content })}
                placeholder="Nội dung chi tiết review với định dạng rich text..."
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

          {/* Affiliate Links - Using traditional component with Dialog + API */}
          <AffiliateLinkManager
            affiliateLinks={affiliateLinks}
            onAffiliateLinksChange={setAffiliateLinks}
          />

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
