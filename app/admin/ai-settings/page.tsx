'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  BarChart3
} from 'lucide-react';

interface AIProvider {
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

interface Summary {
  total: number;
  enabled: number;
  configured: number;
  free: number;
  cheap: number;
  paid: number;
}

export default function AISettingsPage() {
  const [providers, setProviders] = useState<AIProvider[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/ai-settings');
      const result = await response.json();

      if (result.success) {
        setProviders(result.data.providers);
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
      setLoading(false);
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
      fetchProviders(); // Refresh to get updated stats
    }
  };

  const toggleProvider = async (providerName: string, currentlyEnabled: boolean) => {
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
        fetchProviders();
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

  if (loading) {
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
                Quản lý cấu hình và theo dõi hiệu suất của các AI providers
              </p>
            </div>
            <Button
              onClick={fetchProviders}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

        {/* Provider Cards */}
        <div className="grid grid-cols-1 gap-6">
          {providers.map((provider) => (
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
                      variant={provider.is_enabled ? 'destructive' : 'default'}
                      onClick={() =>
                        toggleProvider(provider.provider_name, provider.is_enabled)
                      }
                      disabled={!provider.can_enable}
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
        <Card className="mt-8">
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
      </div>
    </div>
  );
}
