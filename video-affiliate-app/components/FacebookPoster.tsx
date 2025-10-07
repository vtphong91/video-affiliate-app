'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Share2, Loader2, ExternalLink, Copy, Zap } from 'lucide-react';
import { formatFacebookPost } from '@/lib/apis/facebook';
import { getLandingPageUrl, copyToClipboard } from '@/lib/utils';
import { useSettings } from '@/lib/contexts/settings-context';
import type { AIAnalysis, AffiliateLink } from '@/types';

interface FacebookPosterProps {
  reviewId: string;
  slug: string;
  videoTitle: string;
  videoUrl: string;
  videoThumbnail: string;
  channelName?: string;
  analysis: AIAnalysis;
  affiliateLinks?: AffiliateLink[];
}

export function FacebookPoster({
  reviewId,
  slug,
  videoTitle,
  videoUrl,
  videoThumbnail,
  channelName,
  analysis,
  affiliateLinks = [],
}: FacebookPosterProps) {
  const { toast } = useToast();
  const { settings } = useSettings();
  const landingUrl = getLandingPageUrl(slug);

  // Note: Webhook is now configured server-side via .env
  // This component no longer needs to check client-side settings

  const [message, setMessage] = useState(() =>
    formatFacebookPost({
      title: videoTitle,
      summary: analysis.summary,
      pros: analysis.pros,
      cons: analysis.cons,
      targetAudience: analysis.targetAudience,
      keywords: analysis.seoKeywords,
      videoUrl,
      channelName,
      landingUrl,
    })
  );

  const [isPosting, setIsPosting] = useState(false);
  const [postUrl, setPostUrl] = useState<string | null>(null);

  const handleCopyLink = async () => {
    const success = await copyToClipboard(landingUrl);
    if (success) {
      toast({
        title: 'Đã copy!',
        description: 'Link landing page đã được copy vào clipboard',
      });
    }
  };

  const handleCopyMessage = async () => {
    const success = await copyToClipboard(message);
    if (success) {
      toast({
        title: 'Đã copy!',
        description: 'Nội dung đã được copy vào clipboard',
      });
    }
  };

  const handlePost = async () => {
    setIsPosting(true);

    try {
      // Prepare affiliate links for comment
      const affiliateComment = affiliateLinks.length > 0
        ? `🛒 LINK MUA HÀNG:\n\n` +
          affiliateLinks
            .map((link, index) => `${index + 1}. ${link.platform}: ${link.url}${link.price ? ` - ${link.price}` : ''}${link.discount ? ` (${link.discount})` : ''}`)
            .join('\n')
        : null;

      // Webhook URL and Secret are now handled server-side via environment variables
      const response = await fetch('/api/post-facebook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reviewId,
          message,
          videoUrl,
          link: landingUrl,
          imageUrl: videoThumbnail,
          affiliateComment,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      setPostUrl(data.postUrl);

      toast({
        title: '✅ Đã gửi thành công!',
        description: 'Make.com đang xử lý và sẽ đăng bài lên Facebook',
      });
    } catch (error) {
      console.error('Post error:', error);
      toast({
        title: 'Lỗi',
        description:
          error instanceof Error ? error.message : 'Không thể gửi webhook tới Make.com',
        variant: 'destructive',
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5 text-blue-600" />
          Đăng Lên Facebook
        </CardTitle>
        <CardDescription>
          Gửi tới Make.com để tự động đăng lên Facebook (và các platform khác)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Make.com Info */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 flex items-start gap-3">
          <Zap className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-purple-800 font-medium mb-1">
              ⚡ Powered by Make.com
            </p>
            <p className="text-sm text-purple-700">
              Khi click đăng, nội dung sẽ được gửi tới Make.com để xử lý và post lên các platform bạn đã setup.
              Webhook được bảo mật trong file .env
            </p>
          </div>
        </div>

        {/* Landing Page URL */}
        <div className="space-y-2">
          <Label>Link Landing Page</Label>
          <div className="flex gap-2">
            <input
              type="text"
              value={landingUrl}
              readOnly
              className="flex-1 px-3 py-2 border rounded-md bg-gray-50 text-sm"
            />
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Facebook Message */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="fb-message">Nội Dung Đăng</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyMessage}
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
          </div>
          <Textarea
            id="fb-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={10}
            placeholder="Nội dung bài đăng Facebook..."
          />
          <p className="text-sm text-gray-500">
            {message.length} ký tự
          </p>
        </div>

        {/* Preview */}
        <div className="border rounded-lg p-4 bg-gray-50">
          <div className="text-sm font-medium mb-2">Preview:</div>
          <div className="whitespace-pre-wrap text-sm text-gray-700">
            {message}
          </div>
        </div>

        {/* Post Button */}
        <Button
          onClick={handlePost}
          disabled={isPosting || !message}
          className="w-full"
          size="lg"
        >
          {isPosting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang gửi...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Gửi tới Make.com
            </>
          )}
        </Button>

        {/* Success Message */}
        {postUrl && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800 font-medium mb-2">
              ✅ Đã gửi thành công!
            </p>
            <p className="text-sm text-green-700 mb-2">
              Make.com đang xử lý request. Bài viết sẽ xuất hiện trên Facebook trong giây lát.
            </p>
            {postUrl !== landingUrl && (
              <a
                href={postUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline flex items-center gap-1 text-sm"
              >
                Xem bài đăng
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        )}

        {/* Affiliate Links Display */}
        {affiliateLinks.length > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <p className="text-sm text-green-800 font-medium mb-2">
              🛒 Affiliate Links (sẽ được đăng trong comment):
            </p>
            <ul className="text-sm text-green-700 space-y-1">
              {affiliateLinks.map((link, index) => (
                <li key={index}>
                  {index + 1}. <strong>{link.platform}</strong>: {link.url.slice(0, 50)}...
                  {link.price && ` - ${link.price}`}
                  {link.discount && ` (${link.discount})`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Info Note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-800">
            <strong>💡 Lưu ý:</strong> Make.com scenario của bạn sẽ nhận data và tự động:
          </p>
          <ul className="text-sm text-blue-700 mt-2 ml-4 space-y-1">
            <li>✓ Post lên Facebook Page (với video link gốc)</li>
            <li>✓ Comment affiliate links (nếu có)</li>
            <li>✓ Có thể post lên nhiều platform khác</li>
            <li>✓ Tự động retry nếu có lỗi</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
