'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

interface Merchant {
  id: string;
  name: string;
  domain: string;
  logo_url?: string;
  platform: string;
  campaign_id: string;
  deep_link_base?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
}

interface MerchantDialogProps {
  merchant?: Merchant | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function MerchantDialog({ merchant, onClose, onSuccess }: MerchantDialogProps) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    logo_url: '',
    platform: 'accesstrade',
    campaign_id: '',
    deep_link_base: '',
    description: '',
    display_order: 0,
    is_active: true
  });

  const isEditMode = !!merchant;

  useEffect(() => {
    if (merchant) {
      setFormData({
        name: merchant.name || '',
        domain: merchant.domain || '',
        logo_url: merchant.logo_url || '',
        platform: merchant.platform || 'accesstrade',
        campaign_id: merchant.campaign_id || '',
        deep_link_base: merchant.deep_link_base || '',
        description: merchant.description || '',
        display_order: merchant.display_order || 0,
        is_active: merchant.is_active ?? true
      });
    } else {
      // Reset form for create mode
      setFormData({
        name: '',
        domain: '',
        logo_url: '',
        platform: 'accesstrade',
        campaign_id: '',
        deep_link_base: '',
        description: '',
        display_order: 0,
        is_active: true
      });
    }
  }, [merchant]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Tên merchant không được để trống',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.domain.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Domain không được để trống',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.campaign_id.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Campaign ID không được để trống',
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);

    try {
      const url = isEditMode
        ? `/api/admin/merchants/${merchant.id}`
        : '/api/admin/merchants';

      const method = isEditMode ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${isEditMode ? 'update' : 'create'} merchant`);
      }

      toast({
        title: 'Thành công',
        description: data.message || `Merchant đã được ${isEditMode ? 'cập nhật' : 'tạo'} thành công`
      });

      onSuccess();
      onClose();

    } catch (error) {
      console.error(`${isEditMode ? 'Update' : 'Create'} merchant error:`, error);
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : `Không thể ${isEditMode ? 'cập nhật' : 'tạo'} merchant`,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? 'Chỉnh Sửa Merchant' : 'Thêm Merchant Mới'}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Cập nhật thông tin merchant và campaign ID từ AccessTrade'
              : 'Thêm merchant mới với campaign ID từ AccessTrade để tạo tracking links'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">
                Tên Merchant <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="VD: Shopee, Lazada, Tiki..."
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="domain">
                Domain <span className="text-red-500">*</span>
              </Label>
              <Input
                id="domain"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                placeholder="VD: shopee.vn"
                required
              />
              <p className="text-sm text-muted-foreground">
                Domain để nhận diện merchant khi tạo tracking link
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="platform">
                Platform <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.platform}
                onValueChange={(value) => setFormData({ ...formData, platform: value })}
              >
                <SelectTrigger id="platform">
                  <SelectValue placeholder="Chọn platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accesstrade">AccessTrade</SelectItem>
                  <SelectItem value="isclix">iSclix</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="campaign_id">
                Campaign ID <span className="text-red-500">*</span>
              </Label>
              <Input
                id="campaign_id"
                value={formData.campaign_id}
                onChange={(e) => setFormData({ ...formData, campaign_id: e.target.value })}
                placeholder="VD: 12345"
                required
              />
              <p className="text-sm text-muted-foreground">
                Campaign ID từ AccessTrade dashboard
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="logo_url">Logo URL</Label>
              <Input
                id="logo_url"
                value={formData.logo_url}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="deep_link_base">Deep Link Base (Tùy chọn)</Label>
              <Input
                id="deep_link_base"
                value={formData.deep_link_base}
                onChange={(e) => setFormData({ ...formData, deep_link_base: e.target.value })}
                placeholder="https://go.isclix.com/deep_link/..."
              />
              <p className="text-sm text-muted-foreground">
                Override deeplink URL mặc định nếu merchant có deeplink riêng
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">Mô Tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Thông tin thêm về merchant..."
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="display_order">Thứ Tự Hiển Thị</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? 'Cập Nhật' : 'Tạo Merchant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
