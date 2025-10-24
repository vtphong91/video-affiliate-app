'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { TemplateFormData } from '../TemplateBuilder';
import type { PromptConfig } from '@/types';

interface TemplateBasicTabProps {
  formData: TemplateFormData;
  updateFormData: (updates: Partial<TemplateFormData>) => void;
  updateConfig: (configUpdates: Partial<PromptConfig>) => void;
}

export function TemplateBasicTab({
  formData,
  updateFormData,
  updateConfig,
}: TemplateBasicTabProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Tab này bao gồm <strong>5 yếu tố bắt buộc</strong> để tạo một prompt chất lượng:
          Thông tin cơ bản, Vai trò AI, Bối cảnh, Mục tiêu và Yêu cầu cơ bản.
        </AlertDescription>
      </Alert>

      {/* Thông tin cơ bản */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Thông tin cơ bản</CardTitle>
          <CardDescription>
            Tên và mô tả template, phân loại theo category/platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên template <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="VD: Review Công nghệ - Phong cách Gen Z"
              value={formData.name}
              onChange={(e) => updateFormData({ name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Mô tả ngắn gọn về template này..."
              rows={2}
              value={formData.description}
              onChange={(e) => updateFormData({ description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">
                Category <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value: any) => updateFormData({ category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech">💻 Công nghệ</SelectItem>
                  <SelectItem value="beauty">💄 Làm đẹp</SelectItem>
                  <SelectItem value="food">🍜 Ẩm thực</SelectItem>
                  <SelectItem value="travel">✈️ Du lịch</SelectItem>
                  <SelectItem value="general">📝 Tổng hợp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="platform">
                Platform <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.platform}
                onValueChange={(value: any) => updateFormData({ platform: value })}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">📘 Facebook</SelectItem>
                  <SelectItem value="instagram">📷 Instagram</SelectItem>
                  <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                  <SelectItem value="blog">📰 Blog</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="content_type">
                Loại nội dung <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.content_type}
                onValueChange={(value: any) => updateFormData({ content_type: value })}
              >
                <SelectTrigger id="content_type">
                  <SelectValue placeholder="Chọn..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="comparison">So sánh</SelectItem>
                  <SelectItem value="tutorial">Hướng dẫn</SelectItem>
                  <SelectItem value="unboxing">Unboxing</SelectItem>
                  <SelectItem value="listicle">Listicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Element 2: Role Instruction */}
      <Card>
        <CardHeader>
          <CardTitle>🎭 Vai trò AI (Role Instruction)</CardTitle>
          <CardDescription>
            <strong>Yếu tố 2:</strong> Định nghĩa vai trò mà AI sẽ đóng khi tạo nội dung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role_instruction">
              Role Instruction <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="role_instruction"
              placeholder="VD: Bạn là chuyên gia review công nghệ với 10 năm kinh nghiệm, chuyên về smartphone và laptop. Bạn viết phong cách trẻ trung, gần gũi với Gen Z, sử dụng nhiều ví dụ thực tế và emoji phù hợp."
              rows={4}
              value={formData.role_instruction}
              onChange={(e) => updateFormData({ role_instruction: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              💡 Mẹo: Càng chi tiết về expertise, phong cách, kinh nghiệm càng tốt
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Element 1: Context */}
      <Card>
        <CardHeader>
          <CardTitle>🌐 Bối cảnh (Context)</CardTitle>
          <CardDescription>
            <strong>Yếu tố 1:</strong> Thông tin về business, đối tượng mục tiêu, giọng điệu thương hiệu
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="business_type">Loại hình kinh doanh</Label>
            <Input
              id="business_type"
              placeholder="VD: Kênh YouTube review công nghệ"
              value={formData.context.business_type}
              onChange={(e) =>
                updateFormData({
                  context: { ...formData.context, business_type: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience">Đối tượng mục tiêu</Label>
            <Input
              id="target_audience"
              placeholder="VD: Gen Z 18-25 tuổi, yêu công nghệ, có ngân sách trung bình"
              value={formData.context.target_audience}
              onChange={(e) =>
                updateFormData({
                  context: { ...formData.context, target_audience: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand_voice">Giọng điệu thương hiệu</Label>
            <Input
              id="brand_voice"
              placeholder="VD: Trẻ trung, nhiệt huyết, gần gũi, chân thành"
              value={formData.context.brand_voice}
              onChange={(e) =>
                updateFormData({
                  context: { ...formData.context, brand_voice: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="campaign_goal">Mục tiêu chiến dịch</Label>
            <Input
              id="campaign_goal"
              placeholder="VD: Ra mắt sản phẩm mới, Tăng engagement, Thu hút khách hàng tiềm năng"
              value={formData.context.campaign_goal}
              onChange={(e) =>
                updateFormData({
                  context: { ...formData.context, campaign_goal: e.target.value },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Element 3: Objective */}
      <Card>
        <CardHeader>
          <CardTitle>🎯 Mục tiêu (Objective)</CardTitle>
          <CardDescription>
            <strong>Yếu tố 3:</strong> Mục tiêu chính, mục tiêu phụ và chỉ số đo lường thành công
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primary_goal">Mục tiêu chính</Label>
            <Textarea
              id="primary_goal"
              placeholder="VD: Viết review chi tiết, khách quan về sản phẩm, giúp người đọc đưa ra quyết định mua hàng sáng suốt"
              rows={2}
              value={formData.objective.primary_goal}
              onChange={(e) =>
                updateFormData({
                  objective: { ...formData.objective, primary_goal: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="secondary_goal">Mục tiêu phụ (tùy chọn)</Label>
            <Textarea
              id="secondary_goal"
              placeholder="VD: Tăng tương tác (comment, share), Xây dựng uy tín trong cộng đồng"
              rows={2}
              value={formData.objective.secondary_goal}
              onChange={(e) =>
                updateFormData({
                  objective: { ...formData.objective, secondary_goal: e.target.value },
                })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="success_metrics">Chỉ số thành công (tùy chọn)</Label>
            <Input
              id="success_metrics"
              placeholder="VD: CTR > 15%, Thời gian đọc trung bình > 3 phút, Tỷ lệ click affiliate > 5%"
              value={formData.objective.success_metrics}
              onChange={(e) =>
                updateFormData({
                  objective: { ...formData.objective, success_metrics: e.target.value },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Element 4: Requirements (Basic) */}
      <Card>
        <CardHeader>
          <CardTitle>⚙️ Yêu cầu cơ bản (Requirements)</CardTitle>
          <CardDescription>
            <strong>Yếu tố 4:</strong> Tone, độ dài, ngôn ngữ, emoji usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tone">Tone (Giọng điệu)</Label>
              <Select
                value={formData.config.tone}
                onValueChange={(value: any) => updateConfig({ tone: value })}
              >
                <SelectTrigger id="tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Chuyên nghiệp</SelectItem>
                  <SelectItem value="casual">Thoải mái</SelectItem>
                  <SelectItem value="funny">Hài hước</SelectItem>
                  <SelectItem value="formal">Trang trọng</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="length">Độ dài</Label>
              <Select
                value={formData.config.length}
                onValueChange={(value: any) => updateConfig({ length: value })}
              >
                <SelectTrigger id="length">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">Ngắn (150-300 từ)</SelectItem>
                  <SelectItem value="medium">Trung bình (300-600 từ)</SelectItem>
                  <SelectItem value="long">Dài (1000+ từ)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Ngôn ngữ</Label>
              <Select
                value={formData.config.language}
                onValueChange={(value: any) => updateConfig({ language: value })}
              >
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emoji">Sử dụng Emoji</Label>
              <Select
                value={formData.config.emojiUsage}
                onValueChange={(value: any) => updateConfig({ emojiUsage: value })}
              >
                <SelectTrigger id="emoji">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Không dùng</SelectItem>
                  <SelectItem value="minimal">Ít</SelectItem>
                  <SelectItem value="moderate">Vừa phải</SelectItem>
                  <SelectItem value="heavy">Nhiều</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hashtag_count">Số lượng Hashtag</Label>
              <Input
                id="hashtag_count"
                type="number"
                min="0"
                max="30"
                value={formData.config.hashtagCount}
                onChange={(e) =>
                  updateConfig({ hashtagCount: parseInt(e.target.value) || 0 })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
