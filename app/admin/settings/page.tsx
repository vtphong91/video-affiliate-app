'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Settings, 
  Save, 
  RefreshCw,
  Key,
  Globe,
  Database,
  Mail,
  Shield,
  AlertCircle,
  CheckCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '@/lib/auth/SupabaseAuthProvider';
import { useRoles } from '@/lib/auth/hooks/useEnhancedRoles';

interface SystemSetting {
  key: string;
  value: string;
  description: string;
  type: 'text' | 'password' | 'url' | 'number' | 'boolean';
  category: string;
  sensitive: boolean;
}

export default function SystemSettings() {
  const { userProfile } = useAuth();
  const { canManageSettings, canAccessAdmin } = useRoles();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // Mock settings data (in real app, this would come from API)
  const mockSettings: SystemSetting[] = [
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      value: 'https://your-project.supabase.co',
      description: 'URL của Supabase project',
      type: 'url',
      category: 'Database',
      sensitive: false
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      description: 'Supabase anonymous key',
      type: 'password',
      category: 'Database',
      sensitive: true
    },
    {
      key: 'SUPABASE_SERVICE_ROLE_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      description: 'Supabase service role key',
      type: 'password',
      category: 'Database',
      sensitive: true
    },
    {
      key: 'GOOGLE_AI_API_KEY',
      value: 'AIzaSyB...',
      description: 'Google AI API key cho Gemini',
      type: 'password',
      category: 'AI Services',
      sensitive: true
    },
    {
      key: 'OPENAI_API_KEY',
      value: 'sk-...',
      description: 'OpenAI API key',
      type: 'password',
      category: 'AI Services',
      sensitive: true
    },
    {
      key: 'ANTHROPIC_API_KEY',
      value: 'sk-ant-...',
      description: 'Anthropic Claude API key',
      type: 'password',
      category: 'AI Services',
      sensitive: true
    },
    {
      key: 'MAKECOM_WEBHOOK_URL',
      value: 'https://hook.eu1.make.com/...',
      description: 'Make.com webhook URL cho automation',
      type: 'url',
      category: 'Integrations',
      sensitive: false
    },
    {
      key: 'FACEBOOK_PAGE_ACCESS_TOKEN',
      value: 'EAA...',
      description: 'Facebook Page Access Token',
      type: 'password',
      category: 'Social Media',
      sensitive: true
    },
    {
      key: 'YOUTUBE_API_KEY',
      value: 'AIzaSyB...',
      description: 'YouTube Data API key',
      type: 'password',
      category: 'Social Media',
      sensitive: true
    },
    {
      key: 'CRON_SECRET',
      value: 'your-secret-key',
      description: 'Secret key cho cron jobs',
      type: 'password',
      category: 'Security',
      sensitive: true
    },
    {
      key: 'MAX_FILE_SIZE',
      value: '10485760',
      description: 'Kích thước file tối đa (bytes)',
      type: 'number',
      category: 'System',
      sensitive: false
    },
    {
      key: 'ENABLE_DEBUG_MODE',
      value: 'false',
      description: 'Bật chế độ debug',
      type: 'boolean',
      category: 'System',
      sensitive: false
    }
  ];

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      // In real app, fetch from API
      // const response = await fetch('/api/admin/settings');
      // const data = await response.json();
      
      // Mock data for now
      setSettings(mockSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      
      // In real app, save to API
      // const response = await fetch('/api/admin/settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(settings)
      // });

      // Mock success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Cài đặt đã được lưu thành công!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Có lỗi xảy ra khi lưu cài đặt');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: string, value: string) => {
    setSettings(prev => prev.map(setting => 
      setting.key === key ? { ...setting, value } : setting
    ));
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Database': return <Database className="h-4 w-4" />;
      case 'AI Services': return <Key className="h-4 w-4" />;
      case 'Integrations': return <Globe className="h-4 w-4" />;
      case 'Social Media': return <Mail className="h-4 w-4" />;
      case 'Security': return <Shield className="h-4 w-4" />;
      case 'System': return <Settings className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Database': return 'bg-blue-100 text-blue-800';
      case 'AI Services': return 'bg-purple-100 text-purple-800';
      case 'Integrations': return 'bg-green-100 text-green-800';
      case 'Social Media': return 'bg-pink-100 text-pink-800';
      case 'Security': return 'bg-red-100 text-red-800';
      case 'System': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const groupedSettings = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

  if (!canManageSettings() && !canAccessAdmin()) {
    return (
      <div className="text-center py-12">
        <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Không có quyền truy cập</h3>
        <p className="text-gray-500">Bạn cần quyền quản lý cài đặt để truy cập trang này.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
          <p className="text-gray-600">Quản lý cấu hình và biến môi trường</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={fetchSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Button onClick={handleSaveSettings} disabled={saving}>
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
          </Button>
        </div>
      </div>

      {/* Warning */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Cảnh báo quan trọng</h3>
              <p className="text-sm text-yellow-700 mt-1">
                Thay đổi cài đặt có thể ảnh hưởng đến hoạt động của hệ thống. 
                Vui lòng cẩn thận khi chỉnh sửa các giá trị nhạy cảm.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings by Category */}
      {loading ? (
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedSettings).map(([category, categorySettings]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <div className={`p-2 rounded-lg ${getCategoryColor(category)}`}>
                    {getCategoryIcon(category)}
                  </div>
                  <span>{category}</span>
                  <Badge variant="outline">
                    {categorySettings.length} cài đặt
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorySettings.map((setting) => (
                  <div key={setting.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700">
                        {setting.key}
                      </label>
                      <div className="flex items-center space-x-2">
                        {setting.sensitive && (
                          <Badge variant="destructive" className="text-xs">
                            Nhạy cảm
                          </Badge>
                        )}
                        <Badge variant="outline" className="text-xs">
                          {setting.type}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                    <div className="flex items-center space-x-2">
                      {setting.type === 'password' ? (
                        <div className="flex-1 relative">
                          <Input
                            type={showPasswords[setting.key] ? 'text' : 'password'}
                            value={setting.value}
                            onChange={(e) => updateSetting(setting.key, e.target.value)}
                            className="pr-10"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3"
                            onClick={() => togglePasswordVisibility(setting.key)}
                          >
                            {showPasswords[setting.key] ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      ) : setting.type === 'boolean' ? (
                        <select
                          value={setting.value}
                          onChange={(e) => updateSetting(setting.key, e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="true">Bật</option>
                          <option value="false">Tắt</option>
                        </select>
                      ) : (
                        <Input
                          type={setting.type === 'number' ? 'number' : 'text'}
                          value={setting.value}
                          onChange={(e) => updateSetting(setting.key, e.target.value)}
                          className="flex-1"
                        />
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span>Tóm tắt cài đặt</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{settings.length}</div>
              <div className="text-sm text-blue-800">Tổng cài đặt</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {settings.filter(s => s.sensitive).length}
              </div>
              <div className="text-sm text-red-800">Cài đặt nhạy cảm</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {Object.keys(groupedSettings).length}
              </div>
              <div className="text-sm text-green-800">Danh mục</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
