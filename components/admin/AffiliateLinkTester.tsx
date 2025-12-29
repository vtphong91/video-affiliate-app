'use client';

/**
 * Affiliate Link Tester Component
 * Cho phép admin test tạo affiliate link với các merchants
 */

import { useState, useEffect } from 'react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Copy, ExternalLink, Link as LinkIcon } from 'lucide-react';

interface Merchant {
  id: string;
  name: string;
  domain: string;
  campaign_id?: string;
  logo_url?: string;
  is_active: boolean;
}

export function AffiliateLinkTester() {
  const { toast } = useToast();
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<{
    affiliateUrl: string;
    shortUrl?: string;
    affSid: string;
    generationMethod: string;
    usedFallback: boolean;
  } | null>(null);

  // Load merchants on mount
  useEffect(() => {
    loadMerchants();
  }, []);

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

  const handleGenerate = async () => {
    if (!selectedMerchant) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn merchant',
        variant: 'destructive'
      });
      return;
    }

    if (!originalUrl) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập URL gốc',
        variant: 'destructive'
      });
      return;
    }

    setGenerating(true);
    setResult(null);

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

      setResult(data.data);

      toast({
        title: 'Thành công',
        description: data.message || 'Đã tạo affiliate link thành công',
        variant: 'default'
      });

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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Đã sao chép',
      description: `${label} đã được sao chép vào clipboard`,
      variant: 'default'
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test Tạo Affiliate Link</CardTitle>
          <CardDescription>
            Kiểm tra tính năng tạo affiliate link với các merchants
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Merchant Selection */}
          <div>
            <Label htmlFor="merchant">Merchant</Label>
            <Select
              value={selectedMerchant}
              onValueChange={setSelectedMerchant}
              disabled={loadingMerchants}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn merchant" />
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

          {/* Original URL */}
          <div>
            <Label htmlFor="originalUrl">URL Gốc</Label>
            <Input
              id="originalUrl"
              type="url"
              value={originalUrl}
              onChange={(e) => setOriginalUrl(e.target.value)}
              placeholder="https://shopee.vn/product/..."
            />
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={generating || !selectedMerchant || !originalUrl}
            className="w-full"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            {generating ? 'Đang tạo link...' : 'Tạo Affiliate Link'}
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Kết Quả</CardTitle>
            <CardDescription>
              Phương thức: <strong>{result.generationMethod}</strong>
              {result.usedFallback && ' (sử dụng fallback)'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Affiliate URL */}
            <div>
              <Label>Affiliate Link (Dài)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={result.affiliateUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(result.affiliateUrl, 'Affiliate link')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => window.open(result.affiliateUrl, '_blank')}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Short URL */}
            {result.shortUrl && (
              <div>
                <Label>Short Link</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={result.shortUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => copyToClipboard(result.shortUrl!, 'Short link')}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => window.open(result.shortUrl!, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Aff SID */}
            <div>
              <Label>Aff SID (Tracking)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={result.affSid}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(result.affSid, 'Aff SID')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
