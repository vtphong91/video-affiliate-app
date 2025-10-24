'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Copy, FileText } from 'lucide-react';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';

interface PromptTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string;
  platform: string;
  content_type: string;
  created_at: string;
  updated_at: string;
  usage_count: number;
  is_public: boolean;
}

function PromptsPage() {
  const router = useRouter();
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch('/api/templates');
      if (response.ok) {
        const data = await response.json();
        setPrompts(data.templates || []);
      }
    } catch (error) {
      console.error('Error fetching prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa prompt này?')) return;

    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setPrompts(prompts.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting prompt:', error);
      alert('Không thể xóa prompt. Vui lòng thử lại.');
    }
  };

  const filteredPrompts = prompts.filter(p => {
    if (filter === 'all') return true;
    if (filter === 'my') return !p.is_public;
    if (filter === 'public') return p.is_public;
    return p.platform === filter || p.category === filter;
  });

  const categories = [...new Set(prompts.map(p => p.category))];
  const platforms = [...new Set(prompts.map(p => p.platform))];

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Prompt Templates</h1>
          <p className="text-gray-600 mt-2">
            Tạo và quản lý các prompt templates với 10 yếu tố chất lượng
          </p>
        </div>
        <Button
          onClick={() => router.push('/dashboard/prompts/create')}
          size="lg"
        >
          <Plus className="mr-2 h-5 w-5" />
          Tạo Prompt Mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng số prompts</CardDescription>
            <CardTitle className="text-3xl">{prompts.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Prompts của tôi</CardDescription>
            <CardTitle className="text-3xl">{prompts.filter(p => !p.is_public).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Prompts công khai</CardDescription>
            <CardTitle className="text-3xl">{prompts.filter(p => p.is_public).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Tổng lượt dùng</CardDescription>
            <CardTitle className="text-3xl">{prompts.reduce((sum, p) => sum + p.usage_count, 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={filter === 'all' ? 'default' : 'outline'}
          onClick={() => setFilter('all')}
        >
          Tất cả
        </Button>
        <Button
          variant={filter === 'my' ? 'default' : 'outline'}
          onClick={() => setFilter('my')}
        >
          Của tôi
        </Button>
        <Button
          variant={filter === 'public' ? 'default' : 'outline'}
          onClick={() => setFilter('public')}
        >
          Công khai
        </Button>

        {platforms.map(platform => (
          <Button
            key={platform}
            variant={filter === platform ? 'default' : 'outline'}
            onClick={() => setFilter(platform)}
          >
            {platform}
          </Button>
        ))}
      </div>

      {/* Prompt List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải...</p>
        </div>
      ) : filteredPrompts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Chưa có prompt templates
            </h3>
            <p className="text-gray-600 mb-4">
              Tạo prompt đầu tiên để bắt đầu sử dụng
            </p>
            <Button onClick={() => router.push('/dashboard/prompts/create')}>
              <Plus className="mr-2 h-4 w-4" />
              Tạo Prompt Đầu Tiên
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrompts.map(prompt => (
            <Card key={prompt.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start mb-2">
                  <CardTitle className="text-lg line-clamp-1">{prompt.name}</CardTitle>
                  {prompt.is_public && (
                    <Badge variant="secondary">Công khai</Badge>
                  )}
                </div>
                <CardDescription className="line-clamp-2">
                  {prompt.description || 'Không có mô tả'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Badge variant="outline">{prompt.category}</Badge>
                    <Badge variant="outline">{prompt.platform}</Badge>
                    <Badge variant="outline">{prompt.content_type}</Badge>
                  </div>
                  <div className="text-sm text-gray-500">
                    Sử dụng: {prompt.usage_count} lần
                  </div>
                  <div className="text-xs text-gray-400">
                    Cập nhật: {new Date(prompt.updated_at).toLocaleDateString('vi-VN')}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => router.push(`/dashboard/prompts/${prompt.id}/edit`)}
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Sửa
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    // Copy prompt ID to use in review creation
                    localStorage.setItem('selected_prompt_id', prompt.id);
                    router.push('/dashboard/create');
                  }}
                >
                  <Copy className="mr-1 h-4 w-4" />
                  Dùng
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDelete(prompt.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default withUserRoute(PromptsPage);
