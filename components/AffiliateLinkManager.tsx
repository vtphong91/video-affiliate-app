'use client';

/**
 * Affiliate Link Manager Component
 * Quản lý affiliate links với tính năng tự động tạo tracking link
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Plus, X, Link as LinkIcon, ExternalLink, Copy, Sparkles } from 'lucide-react';
import type { AffiliateLink } from '@/types';

interface Merchant {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  is_active: boolean;
}

interface AffiliateLinkManagerProps {
  affiliateLinks: AffiliateLink[];
  onAffiliateLinksChange: (links: AffiliateLink[]) => void;
}

export function AffiliateLinkManager({
  affiliateLinks,
  onAffiliateLinksChange,
}: AffiliateLinkManagerProps) {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = useState(false);
  const [linkMode, setLinkMode] = useState<'auto' | 'manual'>('auto');
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [generating, setGenerating] = useState(false);

  // Auto mode states
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [price, setPrice] = useState('');

  // Manual mode states
  const [manualLink, setManualLink] = useState<AffiliateLink>({
    platform: '',
    url: '',
    price: '',
  });

  useEffect(() => {
    if (showDialog && linkMode === 'auto') {
      loadMerchants();
    }
  }, [showDialog, linkMode]);

  const loadMerchants = async () => {
    setLoadingMerchants(true);
    try {
      const response = await fetch('/api/merchants', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Không thể tải danh sách merchants');
      }

      const data = await response.json();
      setMerchants(data.data || []);
    } catch (error) {
      console.error('Load merchants error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách merchants',
        variant: 'destructive'
      });
    } finally {
      setLoadingMerchants(false);
    }
  };

  const handleGenerateLink = async () => {
    if (!selectedMerchant || !originalUrl) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn merchant và nhập URL gốc',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);

    try {
      const response = await fetch('/api/affiliate-links/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          merchantId: selectedMerchant,
          originalUrl,
          linkType: 'product'
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo affiliate link');
      }

      // Tìm merchant
      const merchant = merchants.find(m => m.id === selectedMerchant);

      // Add to list với short URL (ưu tiên) hoặc affiliate URL
      const newLink: AffiliateLink = {
        platform: merchant?.name || 'Unknown',
        url: data.data.shortUrl || data.data.affiliateUrl,
        price: price || undefined,
        affSid: data.data.affSid,
        generationMethod: data.data.generationMethod
      };

      onAffiliateLinksChange([...affiliateLinks, newLink]);

      toast({
        title: 'Thành công',
        description: `Đã tạo link cho ${merchant?.name}`,
        variant: 'default'
      });

      // Reset form
      setSelectedMerchant('');
      setOriginalUrl('');
      setPrice('');
      setShowDialog(false);

    } catch (error) {
      console.error('Generate link error:', error);
      toast({
        title: 'Lỗi tạo link',
        description: error instanceof Error ? error.message : 'Không thể tạo affiliate link',
        variant: 'destructive'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleAddManualLink = () => {
    if (!manualLink.platform || !manualLink.url) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập tên nền tảng và link',
        variant: 'destructive'
      });
      return;
    }

    onAffiliateLinksChange([...affiliateLinks, manualLink]);
    setManualLink({ platform: '', url: '', price: '' });
    setShowDialog(false);

    toast({
      title: 'Thành công',
      description: 'Đã thêm link affiliate',
      variant: 'default'
    });
  };

  const handleRemoveLink = (index: number) => {
    onAffiliateLinksChange(affiliateLinks.filter((_, i) => i !== index));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Đã sao chép',
      description: 'Link đã được sao chép vào clipboard',
      variant: 'default'
    });
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Link Affiliate</CardTitle>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Thêm Link
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Thêm Affiliate Link</DialogTitle>
                <DialogDescription>
                  Tạo tracking link tự động hoặc nhập link thủ công
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Mode Selection */}
                <div className="flex gap-2 p-1 bg-muted rounded-lg">
                  <Button
                    variant={linkMode === 'auto' ? 'default' : 'ghost'}
                    onClick={() => setLinkMode('auto')}
                    className="flex-1"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Tự Động
                  </Button>
                  <Button
                    variant={linkMode === 'manual' ? 'default' : 'ghost'}
                    onClick={() => setLinkMode('manual')}
                    className="flex-1"
                  >
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Thủ Công
                  </Button>
                </div>

                {/* Auto Mode */}
                {linkMode === 'auto' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Merchant</Label>
                      <Select
                        value={selectedMerchant}
                        onValueChange={setSelectedMerchant}
                        disabled={loadingMerchants}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn merchant (Shopee, Lazada, Tiki...)" />
                        </SelectTrigger>
                        <SelectContent>
                          {merchants.filter(m => m.is_active).map(merchant => (
                            <SelectItem key={merchant.id} value={merchant.id}>
                              {merchant.name} ({merchant.domain})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>URL Gốc Sản Phẩm</Label>
                      <Input
                        type="url"
                        value={originalUrl}
                        onChange={(e) => setOriginalUrl(e.target.value)}
                        placeholder="https://shopee.vn/product/..."
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Hệ thống sẽ tự động tạo tracking link
                      </p>
                    </div>

                    <div>
                      <Label>Giá (không bắt buộc)</Label>
                      <Input
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="VD: 599.000đ"
                      />
                    </div>
                  </div>
                )}

                {/* Manual Mode */}
                {linkMode === 'manual' && (
                  <div className="space-y-4">
                    <div>
                      <Label>Tên Nền Tảng</Label>
                      <Input
                        value={manualLink.platform}
                        onChange={(e) =>
                          setManualLink({ ...manualLink, platform: e.target.value })
                        }
                        placeholder="VD: Shopee, Lazada, Tiki"
                      />
                    </div>

                    <div>
                      <Label>Link Affiliate</Label>
                      <Input
                        type="url"
                        value={manualLink.url}
                        onChange={(e) =>
                          setManualLink({ ...manualLink, url: e.target.value })
                        }
                        placeholder="https://..."
                      />
                    </div>

                    <div>
                      <Label>Giá (không bắt buộc)</Label>
                      <Input
                        value={manualLink.price || ''}
                        onChange={(e) =>
                          setManualLink({ ...manualLink, price: e.target.value })
                        }
                        placeholder="VD: 599.000đ"
                      />
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setShowDialog(false)}
                  disabled={generating}
                >
                  Hủy
                </Button>
                {linkMode === 'auto' ? (
                  <Button
                    onClick={handleGenerateLink}
                    disabled={generating || !selectedMerchant || !originalUrl}
                  >
                    {generating ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Đang tạo...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Tạo Link Tự Động
                      </>
                    )}
                  </Button>
                ) : (
                  <Button onClick={handleAddManualLink}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm Link
                  </Button>
                )}
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {affiliateLinks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Chưa có link nào. Click "Thêm Link" để bắt đầu.
          </div>
        ) : (
          affiliateLinks.map((link, index) => (
            <div
              key={index}
              className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg border"
            >
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{link.platform}</span>
                  {link.generationMethod && (
                    <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                      {link.generationMethod}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600 truncate font-mono">
                  {link.url}
                </div>
                {link.price && (
                  <div className="text-sm font-bold text-green-600">
                    {link.price}
                  </div>
                )}
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(link.url)}
                  title="Sao chép link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.open(link.url, '_blank')}
                  title="Mở link"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveLink(index)}
                  title="Xóa link"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
