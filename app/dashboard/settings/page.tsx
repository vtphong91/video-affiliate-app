'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Save, Eye, EyeOff, CheckCircle2, ExternalLink, Zap } from 'lucide-react';
import { useSettings } from '@/lib/contexts/settings-context';

export default function SettingsPage() {
  const { toast } = useToast();
  const { settings: savedSettings, updateSettings, isLoaded } = useSettings();

  const [showTokens, setShowTokens] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);

  const [settings, setSettings] = useState({
    youtubeApiKey: '',
    defaultAffiliatePlatform: '',
  });

  // Load settings from context when available
  useEffect(() => {
    if (isLoaded) {
      setSettings(savedSettings);
    }
  }, [isLoaded, savedSettings]);

  const handleTestWebhook = async () => {
    setIsTestingWebhook(true);

    try {
      // Call API route which will use server-side env variables
      const response = await fetch('/api/test-webhook', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Webhook test failed');
      }

      toast({
        title: '✅ Webhook hoạt động!',
        description: 'Make.com đã nhận được test request thành công',
      });
    } catch (error) {
      console.error('Webhook test error:', error);
      toast({
        title: 'Lỗi kết nối',
        description: error instanceof Error ? error.message : 'Không thể kết nối với Make.com webhook',
        variant: 'destructive',
      });
    } finally {
      setIsTestingWebhook(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      // Save to localStorage via context
      updateSettings(settings);

      toast({
        title: 'Đã lưu!',
        description: 'Cài đặt đã được cập nhật thành công',
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">Cài Đặt</h1>
        <p className="text-gray-600 mt-1">
          Cấu hình API keys và webhook URLs
        </p>
      </div>

      {/* YouTube Settings */}
      <Card>
        <CardHeader>
          <CardTitle>YouTube API</CardTitle>
          <CardDescription>
            Để lấy thông tin video từ YouTube, bạn cần YouTube Data API v3 key
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="youtube-api-key">YouTube API Key</Label>
            <div className="flex gap-2">
              <Input
                id="youtube-api-key"
                type={showTokens ? 'text' : 'password'}
                value={settings.youtubeApiKey}
                onChange={(e) =>
                  setSettings({ ...settings, youtubeApiKey: e.target.value })
                }
                placeholder="AIzaSy..."
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowTokens(!showTokens)}
              >
                {showTokens ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-gray-500">
              Lấy API key tại:{' '}
              <a
                href="https://console.cloud.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Google Cloud Console
              </a>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Make.com Integration */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-600" />
            Make.com Integration
          </CardTitle>
          <CardDescription>
            Sử dụng Make.com để tự động đăng bài lên Facebook, Twitter, LinkedIn và nhiều platform khác
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Security Notice */}
          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <p className="text-green-900 font-medium mb-2 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              🔒 Webhook được bảo mật trong file .env
            </p>
            <p className="text-sm text-green-800">
              Make.com Webhook URL và Secret đã được cấu hình trong file <code className="bg-green-200 px-1 rounded">.env.local</code> để bảo mật.
              Webhook credentials không được lưu trữ trong trình duyệt.
            </p>
          </div>

          {/* Configuration Info */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-sm">📝 Cấu hình trong .env.local:</h4>
            <pre className="text-xs bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto">
{`MAKECOM_WEBHOOK_URL=https://hook.eu2.make.com/...
MAKECOM_WEBHOOK_SECRET=your-secret-key`}
            </pre>
          </div>

          {/* Test Webhook Button */}
          <Button
            onClick={handleTestWebhook}
            disabled={isTestingWebhook}
            variant="outline"
            className="w-full border-purple-300 hover:bg-purple-50"
          >
            {isTestingWebhook ? (
              <>
                <Save className="mr-2 h-4 w-4 animate-spin" />
                Đang test...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Test Webhook
              </>
            )}
          </Button>

          {/* Setup Guide Link */}
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <p className="text-purple-900 font-medium mb-2">
              📚 Chưa setup Make.com?
            </p>
            <p className="text-sm text-purple-800 mb-3">
              Xem hướng dẫn chi tiết trong file MAKE_COM_SETUP.md
            </p>
            <a
              href="https://make.com/en/register"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="bg-white">
                <ExternalLink className="h-4 w-4 mr-2" />
                Đăng ký Make.com (Free)
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Affiliate Settings</CardTitle>
          <CardDescription>
            Cấu hình mặc định cho affiliate links
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="default-platform">Default Affiliate Platform</Label>
            <Input
              id="default-platform"
              value={settings.defaultAffiliatePlatform}
              onChange={(e) =>
                setSettings({ ...settings, defaultAffiliatePlatform: e.target.value })
              }
              placeholder="Shopee, Lazada, Tiki..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} size="lg">
          {isSaving ? (
            <>
              <Save className="mr-2 h-4 w-4 animate-spin" />
              Đang lưu...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Lưu Cài Đặt
            </>
          )}
        </Button>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-bold mb-2">📖 Tại sao dùng Make.com?</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
            <li>✅ Không cần Facebook API phức tạp</li>
            <li>✅ Không cần Access Token (Make.com quản lý)</li>
            <li>✅ Dễ dàng post lên nhiều platform (Facebook, Twitter, LinkedIn...)</li>
            <li>✅ Visual workflow - Drag & drop</li>
            <li>✅ Built-in error handling & retry</li>
            <li>✅ Free plan: 1000 operations/tháng</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
