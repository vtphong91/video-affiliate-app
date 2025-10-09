'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Users, ExternalLink } from 'lucide-react';
import { getVideoEmbedUrl, formatDate } from '@/lib/utils';
import type { VideoInfo, AIAnalysis, AffiliateLink } from '@/types';

interface ReviewPreviewProps {
  videoInfo: VideoInfo;
  analysis: AIAnalysis;
  affiliateLinks: AffiliateLink[];
  customTitle?: string;
}

export function ReviewPreview({
  videoInfo,
  analysis,
  affiliateLinks,
  customTitle,
}: ReviewPreviewProps) {
  const title = customTitle || videoInfo.title;

  return (
    <Card>
      <CardContent className="p-6 space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold mb-4">{title}</h1>
          <div className="flex gap-4 text-gray-600 text-sm">
            <span>📅 {formatDate(new Date())}</span>
            <span>👁️ 0 lượt xem</span>
          </div>
        </div>

        {/* Quick Summary */}
        <div className="bg-blue-50 p-6 rounded-lg">
          <h2 className="font-bold mb-3 flex items-center gap-2">
            📊 Tóm tắt nhanh (5 phút đọc)
          </h2>
          <p className="text-gray-700">{analysis.summary}</p>
        </div>

        {/* Video Embed */}
        <div>
          <h2 className="text-2xl font-bold mb-4">🎥 Video Review Chi Tiết</h2>
          <div className="aspect-video rounded-lg overflow-hidden bg-black mb-4">
            <iframe
              src={getVideoEmbedUrl(videoInfo.platform, videoInfo.videoId)}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
          <div className="text-sm text-gray-600">
            📹 Video gốc từ:{' '}
            <a
              href={videoInfo.channelUrl}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {videoInfo.channelName}
            </a>
            <br />
            ⚠️ Mọi quyền thuộc về kênh gốc
          </div>
        </div>

        {/* Key Points */}
        {analysis.keyPoints && analysis.keyPoints.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-4">🎯 Điểm Nổi Bật</h2>
            <div className="space-y-3">
              {analysis.keyPoints.map((point, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <Badge variant="secondary" className="h-fit">
                    {point.time}
                  </Badge>
                  <p className="text-gray-700">{point.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Pros & Cons */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Pros */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
              Ưu Điểm
            </h3>
            <ul className="space-y-2">
              {analysis.pros.map((pro, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{pro}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cons */}
          <div className="space-y-3">
            <h3 className="text-xl font-bold flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              Nhược Điểm
            </h3>
            <ul className="space-y-2">
              {analysis.cons.map((con, index) => (
                <li key={index} className="flex gap-2 items-start">
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{con}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Comparison Table */}
        {analysis.comparisonTable && (
          <div>
            <h2 className="text-2xl font-bold mb-4">📊 So Sánh Chi Tiết</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    {analysis.comparisonTable.headers.map((header, index) => (
                      <th
                        key={index}
                        className="border p-3 text-left font-bold"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {analysis.comparisonTable.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {row.map((cell, cellIndex) => (
                        <td key={cellIndex} className="border p-3">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Target Audience */}
        <div>
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Users className="h-6 w-6" />
            Phù Hợp Với
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {analysis.targetAudience.map((audience, index) => (
              <div
                key={index}
                className="p-4 bg-blue-50 rounded-lg text-center"
              >
                <p className="font-medium text-gray-800">{audience}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Affiliate Section - CTA */}
        {affiliateLinks.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">🛒 Mua Ở Đâu Tốt Nhất?</h2>
            <p className="mb-6 text-gray-700">{analysis.cta}</p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {affiliateLinks.map((link, index) => (
                <Button
                  key={index}
                  asChild
                  size="lg"
                  className="w-full"
                  variant={index === 0 ? 'default' : 'outline'}
                >
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="font-bold">{link.platform}</span>
                      {link.price && (
                        <span className="text-sm">{link.price}</span>
                      )}
                    </div>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="text-sm text-gray-500 border-t pt-4">
          <p className="mb-2">
            <strong>Lưu ý:</strong> Bài viết này được tạo tự động bằng AI dựa
            trên nội dung video. Mọi thông tin chỉ mang tính chất tham khảo.
          </p>
          <p>
            Video gốc thuộc bản quyền của{' '}
            <a
              href={videoInfo.channelUrl}
              className="text-blue-600 hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {videoInfo.channelName}
            </a>
            .
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
