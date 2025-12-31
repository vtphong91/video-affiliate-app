'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Link2, Plus, Trash2, Check, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

export interface AffiliateLink {
  platform: string;
  url: string;
  price?: string;
}

interface AffiliateLinkGeneratorProps {
  links: AffiliateLink[];
  onChange: (links: AffiliateLink[]) => void;
}

export function AffiliateLinkGenerator({ links, onChange }: AffiliateLinkGeneratorProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Manual mode state
  const [manualPlatform, setManualPlatform] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [manualPrice, setManualPrice] = useState('');

  // API mode state
  const [productUrl, setProductUrl] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState<string>('');

  // Detect platform from URL
  const detectPlatform = (url: string): string => {
    if (url.includes('shopee.vn')) return 'Shopee';
    if (url.includes('lazada.vn')) return 'Lazada';
    if (url.includes('tiki.vn')) return 'Tiki';
    if (url.includes('sendo.vn')) return 'Sendo';
    if (url.includes('amazon')) return 'Amazon';
    return 'Other';
  };

  // Add manual link
  const handleAddManual = () => {
    if (!manualPlatform || !manualUrl) {
      toast({
        title: 'Thiếu thông tin',
        description: 'Vui lòng nhập đầy đủ platform và URL',
        variant: 'destructive',
      });
      return;
    }

    const newLink: AffiliateLink = {
      platform: manualPlatform,
      url: manualUrl,
      price: manualPrice || undefined,
    };

    onChange([...links, newLink]);

    // Reset form
    setManualPlatform('');
    setManualUrl('');
    setManualPrice('');

    toast({
      title: 'Đã thêm!',
      description: 'Link affiliate đã được thêm vào danh sách',
    });
  };

  // Generate link via AccessTrade API
  const handleGenerateFromAPI = async () => {
    if (!productUrl) {
      toast({
        title: 'Thiếu URL',
        description: 'Vui lòng nhập URL sản phẩm',
        variant: 'destructive',
      });
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/affiliate-links/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalUrl: productUrl,
          platform: detectPlatform(productUrl),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo link affiliate');
      }

      const newLink: AffiliateLink = {
        platform: data.data.platform || detectPlatform(productUrl),
        url: data.data.affiliateUrl || productUrl,
        price: data.data.price,
      };

      onChange([...links, newLink]);

      // Reset form
      setProductUrl('');
      setDetectedPlatform('');

      toast({
        title: 'Thành công!',
        description: 'Link affiliate đã được tạo và thêm vào danh sách',
      });
    } catch (error) {
      console.error('Generate link error:', error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể tạo link affiliate',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  // Remove link
  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
    toast({
      title: 'Đã xóa',
      description: 'Link affiliate đã được xóa',
    });
  };

  // Copy link to clipboard
  const handleCopy = async (url: string, index: number) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);

      toast({
        title: 'Đã copy!',
        description: 'Link đã được copy vào clipboard',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể copy link',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="h-5 w-5" />
          Link Affiliate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="manual" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Thủ Công</TabsTrigger>
            <TabsTrigger value="api">Tạo Với API</TabsTrigger>
          </TabsList>

          {/* Manual Mode */}
          <TabsContent value="manual" className="space-y-4">
            <Alert>
              <AlertDescription>
                Thêm link affiliate thủ công. Bạn có thể dùng link đã shortened từ AccessTrade hoặc platform khác.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <Label htmlFor="manual-platform">Platform</Label>
                <Input
                  id="manual-platform"
                  value={manualPlatform}
                  onChange={(e) => setManualPlatform(e.target.value)}
                  placeholder="VD: Shopee, Lazada, Tiki..."
                />
              </div>

              <div>
                <Label htmlFor="manual-url">URL Affiliate</Label>
                <Input
                  id="manual-url"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://vn.shp.ee/..."
                />
              </div>

              <div>
                <Label htmlFor="manual-price">Giá (Tùy chọn)</Label>
                <Input
                  id="manual-price"
                  value={manualPrice}
                  onChange={(e) => setManualPrice(e.target.value)}
                  placeholder="VD: 299.000đ"
                />
              </div>

              <Button onClick={handleAddManual} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Link
              </Button>
            </div>
          </TabsContent>

          {/* API Mode */}
          <TabsContent value="api" className="space-y-4">
            <Alert>
              <AlertDescription>
                Tạo link affiliate tự động qua API AccessTrade. Chỉ cần paste URL sản phẩm.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <Label htmlFor="product-url">URL Sản Phẩm</Label>
                <Input
                  id="product-url"
                  value={productUrl}
                  onChange={(e) => {
                    setProductUrl(e.target.value);
                    setDetectedPlatform(detectPlatform(e.target.value));
                  }}
                  placeholder="https://shopee.vn/product/..."
                />
                {detectedPlatform && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Platform phát hiện: <strong>{detectedPlatform}</strong>
                  </p>
                )}
              </div>

              <Button onClick={handleGenerateFromAPI} className="w-full" disabled={generating}>
                {generating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo link...
                  </>
                ) : (
                  <>
                    <Link2 className="h-4 w-4 mr-2" />
                    Tạo Link Affiliate
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Links List */}
        {links.length > 0 && (
          <div className="mt-6 space-y-3">
            <Label>Danh Sách Links ({links.length})</Label>
            {links.map((link, index) => (
              <div key={index} className="flex items-center gap-2 p-3 border rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{link.platform}</p>
                  <p className="text-xs text-muted-foreground truncate">{link.url}</p>
                  {link.price && <p className="text-xs text-green-600 mt-1">{link.price}</p>}
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopy(link.url, index)}
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleRemove(index)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
