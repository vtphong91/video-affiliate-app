'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/components/ui/use-toast';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Settings2,
  TrendingUp,
  Zap,
  DollarSign,
  Clock,
  BarChart3,
  Brain,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react';

// AI Provider interface for monitoring (current tab)
interface AIProviderStats {
  provider_name: string;
  display_name: string;
  provider_type: 'free' | 'cheap' | 'paid';
  is_enabled: boolean;
  api_key_configured: boolean;
  can_enable: boolean;
  priority_order: number;
  cost_per_million_tokens: number;
  tokens_per_second: number;
  free_tier_limit: number;
  context_window: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  success_rate_percent: number;
  avg_response_time_ms: number;
  total_tokens_used: number;
  total_cost: number;
  last_success_at: string | null;
  last_failure_at: string | null;
  last_error_message: string | null;
}

// AI Provider interface for management (new tab from settings)
interface AIProviderManage {
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

interface Summary {
  total: number;
  enabled: number;
  configured: number;
  free: number;
  cheap: number;
  paid: number;
}

export default function AISettingsPage() {
  // Stats tab states
  const [providersStats, setProvidersStats] = useState<AIProviderStats[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  // Manage tab states (from /admin/settings)
  const [providersManage, setProvidersManage] = useState<AIProviderManage[]>([]);
  const [loadingManage, setLoadingManage] = useState(true);
  const [showAddProviderModal, setShowAddProviderModal] = useState(false);
  const [editingProvider, setEditingProvider] = useState<AIProviderManage | null>(null);
  const [newProvider, setNewProvider] = useState<Partial<AIProviderManage>>({
    provider_type: 'free',
    priority_order: 999,
    cost_per_million_tokens: 0,
    tokens_per_second: 0,
    free_tier_limit: 0,
    context_window: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchProvidersStats();
    // No longer need separate fetch - both tabs use same data
  }, []);

  // ==================== STATS TAB FUNCTIONS ====================
  const fetchProvidersStats = async () => {
    try {
      setLoadingStats(true);
      setLoadingManage(true); // Also set loading for Manage tab
      const response = await fetch('/api/admin/ai-settings');
      const result = await response.json();

      if (result.success) {
        // Populate BOTH tabs with same data
        setProvidersStats(result.data.providers);
        setProvidersManage(result.data.providers); // ✅ NEW: Reuse same data
        setSummary(result.data.summary);
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message || 'Không thể tải cấu hình AI',
        variant: 'destructive',
      });
    } finally {
      setLoadingStats(false);
      setLoadingManage(false); // Also clear loading for Manage tab
    }
  };

  const testProvider = async (providerName: string) => {
    try {
      setTesting(providerName);
      const response = await fetch('/api/admin/ai-settings/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider_name: providerName }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '✅ Test thành công!',
          description: result.message,
        });
      } else {
        toast({
          title: '❌ Test thất bại',
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setTesting(null);
      fetchProvidersStats();
    }
  };

  const toggleProviderStats = async (providerName: string, currentlyEnabled: boolean) => {
    try {
      const response = await fetch('/api/admin/ai-settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_name: providerName,
          updates: { is_enabled: !currentlyEnabled },
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast({
          title: '✅ Đã cập nhật',
          description: `${providerName} đã được ${!currentlyEnabled ? 'bật' : 'tắt'}`,
        });
        fetchProvidersStats(); // This now updates both tabs
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: '❌ Lỗi',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // ==================== MANAGE TAB FUNCTIONS ====================
  const fetchProvidersManage = async () => {
    try {
      setLoadingManage(true);
      const response = await fetch('/api/admin/settings/ai-providers');
      const data = await response.json();

      if (data.success) {
        setProvidersManage(data.providers || []);
      }
    } catch (error) {
      console.error('Error fetching AI providers:', error);
    } finally {
      setLoadingManage(false);
    }
  };

  const handleAddProvider = async () => {
    try {
      if (!newProvider.provider_name || !newProvider.display_name) {
        toast({
          title: '❌ Lỗi',
          description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch('/api/admin/settings/ai-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProvider)
      });

      const data = await response.json();

      if (data.success) {
        toast({
          title: '✅ Thành công',
          description: 'Thêm AI provider thành công!',
        });
        setShowAddProviderModal(false);
        setNewProvider({
          provider_type: 'free',
          priority_order: 999,
          cost_per_million_tokens: 0,
          tokens_per_second: 0,
          free_tier_limit: 0,
          context_window: 0
        });
        fetchProvidersStats(); // This now updates both tabs
      } else {
        toast({
          title: '❌ Lỗi',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error adding provider:', error);
      toast({
        title: '❌ Lỗi',
        description: 'Có lỗi xảy ra khi thêm provider',
        variant: 'destructive',
      });
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
        toast({
          title: '✅ Thành công',
          description: 'Xóa provider thành công!',
        });
        fetchProvidersStats(); // This now updates both tabs
      } else {
        toast({
          title: '❌ Lỗi',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error deleting provider:', error);
      toast({
        title: '❌ Lỗi',
        description: 'Có lỗi xảy ra khi xóa provider',
        variant: 'destructive',
      });
    }
  };

  const handleToggleProviderManage = async (providerName: string, currentEnabled: boolean) => {
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
        toast({
          title: '✅ Thành công',
          description: `${providerName} đã được ${!currentEnabled ? 'bật' : 'tắt'}`,
        });
        fetchProvidersStats(); // This now updates both tabs
      } else {
        toast({
          title: '❌ Lỗi',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error toggling provider:', error);
      toast({
        title: '❌ Lỗi',
        description: 'Có lỗi xảy ra',
        variant: 'destructive',
      });
    }
  };

  const handleEditProvider = (provider: AIProviderManage) => {
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
        toast({
          title: '❌ Lỗi',
          description: 'Vui lòng điền đầy đủ thông tin bắt buộc',
          variant: 'destructive',
        });
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
        toast({
          title: '✅ Thành công',
          description: 'Cập nhật AI provider thành công!',
        });
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
        fetchProvidersStats(); // This now updates both tabs
      } else {
        toast({
          title: '❌ Lỗi',
          description: data.error,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating provider:', error);
      toast({
        title: '❌ Lỗi',
        description: 'Có lỗi xảy ra khi cập nhật provider',
        variant: 'destructive',
      });
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

  // ==================== UTILITY FUNCTIONS ====================
  const getProviderTypeColor = (type: string) => {
    switch (type) {
      case 'free':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'cheap':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'paid':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getProviderTypeIcon = (type: string) => {
    switch (type) {
      case 'free':
        return '🆓';
      case 'cheap':
        return '💰';
      case 'paid':
        return '💳';
      default:
        return '❓';
    }
  };

  const formatCost = (cost: number | undefined | null) => {
    if (!cost || cost === 0) return 'FREE';
    return `$${cost.toFixed(2)}/1M`;
  };

  const formatNumber = (num: number | undefined | null) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (loadingStats && loadingManage) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                <Settings2 className="h-8 w-8" />
                AI Provider Settings
              </h1>
              <p className="text-gray-600 mt-2">
                Quản lý cấu hình, theo dõi hiệu suất và CRUD AI providers
              </p>
            </div>
            <Button
              onClick={() => {
                fetchProvidersStats();
                fetchProvidersManage();
              }}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="monitor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
            <TabsTrigger value="monitor" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Monitor & Test</span>
              <Badge variant="outline" className="ml-1 bg-blue-50 text-blue-700 border-blue-200">
                {providersStats.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Manage Providers</span>
              <Badge variant="outline" className="ml-1 bg-purple-50 text-purple-700 border-purple-200">
                {providersManage.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Monitor & Test */}
          <TabsContent value="monitor" className="space-y-6">
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Tổng Providers
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{summary.total}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      {summary.enabled} đang hoạt động
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      API Keys Configured
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{summary.configured}</div>
                    <p className="text-xs text-gray-500 mt-1">
                      {summary.total - summary.configured} chưa cấu hình
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-gray-600">
                      Provider Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 items-center">
                      <Badge className="bg-green-100 text-green-800">
                        🆓 {summary.free} Free
                      </Badge>
                      <Badge className="bg-blue-100 text-blue-800">
                        💰 {summary.cheap} Cheap
                      </Badge>
                      <Badge className="bg-orange-100 text-orange-800">
                        💳 {summary.paid} Paid
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Provider Cards with Stats */}
            <div className="grid grid-cols-1 gap-6">
              {providersStats.map((provider) => (
                <Card key={provider.provider_name} className="overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <CardTitle className="text-xl">
                            {provider.display_name}
                          </CardTitle>
                          <Badge className={getProviderTypeColor(provider.provider_type)}>
                            {getProviderTypeIcon(provider.provider_type)}{' '}
                            {provider.provider_type.toUpperCase()}
                          </Badge>
                          {provider.is_enabled ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Enabled
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-800">
                              <XCircle className="h-3 w-3 mr-1" />
                              Disabled
                            </Badge>
                          )}
                          {!provider.api_key_configured && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              No API Key
                            </Badge>
                          )}
                        </div>
                        <CardDescription>
                          Priority: #{provider.priority_order} | Provider ID:{' '}
                          {provider.provider_name}
                        </CardDescription>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => testProvider(provider.provider_name)}
                          disabled={!provider.api_key_configured || testing !== null}
                          className="flex items-center gap-1"
                          title="Test provider connection"
                        >
                          {testing === provider.provider_name ? (
                            <>
                              <RefreshCw className="h-3 w-3 animate-spin" />
                              Testing...
                            </>
                          ) : (
                            <>
                              <Play className="h-3 w-3" />
                              Test
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            // Use provider from current tab (Monitor & Test)
                            handleEditProvider(provider);
                          }}
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          title="Edit provider"
                        >
                          <Edit className="h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteProvider(provider.provider_name)}
                          className="flex items-center gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete provider"
                        >
                          <Trash2 className="h-3 w-3" />
                          Delete
                        </Button>
                        <Button
                          size="sm"
                          variant={provider.is_enabled ? 'destructive' : 'default'}
                          onClick={() =>
                            toggleProviderStats(provider.provider_name, provider.is_enabled)
                          }
                          disabled={!provider.can_enable}
                          title={provider.is_enabled ? 'Disable provider' : 'Enable provider'}
                        >
                          {provider.is_enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Cost</div>
                          <div className="font-semibold">
                            {formatCost(provider.cost_per_million_tokens)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Speed</div>
                          <div className="font-semibold">
                            {provider.tokens_per_second} tok/s
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Avg Time</div>
                          <div className="font-semibold">
                            {provider.avg_response_time_ms || 0}ms
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-gray-500" />
                        <div>
                          <div className="text-xs text-gray-500">Context</div>
                          <div className="font-semibold">
                            {formatNumber(provider.context_window)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="text-gray-500">Total Requests</div>
                          <div className="font-semibold text-lg">
                            {provider.total_requests || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Success Rate</div>
                          <div className="font-semibold text-lg text-green-600">
                            {provider.success_rate_percent?.toFixed(1) || 0}%
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Tokens Used</div>
                          <div className="font-semibold text-lg">
                            {formatNumber(provider.total_tokens_used || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Total Cost</div>
                          <div className="font-semibold text-lg">
                            ${provider.total_cost?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        <div>
                          <div className="text-gray-500">Last Success</div>
                          <div className="font-semibold text-xs">
                            {provider.last_success_at
                              ? new Date(provider.last_success_at).toLocaleString('vi-VN')
                              : 'Never'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Error Message */}
                    {provider.last_error_message && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="text-xs text-red-600 font-medium mb-1">
                          Last Error:
                        </div>
                        <div className="text-xs text-red-700">
                          {provider.last_error_message}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Help Section */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Hướng dẫn cấu hình</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">1. Thêm API Keys vào .env.local:</h3>
                  <pre className="bg-gray-100 p-3 rounded text-xs">
{`GOOGLE_AI_API_KEY=your_gemini_key
GROQ_API_KEY=your_groq_key
MISTRAL_API_KEY=your_mistral_key
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_claude_key`}
                  </pre>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Restart server để load keys mới</h3>
                  <p className="text-sm text-gray-600">
                    Sau khi thêm API keys, restart development server bằng lệnh: <code>npm run dev</code>
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Test provider</h3>
                  <p className="text-sm text-gray-600">
                    Click nút "Test" để kiểm tra kết nối và xem provider có hoạt động không.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: Manage Providers */}
          <TabsContent value="manage" className="space-y-6">
            <Card className="border-purple-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 rounded-lg bg-purple-100 text-purple-800">
                      <Brain className="h-5 w-5" />
                    </div>
                    <span>Quản lý AI Providers</span>
                    <Badge variant="outline" className="bg-purple-50">
                      {providersManage.length} providers
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
                {providersManage.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Chưa có AI provider nào. Thêm provider đầu tiên!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {providersManage.map((provider) => (
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
                              onClick={() => handleToggleProviderManage(provider.provider_name, provider.is_enabled)}
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
                                : 'TRẢ PHÍ'}
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

            {/* Add/Edit Provider Modal */}
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
                        {/* Show dropdown for Gemini, text input for others */}
                        {newProvider.provider_name === 'gemini' ? (
                          <select
                            value={newProvider.model_name || 'gemini-2.5-flash'}
                            onChange={(e) =>
                              setNewProvider({ ...newProvider, model_name: e.target.value })
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <optgroup label="✨ Gemini 2.x (Recommended - Latest)">
                              <option value="gemini-2.5-flash">
                                gemini-2.5-flash (Unlimited RPM, 1M TPM) ⚡ BEST
                              </option>
                              <option value="gemini-2.5-flash-lite">
                                gemini-2.5-flash-lite (250K TPM)
                              </option>
                            </optgroup>
                            <optgroup label="🧪 Gemini 3.x (Experimental)">
                              <option value="gemini-3-flash">
                                gemini-3-flash (Test-out model, 250K TPM)
                              </option>
                            </optgroup>
                            <optgroup label="📦 Gemini 1.x (Stable - Older)">
                              <option value="gemini-1.5-flash">
                                gemini-1.5-flash (250K TPM) - Deprecated
                              </option>
                              <option value="gemini-1.5-flash-lite">
                                gemini-1.5-flash-lite (250K TPM)
                              </option>
                            </optgroup>
                          </select>
                        ) : (
                          <Input
                            value={newProvider.model_name || ''}
                            onChange={(e) =>
                              setNewProvider({ ...newProvider, model_name: e.target.value })
                            }
                            placeholder="deepseek-chat"
                          />
                        )}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
