'use client';

/**
 * Short URL Manager Component
 * Quản lý các short URLs đã tạo
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Copy, ExternalLink, Link as LinkIcon, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ShortUrl {
  id: string;
  short_code: string;
  original_url: string;
  title?: string;
  description?: string;
  clicks: number;
  last_clicked_at?: string;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
  merchant_id?: string;
  aff_sid?: string;
}

export function ShortUrlManager() {
  const { toast } = useToast();
  const [shortUrls, setShortUrls] = useState<ShortUrl[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    originalUrl: '',
    title: '',
    description: '',
    expiresInDays: 90
  });

  useEffect(() => {
    loadShortUrls();
  }, []);

  const loadShortUrls = async () => {
    setLoading(true);
    try {
      // Gọi API để lấy danh sách short URLs của user hiện tại
      // Tạm thời giả lập data
      setShortUrls([]);

      toast({
        title: 'Thông báo',
        description: 'Chức năng đang được phát triển',
        variant: 'default'
      });
    } catch (error) {
      console.error('Load short URLs error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách short URLs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.originalUrl) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập URL gốc',
        variant: 'destructive'
      });
      return;
    }

    setCreating(true);

    try {
      const response = await fetch('/api/shortener/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Không thể tạo short URL');
      }

      toast({
        title: 'Thành công',
        description: `Short URL đã được tạo: ${data.data.short_url}`,
        variant: 'default'
      });

      // Reset form
      setFormData({
        originalUrl: '',
        title: '',
        description: '',
        expiresInDays: 90
      });

      setShowCreateDialog(false);
      loadShortUrls(); // Reload list

    } catch (error) {
      console.error('Create short URL error:', error);
      toast({
        title: 'Lỗi tạo short URL',
        description: error instanceof Error ? error.message : 'Không thể tạo short URL',
        variant: 'destructive'
      });
    } finally {
      setCreating(false);
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

  const getShortUrl = (code: string) => {
    const baseUrl = typeof window !== 'undefined'
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return `${baseUrl}/s/${code}`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quản Lý Short URLs</CardTitle>
              <CardDescription>
                Tạo và quản lý các short URLs cho affiliate links
              </CardDescription>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Tạo Short URL
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tạo Short URL Mới</DialogTitle>
                  <DialogDescription>
                    Tạo short URL cho bất kỳ link dài nào
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="originalUrl">URL Gốc *</Label>
                    <Input
                      id="originalUrl"
                      type="url"
                      value={formData.originalUrl}
                      onChange={(e) => setFormData({ ...formData, originalUrl: e.target.value })}
                      placeholder="https://example.com/very-long-url..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="title">Tiêu Đề</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Tên mô tả cho link (không bắt buộc)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Mô Tả</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Mô tả chi tiết (không bắt buộc)"
                    />
                  </div>

                  <div>
                    <Label htmlFor="expiresInDays">Hết hạn sau (ngày)</Label>
                    <Input
                      id="expiresInDays"
                      type="number"
                      value={formData.expiresInDays}
                      onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) })}
                      placeholder="90"
                      min="1"
                      max="365"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setShowCreateDialog(false)}
                    disabled={creating}
                  >
                    Hủy
                  </Button>
                  <Button onClick={handleCreate} disabled={creating}>
                    {creating ? 'Đang tạo...' : 'Tạo Short URL'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Đang tải...
            </div>
          ) : shortUrls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có short URL nào. Click "Tạo Short URL" để bắt đầu.
            </div>
          ) : (
            <div className="space-y-4">
              {shortUrls.map((shortUrl) => (
                <Card key={shortUrl.id}>
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      {/* Short URL */}
                      <div>
                        <Label className="text-xs text-muted-foreground">Short URL</Label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            value={getShortUrl(shortUrl.short_code)}
                            readOnly
                            className="font-mono text-sm"
                          />
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => copyToClipboard(getShortUrl(shortUrl.short_code), 'Short URL')}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => window.open(getShortUrl(shortUrl.short_code), '_blank')}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Original URL */}
                      <div>
                        <Label className="text-xs text-muted-foreground">URL Gốc</Label>
                        <div className="text-sm font-mono bg-muted p-2 rounded truncate">
                          {shortUrl.original_url}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{shortUrl.clicks} clicks</span>
                        <span>•</span>
                        <span>Tạo {formatDistanceToNow(new Date(shortUrl.created_at), { addSuffix: true, locale: vi })}</span>
                        {shortUrl.expires_at && (
                          <>
                            <span>•</span>
                            <span>Hết hạn {formatDistanceToNow(new Date(shortUrl.expires_at), { addSuffix: true, locale: vi })}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
