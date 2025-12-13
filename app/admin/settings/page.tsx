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
  EyeOff,
  Plus,
  Trash2,
  Edit,
  Brain
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

interface AIProvider {
  id?: string;
  provider_name: string;
  display_name: string;
  provider_type: 'free' | 'cheap' | 'paid';
  is_enabled: boolean;
  priority_order: number;
  api_key_configured: boolean;
  cost_per_million_tokens?: number;
  tokens_per_second?: number;
  free_tier_limit?: number;
  context_window?: number;
  base_url?: string;
  model_name?: string;
  api_key_env_var?: string;
}

export default function SystemSettings() {
  const { userProfile } = useAuth();
  const { canManageSettings, canAccessAdmin } = useRoles();
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  // AI Provider states
  const [aiProviders, setAiProviders] = useState<AIProvider[]>([]);
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [newProvider, setNewProvider] = useState<Partial<AIProvider>>({
    provider_type: 'free',
    priority_order: 999,
    cost_per_million_tokens: 0,
    tokens_per_second: 0,
    free_tier_limit: 0,
    context_window: 0
  });

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
    fetchAIProviders();
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

  const fetchAIProviders = async () => {
    try {
      const response = await fetch('/api/admin/settings/ai-providers');
      const data = await response.json();

      if (data.success) {
        setAiProviders(data.providers || []);
      }
    } catch (error) {
      console.error('Error fetching AI providers:', error);
    }
  };

  const handleAddProvider = async () => {
    try {
      if (!newProvider.provider_name || !newProvider.display_name) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const response = await fetch('/api/admin/settings/ai-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider)
      });

      const data = await response.json();

      if (data.success) {
        alert('Thêm AI provider thành công!');
        setShowAddProviderModal(false);
        setNewProvider({
          provider_type: 'free',
          priority_order: 999,
          cost_per_million_tokens: 0,
          tokens_per_second: 0,
          free_tier_limit: 0,
          context_window: 0
        });
        fetchAIProviders();
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Error adding provider:', error);
      alert('Có lỗi xảy ra khi thêm provider');
    }
  };

  const handleDeleteProvider = async (providerName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa provider "${providerName}"?`)) {
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/settings/ai-providers?provider_name=${providerName}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (data.success) {
        alert('Xóa provider thành công!');
        fetchAIProviders();
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      alert('Có lỗi xảy ra khi xóa provider');
    }
  };

  const handleToggleProvider = async (providerName: string, currentEnabled: boolean) => {
    try {
      const response = await fetch('/api/admin/settings/ai-providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_name: providerName,
          updates: { is_enabled: !currentEnabled }
        })
      });

      const data = await response.json();

      if (data.success) {
        fetchAIProviders();
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Error toggling provider:', error);
      alert('Có lỗi xảy ra');
    }
  };

  const handleEditProvider = (provider: AIProvider) => {
    setEditingProvider(provider);
    setNewProvider({
      provider_name: provider.provider_name,
      display_name: provider.display_name,
      provider_type: provider.provider_type,
      priority_order: provider.priority_order,
      cost_per_million_tokens: provider.cost_per_million_tokens || 0,
      tokens_per_second: provider.tokens_per_second || 0,
      free_tier_limit: provider.free_tier_limit || 0,
      context_window: provider.context_window || 0,
      base_url: provider.base_url || '',
      model_name: provider.model_name || '',
      api_key_env_var: provider.api_key_env_var || ''
    });
    setShowAddProviderModal(true);
  };

  const handleUpdateProvider = async () => {
    try {
      if (!editingProvider || !newProvider.provider_name || !newProvider.display_name) {
        alert('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      const response = await fetch('/api/admin/settings/ai-providers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_name: editingProvider.provider_name,
          updates: {
            display_name: newProvider.display_name,
            provider_type: newProvider.provider_type,
            priority_order: newProvider.priority_order,
            cost_per_million_tokens: newProvider.cost_per_million_tokens,
            tokens_per_second: newProvider.tokens_per_second,
            free_tier_limit: newProvider.free_tier_limit,
            context_window: newProvider.context_window
          },
          metadata: {
            base_url: newProvider.base_url,
            model_name: newProvider.model_name,
            api_key_env_var: newProvider.api_key_env_var
          }
        })
      });

      const data = await response.json();

      if (data.success) {
        alert('Cập nhật AI provider thành công!');
        setShowAddProviderModal(false);
        setEditingProvider(null);
        setNewProvider({
          provider_type: 'free',
          priority_order: 999,
          cost_per_million_tokens: 0,
          tokens_per_second: 0,
          free_tier_limit: 0,
          context_window: 0
        });
        fetchAIProviders();
      } else {
        alert(`Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      alert('Có lỗi xảy ra khi cập nhật provider');
    }
  };

  const handleCancelEdit = () => {
    setShowAddProviderModal(false);
    setEditingProvider(null);
    setNewProvider({
      provider_type: 'free',
      priority_order: 999,
      cost_per_million_tokens: 0,
      tokens_per_second: 0,
      free_tier_limit: 0,
      context_window: 0
    });
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

      {/* AI Provider Management */}
      <Card className="border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                <Brain className="h-5 w-5" />
              </div>
              <span>Quản lý AI Providers</span>
              <Badge variant="outline" className="bg-purple-50">
                {aiProviders.length} providers
              </Badge>
            </CardTitle>
            <Button
              onClick={() => setShowAddProviderModal(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Thêm AI Provider
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {aiProviders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Brain className="h-12 w-12 mx-auto mb-2 text-gray-400" />
              <p>Chưa có AI provider nào. Thêm provider đầu tiên!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {aiProviders.map((provider) => (
                <div
                  key={provider.provider_name}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                        <span>{provider.display_name}</span>
                        {provider.is_enabled ? (
                          <Badge className="bg-green-100 text-green-800 text-xs">
                            Đang hoạt động
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Tắt
                          </Badge>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">{provider.provider_name}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditProvider(provider)}
                        title="Chỉnh sửa"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleProvider(provider.provider_name, provider.is_enabled)}
                        title={provider.is_enabled ? 'Tắt' : 'Bật'}
                      >
                        {provider.is_enabled ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteProvider(provider.provider_name)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Loại:</span>
                      <Badge
                        className={
                          provider.provider_type === 'free'
                            ? 'bg-green-100 text-green-800'
                            : provider.provider_type === 'cheap'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-orange-100 text-orange-800'
                        }
                      >
                        {provider.provider_type === 'free'
                          ? 'MIỄN PHÍ'
                          : provider.provider_type === 'cheap'
                          ? 'RẺ'
                          : 'TRƯỚC PHÍ'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Thứ tự ưu tiên:</span>
                      <span className="font-medium">#{provider.priority_order}</span>
                    </div>
                    {provider.cost_per_million_tokens !== undefined && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Chi phí:</span>
                        <span className="font-medium">
                          ${provider.cost_per_million_tokens}/1M tokens
                        </span>
                      </div>
                    )}
                    {provider.tokens_per_second !== undefined && provider.tokens_per_second > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Tốc độ:</span>
                        <span className="font-medium">{provider.tokens_per_second} tokens/s</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">API Key:</span>
                      {provider.api_key_configured ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Đã cấu hình
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Chưa cấu hình
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Provider Modal */}
      {showAddProviderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {editingProvider ? 'Chỉnh sửa AI Provider' : 'Thêm AI Provider Mới'}
              </h2>
              <Button
                variant="ghost"
                onClick={handleCancelEdit}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider Name * <span className="text-gray-500">(e.g., deepseek, cohere)</span>
                  </label>
                  <Input
                    value={newProvider.provider_name || ''}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, provider_name: e.target.value })
                    }
                    placeholder="deepseek"
                    disabled={!!editingProvider}
                    className={editingProvider ? 'bg-gray-100 cursor-not-allowed' : ''}
                  />
                  {editingProvider && (
                    <p className="text-xs text-gray-500 mt-1">
                      Provider name không thể thay đổi
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name * <span className="text-gray-500">(e.g., DeepSeek V3)</span>
                  </label>
                  <Input
                    value={newProvider.display_name || ''}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, display_name: e.target.value })
                    }
                    placeholder="DeepSeek V3 (685B)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provider Type *
                  </label>
                  <select
                    value={newProvider.provider_type}
                    onChange={(e) =>
                      setNewProvider({
                        ...newProvider,
                        provider_type: e.target.value as 'free' | 'cheap' | 'paid'
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="free">Free (Miễn phí)</option>
                    <option value="cheap">Cheap (Rẻ)</option>
                    <option value="paid">Paid (Trả phí)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority Order
                  </label>
                  <Input
                    type="number"
                    value={newProvider.priority_order}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, priority_order: parseInt(e.target.value) })
                    }
                    placeholder="999"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key Environment Variable <span className="text-gray-500">(e.g., DEEPSEEK_API_KEY)</span>
                  </label>
                  <Input
                    value={newProvider.api_key_env_var || ''}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, api_key_env_var: e.target.value })
                    }
                    placeholder="DEEPSEEK_API_KEY"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Model Name <span className="text-gray-500">(e.g., deepseek-chat)</span>
                  </label>
                  <Input
                    value={newProvider.model_name || ''}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, model_name: e.target.value })
                    }
                    placeholder="deepseek-chat"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base URL <span className="text-gray-500">(e.g., https://api.deepseek.com)</span>
                </label>
                <Input
                  value={newProvider.base_url || ''}
                  onChange={(e) =>
                    setNewProvider({ ...newProvider, base_url: e.target.value })
                  }
                  placeholder="https://api.deepseek.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost per Million Tokens ($)
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newProvider.cost_per_million_tokens}
                    onChange={(e) =>
                      setNewProvider({
                        ...newProvider,
                        cost_per_million_tokens: parseFloat(e.target.value)
                      })
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tokens per Second
                  </label>
                  <Input
                    type="number"
                    value={newProvider.tokens_per_second}
                    onChange={(e) =>
                      setNewProvider({
                        ...newProvider,
                        tokens_per_second: parseInt(e.target.value)
                      })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Free Tier Limit
                  </label>
                  <Input
                    type="number"
                    value={newProvider.free_tier_limit}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, free_tier_limit: parseInt(e.target.value) })
                    }
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Context Window
                  </label>
                  <Input
                    type="number"
                    value={newProvider.context_window}
                    onChange={(e) =>
                      setNewProvider({ ...newProvider, context_window: parseInt(e.target.value) })
                    }
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                >
                  Hủy
                </Button>
                <Button
                  onClick={editingProvider ? handleUpdateProvider : handleAddProvider}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {editingProvider ? (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Cập nhật Provider
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm Provider
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
