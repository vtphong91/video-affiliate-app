'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import type { TemplateFormData } from '../TemplateBuilder';
import type { PromptConfig } from '@/types';

interface TemplateStructureTabProps {
  formData: TemplateFormData;
  updateConfig: (configUpdates: Partial<PromptConfig>) => void;
}

export function TemplateStructureTab({
  formData,
  updateConfig,
}: TemplateStructureTabProps) {
  const structure = formData.config.structure;

  const updateStructure = (key: keyof typeof structure, value: boolean) => {
    updateConfig({
      structure: {
        ...structure,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Chọn các phần cấu trúc mà bạn muốn AI tạo ra trong nội dung. Cấu trúc rõ ràng giúp nội dung dễ đọc và chuyên nghiệp hơn.
        </AlertDescription>
      </Alert>

      {/* Cấu trúc nội dung */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Cấu trúc nội dung</CardTitle>
          <CardDescription>
            Chọn các phần bạn muốn xuất hiện trong nội dung review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="intro"
                checked={structure.intro}
                onChange={(e) => updateStructure('intro', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <Label htmlFor="intro" className="cursor-pointer">
                  <div className="font-medium">Phần mở đầu (Intro)</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Hook bắt mắt, giới thiệu sơ lược về sản phẩm/dịch vụ
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="hook"
                checked={structure.hook}
                onChange={(e) => updateStructure('hook', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <Label htmlFor="hook" className="cursor-pointer">
                  <div className="font-medium">Hook (Câu móc)</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Câu đầu tiên hấp dẫn, thu hút sự chú ý ngay lập tức
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="summary"
                checked={structure.summary}
                onChange={(e) => updateStructure('summary', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <Label htmlFor="summary" className="cursor-pointer">
                  <div className="font-medium">Tóm tắt tổng quan (Summary)</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tóm tắt ngắn gọn 3-5 điểm chính về sản phẩm
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="keyPoints"
                checked={structure.keyPoints}
                onChange={(e) => updateStructure('keyPoints', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <Label htmlFor="keyPoints" className="cursor-pointer">
                  <div className="font-medium">Điểm nổi bật (Key Points)</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Liệt kê các tính năng, điểm mạnh quan trọng nhất
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="prosCons"
                checked={structure.prosCons}
                onChange={(e) => updateStructure('prosCons', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <Label htmlFor="prosCons" className="cursor-pointer">
                  <div className="font-medium">Ưu/Nhược điểm (Pros & Cons)</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Đánh giá cân bằng cả điểm mạnh và điểm yếu
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="comparison"
                checked={structure.comparison}
                onChange={(e) => updateStructure('comparison', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <Label htmlFor="comparison" className="cursor-pointer">
                  <div className="font-medium">So sánh (Comparison)</div>
                  <p className="text-xs text-gray-500 mt-1">
                    So sánh với các sản phẩm đối thủ cùng phân khúc
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="priceAnalysis"
                checked={structure.priceAnalysis}
                onChange={(e) => updateStructure('priceAnalysis', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <Label htmlFor="priceAnalysis" className="cursor-pointer">
                  <div className="font-medium">Phân tích giá (Price Analysis)</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Đánh giá giá trị so với giá tiền, tính cạnh tranh
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="verdict"
                checked={structure.verdict}
                onChange={(e) => updateStructure('verdict', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <Label htmlFor="verdict" className="cursor-pointer">
                  <div className="font-medium">Đánh giá cuối (Verdict)</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Kết luận tổng thể, đánh giá chung về sản phẩm
                  </p>
                </Label>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                id="callToAction"
                checked={structure.callToAction}
                onChange={(e) => updateStructure('callToAction', e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <div className="flex-1">
                <Label htmlFor="callToAction" className="cursor-pointer">
                  <div className="font-medium">Call-to-Action (CTA)</div>
                  <p className="text-xs text-gray-500 mt-1">
                    Lời kêu gọi hành động: mua hàng, đăng ký, tìm hiểu thêm...
                  </p>
                </Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tùy chọn bổ sung */}
      <Card>
        <CardHeader>
          <CardTitle>⚡ Tùy chọn bổ sung</CardTitle>
          <CardDescription>
            Các tính năng nâng cao cho nội dung
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              id="seoOptimized"
              checked={formData.config.seoOptimized}
              onChange={(e) => updateConfig({ seoOptimized: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <Label htmlFor="seoOptimized" className="cursor-pointer">
                <div className="font-medium">SEO Optimized</div>
                <p className="text-xs text-gray-500 mt-1">
                  Tối ưu hóa cho công cụ tìm kiếm (keywords, meta description...)
                </p>
              </Label>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <input
              type="checkbox"
              id="includeTimestamps"
              checked={formData.config.includeTimestamps}
              onChange={(e) => updateConfig({ includeTimestamps: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <div className="flex-1">
              <Label htmlFor="includeTimestamps" className="cursor-pointer">
                <div className="font-medium">Bao gồm Timestamps</div>
                <p className="text-xs text-gray-500 mt-1">
                  Thêm timestamps cho video review (00:15, 01:30...)
                </p>
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview cấu trúc */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">👀 Preview Cấu trúc</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            {structure.hook && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">1. Hook - Câu móc hấp dẫn</span>
              </div>
            )}
            {structure.intro && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">2. Intro - Giới thiệu sơ lược</span>
              </div>
            )}
            {structure.summary && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">3. Summary - Tóm tắt tổng quan</span>
              </div>
            )}
            {structure.keyPoints && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">4. Key Points - Điểm nổi bật</span>
              </div>
            )}
            {structure.prosCons && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">5. Pros & Cons - Ưu/Nhược điểm</span>
              </div>
            )}
            {structure.comparison && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">6. Comparison - So sánh</span>
              </div>
            )}
            {structure.priceAnalysis && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">7. Price Analysis - Phân tích giá</span>
              </div>
            )}
            {structure.verdict && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">8. Verdict - Đánh giá cuối</span>
              </div>
            )}
            {structure.callToAction && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="font-medium">9. Call-to-Action - Kêu gọi hành động</span>
              </div>
            )}

            {!Object.values(structure).some(Boolean) && (
              <p className="text-gray-500 italic">
                Chưa chọn phần nào. Hãy chọn ít nhất 1 phần cấu trúc.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
