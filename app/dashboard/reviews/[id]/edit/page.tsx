'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Save, ArrowLeft, Plus, X, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { FacebookPoster } from '@/components/FacebookPoster';
import { useToast } from '@/components/ui/use-toast';
import type { Review, KeyPoint, AffiliateLink, AIAnalysis, Category } from '@/types';

export default function EditReviewPage() {
  const router = useRouter();
  const params = useParams();
  const reviewId = params.id as string;
  const { toast } = useToast();

  const [review, setReview] = useState<Review | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

  // Basic fields
  const [customTitle, setCustomTitle] = useState('');
  const [summary, setSummary] = useState('');
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

  useEffect(() => {
    fetchReview();
    fetchCategories();
  }, [reviewId]);

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
      const response = await fetch(`/api/reviews/${reviewId}`);
      const data = await response.json();

      if (data.success) {
        const rev = data.review;
        setReview(rev);
        setCustomTitle(rev.custom_title || rev.video_title);
        setSummary(rev.summary);
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

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus({ type: null, message: '' }); // Clear previous status

      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_title: customTitle,
          summary,
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

      const data = await response.json();

      if (response.ok) {
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
  const updateAffiliateLink = (index: number, field: keyof AffiliateLink, value: string) => {
    const updated = [...affiliateLinks];
    updated[index][field] = value;
    setAffiliateLinks(updated);
  };
  const removeAffiliateLink = (index: number) => setAffiliateLinks(affiliateLinks.filter((_, i) => i !== index));

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
                    onClick={() => setStatus('draft')}
                    className="flex-1"
                  >
                    📝 Nháp (Draft)
                  </Button>
                  <Button
                    type="button"
                    variant={status === 'published' ? 'default' : 'outline'}
                    onClick={() => setStatus('published')}
                    className="flex-1"
                  >
                    ✅ Xuất bản (Published)
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
          <Tabs defaultValue="pros-cons">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="pros-cons">Ưu/Nhược</TabsTrigger>
              <TabsTrigger value="keypoints">Điểm Nổi Bật</TabsTrigger>
              <TabsTrigger value="audience">Đối Tượng</TabsTrigger>
              <TabsTrigger value="affiliate">Affiliate</TabsTrigger>
              <TabsTrigger value="facebook">Facebook</TabsTrigger>
            </TabsList>

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
                    <Button size="sm" onClick={addAffiliateLink}>
                      <Plus className="w-4 h-4 mr-1" />
                      Thêm Link
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {affiliateLinks.map((link, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Link #{index + 1}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeAffiliateLink(index)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={link.platform}
                          onChange={(e) => updateAffiliateLink(index, 'platform', e.target.value)}
                          placeholder="Nền tảng (vd: Shopee)"
                        />
                        <Input
                          value={link.price || ''}
                          onChange={(e) => updateAffiliateLink(index, 'price', e.target.value)}
                          placeholder="Giá (vd: 299.000đ)"
                        />
                      </div>
                      <Input
                        value={link.url}
                        onChange={(e) => updateAffiliateLink(index, 'url', e.target.value)}
                        placeholder="URL affiliate link"
                      />
                      <Input
                        value={link.discount || ''}
                        onChange={(e) => updateAffiliateLink(index, 'discount', e.target.value)}
                        placeholder="Giảm giá (vd: -20%)"
                      />
                      {link.url && (
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Xem link
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
              {review && (
                <FacebookPoster
                  reviewId={review.id}
                  slug={review.slug}
                  videoTitle={customTitle || review.video_title}
                  videoUrl={review.video_url}
                  videoThumbnail={review.video_thumbnail}
                  channelName={review.channel_name}
                  analysis={{
                    summary,
                    pros,
                    cons,
                    keyPoints,
                    comparisonTable: review.comparison_table,
                    targetAudience,
                    cta,
                    seoKeywords: review.seo_keywords,
                  }}
                  affiliateLinks={affiliateLinks}
                />
              )}
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
