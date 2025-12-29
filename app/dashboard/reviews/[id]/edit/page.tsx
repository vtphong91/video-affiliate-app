'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, ArrowLeft, Plus, X, ExternalLink, Wand2, Copy, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { RichTextEditor } from '@/components/editors/RichTextEditor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import type { Review, KeyPoint, AffiliateLink, AIAnalysis, Category } from '@/types';

// Merchant type (from affiliate module)
interface Merchant {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  platform: string;
  campaign_id: string;
  is_active: boolean;
}

export default function EditReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string;
  const { toast } = useToast();

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false); // ✅ Track status update
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Basic fields
  const [customTitle, setCustomTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [customContent, setCustomContent] = useState(''); // ✅ NEW: Custom content with rich text
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // AI Content fields
  const [pros, setPros] = useState<string[]>([]);
  const [cons, setCons] = useState<string[]>([]);
  const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
  const [targetAudience, setTargetAudience] = useState<string[]>([]);
  const [cta, setCta] = useState('');

  // Affiliate links
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [selectedMerchant, setSelectedMerchant] = useState<string>('');
  const [generatingLink, setGeneratingLink] = useState<number | null>(null);
  const [bulkGenerating, setBulkGenerating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<string>('');

  useEffect(() => {
    fetchReview();
    fetchCategories();
    fetchMerchants();
  }, [reviewId]);

  const fetchMerchants = async () => {
    try {
      const response = await fetch('/api/merchants?active_only=true');
      const data = await response.json();

      if (data.success) {
        setMerchants(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching merchants:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      console.log('🔍 Fetching categories for edit review...');
      const response = await fetch('/api/categories');
      const data = await response.json();
      console.log('📊 Categories API response:', data);
      
      if (data.success) {
        // API trả về 'topics' trong 'data.data.topics'
        const categoriesData = (data.data?.topics || data.topics || data.categories || []).map((topic: any) => ({
          ...topic,
          icon: topic.icon || '📁' // Thêm icon mặc định nếu không có
        }));
        console.log('✅ Categories loaded for edit:', categoriesData);
        setCategories(categoriesData);
      } else {
        console.error('❌ Categories API failed:', data);
        setCategories([]);
      }
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      setCategories([]);
    }
  };

  const fetchReview = async () => {
    try {
      setLoading(true);
      // ✅ Add timestamp to prevent caching
      const timestamp = Date.now();
      const response = await fetch(`/api/reviews/${reviewId}?_t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });
      const data = await response.json();

      console.log('🔄 [FETCH REVIEW] Status from database:', data.review?.status);

      if (data.success) {
        const rev = data.review;
        setReview(rev);
        setCustomTitle(rev.custom_title || rev.video_title);
        setSummary(rev.summary);
        setCustomContent(rev.custom_content || ''); // ✅ NEW: Load custom content
        setStatus(rev.status);
        setSelectedCategoryId(rev.category_id || '');
        setPros(rev.pros || []);
        setCons(rev.cons || []);
        setKeyPoints(rev.key_points || []);
        setTargetAudience(rev.target_audience || []);
        setCta(rev.cta || '');
        setAffiliateLinks(rev.affiliate_links || []);
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Hàm riêng để update CHỈ status - chuẩn nhất!
  const updateStatus = async (newStatus: 'draft' | 'published') => {
    console.log('🟢 [UPDATE STATUS] Called with:', newStatus);
    try {
      setUpdatingStatus(true);

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      console.log('🟢 [UPDATE STATUS] Response status:', response.status);
      const data = await response.json();
      console.log('🟢 [UPDATE STATUS] Response data:', data);

      if (data.success) {
        toast({
          title: '✅ Cập nhật thành công!',
          description: `Trạng thái đã được chuyển sang ${newStatus === 'published' ? 'Xuất bản' : 'Nháp'}. Đang chuyển về trang danh sách...`,
        });

        // ✅ Force full page reload to clear ALL caches
        setTimeout(() => {
          window.location.href = '/dashboard/reviews';
        }, 1000);
      } else {
        throw new Error(data.error || 'Không thể cập nhật status');
      }
    } catch (error) {
      console.error('❌ [UPDATE STATUS] Error:', error);
      toast({
        title: '❌ Cập nhật thất bại!',
        description: error instanceof Error ? error.message : 'Không thể cập nhật status',
        variant: 'destructive',
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSave = async () => {
    console.log('🔵 handleSave called!');
    try {
      setSaving(true);
      setSaveStatus({ type: null, message: '' });
      console.log('🔵 Sending PATCH request...', { reviewId, status });

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          custom_title: customTitle,
          summary,
          custom_content: customContent,
          status,
          ...(selectedCategoryId && { category_id: selectedCategoryId }),
          pros,
          cons,
          key_points: keyPoints,
          target_audience: targetAudience,
          cta,
          affiliate_links: affiliateLinks,
        }),
      });

      console.log('🔵 Response status:', response.status);
      const data = await response.json();
      console.log('🔵 Response data:', data);

      if (data.success) {
        // Set success status message
        setSaveStatus({
          type: 'success',
          message: '✅ Lưu thành công! Review đã được cập nhật.'
        });

        // Also show toast for consistency
        toast({
          title: '✅ Lưu thành công!',
          description: 'Review đã được cập nhật thành công.',
        });

        // Reload review data to show updated information
        await fetchReview();

        // Force router refresh to clear any Next.js cache
        router.refresh();

        // Clear status message after 3 seconds
        setTimeout(() => {
          setSaveStatus({ type: null, message: '' });
        }, 3000);
      } else {
        throw new Error(data.error || 'Có lỗi xảy ra khi lưu review');
      }
    } catch (error) {
      console.error('Error saving review:', error);
      
      // Set error status message
      setSaveStatus({
        type: 'error',
        message: '❌ Lưu thất bại! ' + (error instanceof Error ? error.message : 'Không thể lưu review. Vui lòng thử lại.')
      });
      
      // Also show toast for consistency
      toast({
        title: '❌ Lưu thất bại!',
        description: error instanceof Error ? error.message : 'Không thể lưu review. Vui lòng thử lại.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Pros handlers
  const addPro = () => setPros([...pros, '']);
  const updatePro = (index: number, value: string) => {
    const updated = [...pros];
    updated[index] = value;
    setPros(updated);
  };
  const removePro = (index: number) => setPros(pros.filter((_, i) => i !== index));

  // Cons handlers
  const addCon = () => setCons([...cons, '']);
  const updateCon = (index: number, value: string) => {
    const updated = [...cons];
    updated[index] = value;
    setCons(updated);
  };
  const removeCon = (index: number) => setCons(cons.filter((_, i) => i !== index));

  // Key Points handlers
  const addKeyPoint = () => setKeyPoints([...keyPoints, { time: '', content: '' }]);
  const updateKeyPoint = (index: number, field: 'time' | 'content', value: string) => {
    const updated = [...keyPoints];
    updated[index][field] = value;
    setKeyPoints(updated);
  };
  const removeKeyPoint = (index: number) => setKeyPoints(keyPoints.filter((_, i) => i !== index));

  // Target Audience handlers
  const addTargetAudience = () => setTargetAudience([...targetAudience, '']);
  const updateTargetAudience = (index: number, value: string) => {
    const updated = [...targetAudience];
    updated[index] = value;
    setTargetAudience(updated);
  };
  const removeTargetAudience = (index: number) => setTargetAudience(targetAudience.filter((_, i) => i !== index));

  // Affiliate Links handlers
  const addAffiliateLink = () => setAffiliateLinks([...affiliateLinks, { platform: '', url: '', price: '', discount: '' }]);
  const updateAffiliateLink = (index: number, field: keyof AffiliateLink, value: string | undefined) => {
    const updated = [...affiliateLinks];
    (updated[index] as any)[field] = value;
    setAffiliateLinks(updated);
  };
  const removeAffiliateLink = (index: number) => setAffiliateLinks(affiliateLinks.filter((_, i) => i !== index));

  const handleGenerateLink = async (index: number) => {
    if (!selectedMerchant) {
      toast({
        title: 'Vui lòng chọn merchant',
        description: 'Chọn merchant từ dropdown trước khi generate link',
        variant: 'destructive'
      });
      return;
    }

    const productUrl = affiliateLinks[index].url;
    if (!productUrl || !productUrl.startsWith('http')) {
      toast({
        title: 'URL không hợp lệ',
        description: 'Vui lòng nhập URL sản phẩm hợp lệ (bắt đầu với http)',
        variant: 'destructive'
      });
      return;
    }

    setGeneratingLink(index);

    try {
      const res = await fetch('/api/affiliate-links/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: selectedMerchant,
          originalUrl: productUrl,
          linkType: 'product'
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate link');
      }

      // Update affiliate link with generated tracking URL
      const merchant = merchants.find(m => m.id === selectedMerchant);
      const updated = [...affiliateLinks];
      updated[index] = {
        ...updated[index],
        trackingUrl: data.data.shortUrl || data.data.affiliateUrl,
        platform: merchant?.name || updated[index].platform,
        affSid: data.data.affSid,
        generationMethod: data.data.generationMethod,
        merchantId: merchant?.id,
        merchantName: merchant?.name
      };
      setAffiliateLinks(updated);

      toast({
        title: 'Thành công!',
        description: data.message || 'Link tracking đã được tạo'
      });

    } catch (error) {
      console.error('Generate link error:', error);
      toast({
        title: 'Lỗi tạo link',
        description: error instanceof Error ? error.message : 'Không thể tạo tracking link',
        variant: 'destructive'
      });
    } finally {
      setGeneratingLink(null);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Đã copy!',
      description: 'Link đã được copy vào clipboard'
    });
  };

  const handleBulkGenerate = async () => {
    if (!selectedMerchant) {
      toast({
        title: 'Vui lòng chọn merchant',
        description: 'Chọn merchant từ dropdown trước khi bulk generate',
        variant: 'destructive'
      });
      return;
    }

    // Get links that have URL but no tracking URL yet
    const linksToGenerate = affiliateLinks
      .map((link, index) => ({ link, index }))
      .filter(({ link }) => link.url && link.url.startsWith('http') && !link.trackingUrl);

    if (linksToGenerate.length === 0) {
      toast({
        title: 'Không có link nào cần generate',
        description: 'Tất cả links đã có tracking URL hoặc chưa nhập URL',
        variant: 'destructive'
      });
      return;
    }

    setBulkGenerating(true);
    setBulkProgress(`Đang tạo 0/${linksToGenerate.length} links...`);

    try {
      const res = await fetch('/api/affiliate-links/bulk-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          merchantId: selectedMerchant,
          links: linksToGenerate.map(({ link }) => ({
            originalUrl: link.url,
            linkType: 'product'
          }))
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to bulk generate');
      }

      // Update affiliate links with generated tracking URLs
      const merchant = merchants.find(m => m.id === selectedMerchant);
      const updated = [...affiliateLinks];

      linksToGenerate.forEach(({ index }, resultIndex) => {
        const result = data.data.results[resultIndex];

        if (result.success) {
          updated[index] = {
            ...updated[index],
            trackingUrl: result.shortUrl || result.affiliateUrl,
            affSid: result.affSid,
            generationMethod: result.generationMethod,
            merchantId: merchant?.id,
            merchantName: merchant?.name,
            platform: merchant?.name || updated[index].platform
          };
        }
      });

      setAffiliateLinks(updated);

      const successCount = data.data.generated;
      const failedCount = data.data.failed;

      toast({
        title: 'Hoàn thành!',
        description: failedCount === 0
          ? `Đã tạo ${successCount} tracking links`
          : `Tạo ${successCount} links thành công, ${failedCount} links thất bại`
      });

    } catch (error) {
      console.error('Bulk generate error:', error);
      toast({
        title: 'Lỗi bulk generate',
        description: error instanceof Error ? error.message : 'Không thể tạo links',
        variant: 'destructive'
      });
    } finally {
      setBulkGenerating(false);
      setBulkProgress('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!review) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl font-semibold mb-2">Review không tồn tại</h3>
        <Link href="/dashboard/reviews">
          <Button>Quay lại</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/reviews">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Quay lại
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Chỉnh sửa Review</h1>
            <p className="text-gray-600 mt-1">
              Cập nhật nội dung và trạng thái review
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu thay đổi
              </>
            )}
          </Button>
          
          {/* Status Message */}
          {saveStatus.type && (
            <div className={`text-sm px-3 py-2 rounded-md ${
              saveStatus.type === 'success' 
                ? 'bg-green-100 text-green-700 border border-green-200' 
                : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
              {saveStatus.message}
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tiêu đề tùy chỉnh
                </label>
                <Input
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  placeholder="Nhập tiêu đề..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Danh mục *
                </label>
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
                <p className="text-xs text-gray-500 mt-1">
                  Chọn danh mục phù hợp cho review này
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Trạng thái
                </label>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant={status === 'draft' ? 'default' : 'outline'}
                    onClick={() => updateStatus('draft')}
                    className="flex-1"
                    disabled={updatingStatus}
                  >
                    {updatingStatus && status !== 'draft' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      '📝 Nháp (Draft)'
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant={status === 'published' ? 'default' : 'outline'}
                    onClick={() => updateStatus('published')}
                    className="flex-1"
                    disabled={updatingStatus}
                  >
                    {updatingStatus && status !== 'published' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      '✅ Xuất bản (Published)'
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {status === 'published'
                    ? 'Review sẽ hiển thị trên trang chủ công khai'
                    : 'Review chỉ hiển thị trong dashboard'}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">
                  Tóm tắt
                </label>
                <Textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  rows={6}
                  placeholder="Nhập tóm tắt..."
                />
              </div>
            </CardContent>
          </Card>

          {/* AI Content Tabs */}
          <Tabs defaultValue="custom-content">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="custom-content">Nội dung</TabsTrigger>
              <TabsTrigger value="pros-cons">Ưu/Nhược</TabsTrigger>
              <TabsTrigger value="keypoints">Điểm Nổi Bật</TabsTrigger>
              <TabsTrigger value="audience">Đối Tượng</TabsTrigger>
              <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
              <TabsTrigger value="facebook">Facebook</TabsTrigger>
            </TabsList>

            {/* Custom Content Tab - ✅ NEW */}
            <TabsContent value="custom-content">
              <Card>
                <CardHeader>
                  <CardTitle>📝 Nội dung tùy chỉnh</CardTitle>
                  <p className="text-sm text-gray-500">
                    Chỉnh sửa nội dung review đầy đủ với trình soạn thảo rich text.
                    Nội dung này sẽ hiển thị trên trang review công khai.
                  </p>
                </CardHeader>
                <CardContent>
                  <RichTextEditor
                    content={customContent}
                    onChange={setCustomContent}
                    placeholder="Nhập nội dung review đầy đủ tại đây..."
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    💡 Mẹo: Sử dụng các công cụ định dạng phía trên để tạo nội dung hấp dẫn với heading, list, link, hình ảnh, v.v.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pros & Cons */}
            <TabsContent value="pros-cons" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>✅ Ưu điểm</CardTitle>
                    <Button size="sm" onClick={addPro}>
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pros.map((pro, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={pro}
                        onChange={(e) => updatePro(index, e.target.value)}
                        placeholder="Nhập ưu điểm..."
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removePro(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>❌ Nhược điểm</CardTitle>
                    <Button size="sm" onClick={addCon}>
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cons.map((con, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={con}
                        onChange={(e) => updateCon(index, e.target.value)}
                        placeholder="Nhập nhược điểm..."
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeCon(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Key Points */}
            <TabsContent value="keypoints">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>🎯 Điểm nổi bật</CardTitle>
                    <Button size="sm" onClick={addKeyPoint}>
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {keyPoints.map((point, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={point.time}
                        onChange={(e) => updateKeyPoint(index, 'time', e.target.value)}
                        placeholder="Thời gian (vd: 5:30)"
                        className="w-32"
                      />
                      <Input
                        value={point.content}
                        onChange={(e) => updateKeyPoint(index, 'content', e.target.value)}
                        placeholder="Nội dung điểm nổi bật..."
                        className="flex-1"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeKeyPoint(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Target Audience & CTA */}
            <TabsContent value="audience" className="space-y-4">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>👥 Đối tượng phù hợp</CardTitle>
                    <Button size="sm" onClick={addTargetAudience}>
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {targetAudience.map((audience, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={audience}
                        onChange={(e) => updateTargetAudience(index, e.target.value)}
                        placeholder="Nhập đối tượng..."
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTargetAudience(index)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📢 Call to Action</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={cta}
                    onChange={(e) => setCta(e.target.value)}
                    rows={4}
                    placeholder="Nhập lời kêu gọi hành động..."
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Affiliate Links */}
            <TabsContent value="affiliate">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>🔗 Affiliate Links</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleBulkGenerate}
                        disabled={bulkGenerating || !selectedMerchant || affiliateLinks.filter(l => l.url && !l.trackingUrl).length === 0}
                      >
                        {bulkGenerating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            {bulkProgress || 'Đang tạo...'}
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-1" />
                            Bulk Generate ({affiliateLinks.filter(l => l.url && !l.trackingUrl).length})
                          </>
                        )}
                      </Button>
                      <Button size="sm" onClick={addAffiliateLink}>
                        <Plus className="w-4 h-4 mr-1" />
                        Thêm Link
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Merchant Selector */}
                  {merchants.length > 0 && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label className="text-sm font-medium mb-2 block">
                        🎯 Chọn Merchant để tạo link tracking tự động
                      </Label>
                      <Select value={selectedMerchant} onValueChange={setSelectedMerchant}>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn merchant (Shopee, Lazada, Tiki...)" />
                        </SelectTrigger>
                        <SelectContent>
                          {merchants.map(m => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.logo_url && (
                                <img src={m.logo_url} alt={m.name} className="inline-block w-4 h-4 mr-2" />
                              )}
                              {m.name} ({m.domain})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600 mt-2">
                        Sau khi chọn merchant, nhập URL sản phẩm và click nút Generate để tạo tracking link
                      </p>
                    </div>
                  )}

                  {/* Affiliate Links */}
                  {affiliateLinks.map((link, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Link #{index + 1}</span>
                          {link.generationMethod && (
                            <Badge variant="outline" className="text-xs">
                              {link.generationMethod === 'api' ? '⚡ API' : '🔗 Deeplink'}
                            </Badge>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAffiliateLink(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">Nền tảng</Label>
                          <Input
                            value={link.platform}
                            onChange={(e) => updateAffiliateLink(index, 'platform', e.target.value)}
                            placeholder="Shopee, Lazada..."
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Giá</Label>
                          <Input
                            value={link.price || ''}
                            onChange={(e) => updateAffiliateLink(index, 'price', e.target.value)}
                            placeholder="299.000đ"
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600">URL Sản Phẩm Gốc</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={link.url}
                            onChange={(e) => updateAffiliateLink(index, 'url', e.target.value)}
                            placeholder="https://shopee.vn/product/..."
                          />
                          <Button
                            type="button"
                            onClick={() => handleGenerateLink(index)}
                            disabled={generatingLink === index || !selectedMerchant}
                            size="sm"
                            className="whitespace-nowrap"
                          >
                            {generatingLink === index ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Wand2 className="h-4 w-4" />
                            )}
                            <span className="ml-1">Generate</span>
                          </Button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Nhập URL gốc, click Generate để tạo tracking link
                        </p>
                      </div>

                      {/* Show generated tracking URL */}
                      {link.trackingUrl && link.trackingUrl !== link.url && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs font-medium text-green-700 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Tracking Link đã tạo
                            </Label>
                            {link.affSid && (
                              <span className="text-xs text-gray-500">
                                ID: {link.affSid.slice(0, 12)}...
                              </span>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Input
                              value={link.trackingUrl}
                              readOnly
                              className="bg-white text-xs"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => handleCopyLink(link.trackingUrl!)}
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-xs text-gray-600">Giảm giá (tùy chọn)</Label>
                        <Input
                          value={link.discount || ''}
                          onChange={(e) => updateAffiliateLink(index, 'discount', e.target.value)}
                          placeholder="-20%"
                          className="mt-1"
                        />
                      </div>

                      {link.url && (
                        <a
                          href={link.trackingUrl || link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Preview link
                        </a>
                      )}
                    </div>
                  ))}

                  {affiliateLinks.length === 0 && (
                    <p className="text-center text-gray-500 py-8">
                      Chưa có affiliate link nào. Click "Thêm Link" để thêm.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Facebook Poster */}
            <TabsContent value="facebook">
              <div className="p-8 text-center text-gray-500">
                <p>Facebook Poster component đã được tạm thời vô hiệu hóa để fix lỗi deploy.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Video gốc</CardTitle>
            </CardHeader>
            <CardContent>
              <img
                src={review.video_thumbnail}
                alt={review.video_title}
                className="w-full rounded mb-3"
              />
              <h4 className="font-medium mb-2 text-sm">{review.video_title}</h4>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <Badge variant="secondary">{review.video_platform}</Badge>
                <span>•</span>
                <span>{review.views} views</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Video gốc không thể thay đổi
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Lượt xem:</span>
                <span className="font-semibold">{review.views}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Clicks:</span>
                <span className="font-semibold">{review.clicks}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Conversions:</span>
                <span className="font-semibold">{review.conversions}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/review/${review.slug}`} target="_blank">
                <Button variant="outline" className="w-full">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Xem trang public
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
