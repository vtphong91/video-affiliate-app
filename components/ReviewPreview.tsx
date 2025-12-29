'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Users, ExternalLink, FileText } from 'lucide-react';
import { getVideoEmbedUrl, formatDate } from '@/lib/utils';
import type { VideoInfo, AIAnalysis, AffiliateLink } from '@/types';
import 'react-quill/dist/quill.snow.css';

interface ReviewPreviewProps {
  videoInfo: VideoInfo;
  analysis: AIAnalysis;
  affiliateLinks: AffiliateLink[];
  customTitle?: string;
  customContent?: string | null; // ✅ NEW: Add custom content prop
  reviewId?: string; // For click tracking
}

export function ReviewPreview({
  videoInfo,
  analysis,
  affiliateLinks,
  customTitle,
  customContent, // ✅ NEW
  reviewId,
}: ReviewPreviewProps) {
  const title = customTitle || videoInfo.title;

  // Handle affiliate link click with tracking
  const handleAffiliateClick = async (link: AffiliateLink, e: React.MouseEvent<HTMLAnchorElement>) => {
    // Only track if we have reviewId and affSid (tracking enabled)
    if (!reviewId || !link.affSid) {
      return; // Let default link behavior happen
    }

    e.preventDefault();

    try {
      // Track click
      const response = await fetch('/api/affiliate-links/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          affSid: link.affSid,
          referrer: document.referrer || window.location.href
        })
      });

      const data = await response.json();

      if (data.success && data.redirectUrl) {
        // Redirect to tracking URL
        window.open(data.redirectUrl, '_blank', 'noopener,noreferrer');
      } else {
        // Fallback to direct link
        window.open(link.trackingUrl || link.url, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error('Click tracking failed:', error);
      // Fallback to direct link
      window.open(link.trackingUrl || link.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Show custom content if it exists and is substantial (template mode)
  const hasCustomContent = customContent && customContent.length > 100;

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
        {analysis.summary && (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h2 className="font-bold mb-3">
              Tóm tắt nhanh (5 phút đọc)
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap">{analysis.summary}</p>
          </div>
        )}

        {/* ✅ Custom Content Section - Show if available (Template Mode) */}
        {hasCustomContent && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-lg border border-purple-200">
            <h2 className="text-2xl font-bold mb-4">
              Nội Dung Review Đầy Đủ
            </h2>
            <div className="ql-editor" style={{ padding: 0 }}>
              <div
                dangerouslySetInnerHTML={{ __html: customContent }}
              />
            </div>
          </div>
        )}

        {/* Video Embed */}
        <div>
          <h2 className="text-2xl font-bold mb-4">🎥 Video Review Chi Tiết</h2>
          <div className="aspect-video rounded-lg overflow-hidden bg-black">
            <iframe
              src={getVideoEmbedUrl(videoInfo.platform, videoInfo.videoId)}
              className="w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
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
        {(analysis.pros?.length > 0 || analysis.cons?.length > 0) && (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Pros */}
            {analysis.pros && analysis.pros.length > 0 && (
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
            )}

            {/* Cons */}
            {analysis.cons && analysis.cons.length > 0 && (
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
            )}
          </div>
        )}

        {/* Comparison Table */}
        {analysis.comparisonTable && analysis.comparisonTable.headers?.length > 0 && (
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
        {analysis.targetAudience && analysis.targetAudience.length > 0 && (
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
        )}

        {/* Affiliate Section - CTA */}
        {affiliateLinks && affiliateLinks.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-lg">
            <h2 className="text-3xl font-bold mb-4">🛒 Mua Ở Đâu Tốt Nhất?</h2>
            {analysis.cta && (
              <p className="mb-6 text-gray-700">{analysis.cta}</p>
            )}
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
                    href={link.trackingUrl || link.url}
                    onClick={(e) => handleAffiliateClick(link, e)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="flex flex-col items-start w-full">
                      <span className="font-bold uppercase">{link.platform}</span>
                      {link.price && (
                        <span className="text-sm font-semibold text-green-600">{link.price}</span>
                      )}
                    </div>
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
