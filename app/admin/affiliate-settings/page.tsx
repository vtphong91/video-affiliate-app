'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Save, TestTube, CheckCircle, XCircle, AlertCircle, Plus, Edit, Trash, Power } from 'lucide-react';
import { MerchantDialog } from '@/components/admin/MerchantDialog';
import { AffiliateLinkTester } from '@/components/admin/AffiliateLinkTester';
import { ShortUrlManager } from '@/components/admin/ShortUrlManager';

interface AffiliateSettings {
  id: string;
  api_token?: string;
  api_url: string;
  link_mode: 'api' | 'deeplink';
  publisher_id?: string;
  deeplink_base_url: string;
  utm_source: string;
  utm_campaign: string;
  is_active: boolean;
  last_tested_at?: string;
  test_status?: 'success' | 'failed' | 'pending';
  test_message?: string;
  has_api_token?: boolean;
  has_publisher_id?: boolean;
}

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

export default function AffiliateSettingsPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('api');

  // API Settings State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [settings, setSettings] = useState<AffiliateSettings | null>(null);
  const [editingToken, setEditingToken] = useState(false); // State to track if editing token
  const [formData, setFormData] = useState({
    api_token: '',
    api_url: 'https://api.accesstrade.vn/v1',
    link_mode: 'api' as 'api' | 'deeplink',
    publisher_id: '4790392958945222748',
    utm_source: 'video-affiliate',
    utm_campaign: 'review'
  });

  // Merchants State
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [merchantsLoading, setMerchantsLoading] = useState(false);
  const [showMerchantDialog, setShowMerchantDialog] = useState(false);
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);

  useEffect(() => {
    loadSettings();
    loadMerchants();
  }, []);

  // ==========================================================================
  // API SETTINGS FUNCTIONS
  // ==========================================================================

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/affiliate-settings', {
        credentials: 'include' // Send cookies with request
      });
      const data = await response.json();

      if (data.success) {
        setSettings(data.data);
        setFormData({
          api_token: '', // Always empty for security - backend masks the real token
          api_url: data.data.api_url,
          link_mode: data.data.link_mode,
          // Don't set publisher_id if it's masked - keep it empty for read-only field
          publisher_id: data.data.has_publisher_id ? '' : (data.data.publisher_id || '4790392958945222748'),
          utm_source: data.data.utm_source,
          utm_campaign: data.data.utm_campaign
        });
      } else {
        toast({
          title: 'Lỗi',
          description: data.error || 'Không thể tải cấu hình',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Load settings error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể kết nối server',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('💾 Saving settings...');

      // Validate: If editing token but no new value entered, show error
      if (editingToken && formData.api_token.trim() === '') {
        toast({
          title: '⚠️ Vui lòng nhập API Token',
          description: 'Bạn đã nhấn "Sửa" nhưng chưa nhập token mới. Vui lòng nhập token hoặc hủy bỏ.',
          variant: 'destructive'
        });
        setSaving(false);
        return;
      }

      // Only include fields with new values
      const dataToSend: any = {
        api_url: formData.api_url,
        link_mode: formData.link_mode,
        utm_source: formData.utm_source,
        utm_campaign: formData.utm_campaign
      };

      // Only include api_token if user entered a new value
      if (formData.api_token.trim() !== '') {
        dataToSend.api_token = formData.api_token;
      }

      // Only include publisher_id if user entered a new value (not already configured)
      if (!settings?.has_publisher_id && formData.publisher_id.trim() !== '') {
        dataToSend.publisher_id = formData.publisher_id;
      }

      const response = await fetch('/api/admin/affiliate-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Important: Send cookies with request
        body: JSON.stringify(dataToSend)
      });

      const data = await response.json();
      console.log('💾 Save response:', data);

      if (data.success) {
        setSettings(data.data);
        // Reset api_token field and editing state after save (security)
        setFormData({ ...formData, api_token: '' });
        setEditingToken(false);

        toast({
          title: '✅ Lưu thành công',
          description: data.message || 'Cấu hình đã được cập nhật'
        });
      } else {
        toast({
          title: '❌ Lỗi lưu cấu hình',
          description: data.error || 'Không thể lưu cấu hình',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Save settings error:', error);
      toast({
        title: '❌ Lỗi',
        description: error instanceof Error ? error.message : 'Không thể lưu cấu hình',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestApi = async () => {
    // Use current token if available, otherwise require user to enter new token
    const tokenToTest = formData.api_token.trim() !== '' ? formData.api_token : (settings?.has_api_token ? 'USE_EXISTING' : '');

    if (!tokenToTest) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng nhập API Token',
        variant: 'destructive'
      });
      return;
    }

    try {
      setTesting(true);
      console.log('🧪 Testing API connection...');

      const response = await fetch('/api/admin/affiliate-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Send cookies with request
        body: JSON.stringify({
          api_token: tokenToTest,
          api_url: formData.api_url
        })
      });

      console.log('🧪 Response status:', response.status);
      const data = await response.json();
      console.log('🧪 Response data:', data);

      if (data.success) {
        toast({
          title: '✅ Kết nối thành công',
          description: data.message || 'API AccessTrade hoạt động tốt'
        });
        // Reload to get updated test status
        await loadSettings();
      } else {
        toast({
          title: '❌ Kết nối thất bại',
          description: data.message || data.error || 'Không thể kết nối tới AccessTrade API',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Test API error:', error);
      toast({
        title: '❌ Lỗi',
        description: error instanceof Error ? error.message : 'Không thể test kết nối API',
        variant: 'destructive'
      });
    } finally {
      setTesting(false);
    }
  };

  // ==========================================================================
  // MERCHANTS FUNCTIONS
  // ==========================================================================

  const loadMerchants = async () => {
    try {
      setMerchantsLoading(true);
      const response = await fetch('/api/admin/merchants', {
        credentials: 'include' // Send cookies with request
      });
      const data = await response.json();

      if (data.success) {
        setMerchants(data.data);
      } else {
        toast({
          title: 'Lỗi',
          description: 'Không thể tải danh sách merchants',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Load merchants error:', error);
    } finally {
      setMerchantsLoading(false);
    }
  };

  const handleAddMerchant = () => {
    setEditingMerchant(null);
    setShowMerchantDialog(true);
  };

  const handleEditMerchant = (merchant: Merchant) => {
    setEditingMerchant(merchant);
    setShowMerchantDialog(true);
  };

  const handleDeleteMerchant = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa merchant này?')) return;

    try {
      const response = await fetch(`/api/admin/merchants/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Thành công',
          description: 'Đã xóa merchant'
        });
        loadMerchants();
      } else {
        toast({
          title: 'Lỗi',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Delete merchant error:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa merchant',
        variant: 'destructive'
      });
    }
  };

  const handleToggleActive = async (merchant: Merchant) => {
    try {
      const response = await fetch(`/api/admin/merchants/${merchant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ is_active: !merchant.is_active })
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: 'Thành công',
          description: `Đã ${merchant.is_active ? 'tắt' : 'bật'} merchant`
        });
        loadMerchants();
      } else {
        toast({
          title: 'Lỗi',
          description: data.error,
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Toggle merchant error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Cấu Hình Affiliate</h1>
        <p className="text-gray-600 mt-2">
          Cấu hình AccessTrade API và quản lý merchants
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full max-w-4xl grid-cols-4">
          <TabsTrigger value="api">Cấu Hình API</TabsTrigger>
          <TabsTrigger value="merchants">Merchants ({merchants.length})</TabsTrigger>
          <TabsTrigger value="test-link">Test Link</TabsTrigger>
          <TabsTrigger value="short-urls">Short URLs</TabsTrigger>
        </TabsList>

        {/* ============================================================ */}
        {/* TAB 1: API SETTINGS */}
        {/* ============================================================ */}
        <TabsContent value="api" className="space-y-6">
          {/* Current Status */}
          {settings && (
            <Card>
              <CardHeader>
                <CardTitle>Trạng Thái Hệ Thống</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Chế độ tạo link:</span>
                  <span className="text-sm">
                    {settings.link_mode === 'api' ? (
                      <span className="text-blue-600 font-semibold">API Mode</span>
                    ) : (
                      <span className="text-orange-600 font-semibold">Deeplink Mode</span>
                    )}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">API Token:</span>
                  <span className="text-sm">
                    {settings.has_api_token ? (
                      <span className="text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-4 h-4" />
                        Đã cấu hình
                      </span>
                    ) : (
                      <span className="text-gray-500 flex items-center gap-1">
                        <XCircle className="w-4 h-4" />
                        Chưa cấu hình
                      </span>
                    )}
                  </span>
                </div>

                {settings.last_tested_at && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Test API:</span>
                    <span className="text-sm flex items-center gap-1">
                      {settings.test_status === 'success' ? (
                        <>
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-green-600">Thành công</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-600">Thất bại</span>
                        </>
                      )}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Configuration Form */}
          <Card>
            <CardHeader>
              <CardTitle>Cấu Hình API</CardTitle>
              <CardDescription>
                API Mode (ưu tiên) → Deeplink Mode (backup khi API lỗi)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Link Mode */}
              <div>
                <Label>Chế Độ Tạo Link</Label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="mode_api"
                      value="api"
                      checked={formData.link_mode === 'api'}
                      onChange={(e) => setFormData({ ...formData, link_mode: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="mode_api" className="text-sm cursor-pointer">
                      <span className="font-medium">API Mode</span> - AccessTrade API (tracking tốt hơn)
                    </label>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      id="mode_deeplink"
                      value="deeplink"
                      checked={formData.link_mode === 'deeplink'}
                      onChange={(e) => setFormData({ ...formData, link_mode: e.target.value as any })}
                      className="w-4 h-4"
                    />
                    <label htmlFor="mode_deeplink" className="text-sm cursor-pointer">
                      <span className="font-medium">Deeplink Mode</span> - Thủ công (backup)
                    </label>
                  </div>
                </div>
              </div>

              {/* API URL */}
              <div>
                <Label htmlFor="api_url">API URL</Label>
                <Input
                  id="api_url"
                  value={formData.api_url}
                  onChange={(e) => setFormData({ ...formData, api_url: e.target.value })}
                />
              </div>

              {/* API Token */}
              <div>
                <Label htmlFor="api_token">API Token</Label>
                <div className="relative">
                  <Input
                    id="api_token"
                    type={settings?.has_api_token && !editingToken ? "text" : "password"}
                    value={settings?.has_api_token && !editingToken ? "••••••••••••••••" : formData.api_token}
                    onChange={(e) => setFormData({ ...formData, api_token: e.target.value })}
                    placeholder="Nhập API token"
                    disabled={settings?.has_api_token && !editingToken}
                    className={settings?.has_api_token && !editingToken ? "bg-gray-50 cursor-not-allowed pr-20" : ""}
                  />
                  {settings?.has_api_token && !editingToken && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="absolute right-1 top-1 h-7 text-xs"
                      onClick={() => setEditingToken(true)}
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Sửa
                    </Button>
                  )}
                </div>
                {settings?.has_api_token && !editingToken ? (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-green-600">
                      Token đã được cấu hình và mã hóa. Nhấn "Sửa" để thay đổi.
                    </p>
                  </div>
                ) : editingToken || formData.api_token !== '' ? (
                  <p className="text-xs text-blue-600 mt-1">
                    {editingToken && formData.api_token === '' ? 'Nhập token mới và nhấn "Lưu" để cập nhật' : 'Token mới sẽ được mã hóa và lưu khi bạn nhấn "Lưu"'}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập token để kích hoạt API Mode
                  </p>
                )}
              </div>

              {/* Test Button */}
              <Button
                onClick={handleTestApi}
                disabled={testing || (!formData.api_token && !settings?.has_api_token)}
                variant="outline"
                className="w-full"
              >
                {testing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Đang test...
                  </>
                ) : (
                  <>
                    <TestTube className="w-4 h-4 mr-2" />
                    Test Kết Nối
                  </>
                )}
              </Button>
              {!formData.api_token && !settings?.has_api_token && (
                <p className="text-xs text-amber-600 -mt-4">
                  ⚠️ Nhập API Token vào ô bên trên để test kết nối
                </p>
              )}

              <hr />

              {/* Publisher ID */}
              <div>
                <Label htmlFor="publisher_id">Publisher ID</Label>
                <Input
                  id="publisher_id"
                  type="text"
                  value={formData.publisher_id}
                  onChange={(e) => setFormData({ ...formData, publisher_id: e.target.value })}
                  placeholder={settings?.has_publisher_id ? "***************" : "Nhập Publisher ID"}
                  disabled={settings?.has_publisher_id}
                  className={settings?.has_publisher_id ? "bg-gray-50 cursor-not-allowed" : ""}
                />
                {settings?.has_publisher_id ? (
                  <div className="flex items-center gap-2 mt-1">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-green-600">
                      Publisher ID đã được cấu hình và mã hóa.
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">
                    Nhập Publisher ID để tạo deeplink
                  </p>
                )}
              </div>

              {/* UTM Params */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>UTM Source</Label>
                  <Input
                    value={formData.utm_source}
                    onChange={(e) => setFormData({ ...formData, utm_source: e.target.value })}
                  />
                </div>
                <div>
                  <Label>UTM Campaign</Label>
                  <Input
                    value={formData.utm_campaign}
                    onChange={(e) => setFormData({ ...formData, utm_campaign: e.target.value })}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={loadSettings}>Hủy</Button>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Lưu
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 2: MERCHANTS */}
        {/* ============================================================ */}
        <TabsContent value="merchants" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Danh Sách Merchants</CardTitle>
                  <CardDescription>
                    Quản lý merchants để tạo affiliate links
                  </CardDescription>
                </div>
                <Button onClick={handleAddMerchant}>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm Merchant
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {merchantsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : merchants.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Chưa có merchant nào. Click "Thêm Merchant" để thêm.
                </div>
              ) : (
                <div className="space-y-3">
                  {merchants.map((merchant) => (
                    <div
                      key={merchant.id}
                      className={`border rounded-lg p-4 ${
                        !merchant.is_active ? 'bg-gray-50 opacity-60' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {merchant.logo_url && (
                            <img
                              src={merchant.logo_url}
                              alt={merchant.name}
                              className="w-12 h-12 rounded object-contain"
                            />
                          )}
                          <div>
                            <h4 className="font-semibold">{merchant.name}</h4>
                            <p className="text-sm text-gray-600">{merchant.domain}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Campaign ID: {merchant.campaign_id}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleToggleActive(merchant)}
                            title={merchant.is_active ? 'Tắt' : 'Bật'}
                          >
                            <Power
                              className={`w-4 h-4 ${
                                merchant.is_active ? 'text-green-600' : 'text-gray-400'
                              }`}
                            />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditMerchant(merchant)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteMerchant(merchant.id)}
                          >
                            <Trash className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 3: TEST LINK */}
        {/* ============================================================ */}
        <TabsContent value="test-link" className="space-y-6">
          <AffiliateLinkTester />
        </TabsContent>

        {/* ============================================================ */}
        {/* TAB 4: SHORT URLS */}
        {/* ============================================================ */}
        <TabsContent value="short-urls" className="space-y-6">
          <ShortUrlManager />
        </TabsContent>
      </Tabs>

      {/* Merchant Dialog */}
      {showMerchantDialog && (
        <MerchantDialog
          merchant={editingMerchant}
          onClose={() => setShowMerchantDialog(false)}
          onSuccess={() => {
            setShowMerchantDialog(false);
            loadMerchants();
          }}
        />
      )}
    </div>
  );
}
