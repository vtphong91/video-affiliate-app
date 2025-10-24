'use client';

import React, { useState, useEffect } from 'react';
import { PromptTemplate, PromptPlatform, PromptCategory } from '@/types';
import { TemplateCard } from './TemplateCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Search, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface TemplateSelectorProps {
  videoTitle?: string;
  videoDescription?: string;
  platform: PromptPlatform;
  onSelect: (template: PromptTemplate) => void;
  selectedTemplate?: PromptTemplate | null;
}

export function TemplateSelector({
  videoTitle,
  videoDescription,
  platform,
  onSelect,
  selectedTemplate,
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [recommendedTemplate, setRecommendedTemplate] = useState<PromptTemplate | null>(null);
  const [recommendationLoading, setRecommendationLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<PromptCategory | 'all'>('all');
  const [activeTab, setActiveTab] = useState<'recommended' | 'all' | 'system' | 'mine'>('recommended');

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryFilter]);

  // Get AI recommendation - only run once when videoTitle changes
  useEffect(() => {
    if (videoTitle && activeTab === 'recommended' && !recommendedTemplate) {
      getRecommendation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoTitle, activeTab]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        // Don't filter by platform - show all templates
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
      });

      const response = await fetch(`/api/templates?${params}`);
      const data = await response.json();

      if (data.success) {
        setTemplates(data.data);
      } else {
        toast.error('Không thể tải templates');
      }
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Lỗi khi tải templates');
    } finally {
      setLoading(false);
    }
  };

  const getRecommendation = async () => {
    if (!videoTitle) return;

    try {
      setRecommendationLoading(true);
      const response = await fetch('/api/templates/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_title: videoTitle,
          video_description: videoDescription || '',
          platform,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setRecommendedTemplate(data.data.recommended_template);
      }
    } catch (error) {
      console.error('Error getting recommendation:', error);
    } finally {
      setRecommendationLoading(false);
    }
  };

  // Filter templates
  const filteredTemplates = templates.filter((t) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Group templates
  const systemTemplates = filteredTemplates.filter((t) => t.is_system);
  const userTemplates = filteredTemplates.filter((t) => !t.is_system);

  // Group by category for professional display
  const groupedByCategory = (templates: PromptTemplate[]) => {
    const groups: Record<string, PromptTemplate[]> = {};
    templates.forEach((t) => {
      if (!groups[t.category]) {
        groups[t.category] = [];
      }
      groups[t.category].push(t);
    });
    return groups;
  };

  const categoryLabels: Record<string, { label: string; icon: string; color: string }> = {
    tech: { label: 'Công nghệ', icon: '💻', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    beauty: { label: 'Làm đẹp', icon: '💄', color: 'bg-pink-50 text-pink-700 border-pink-200' },
    food: { label: 'Ẩm thực', icon: '🍜', color: 'bg-orange-50 text-orange-700 border-orange-200' },
    travel: { label: 'Du lịch', icon: '✈️', color: 'bg-sky-50 text-sky-700 border-sky-200' },
    general: { label: 'Tổng hợp', icon: '📝', color: 'bg-gray-50 text-gray-700 border-gray-200' },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-1">Chọn Template</h3>
        <p className="text-sm text-gray-600">
          Chọn template phù hợp với nội dung video và platform của bạn
        </p>
      </div>

      {/* Filters */}
      <div className="space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm template..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category filters - Horizontal chips */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Danh mục:</span>

          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
            className="h-8"
          >
            Tất cả
          </Button>

          <Button
            variant={categoryFilter === 'tech' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('tech')}
            className="h-8"
          >
            💻 Công nghệ
          </Button>

          <Button
            variant={categoryFilter === 'beauty' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('beauty')}
            className="h-8"
          >
            💄 Làm đẹp
          </Button>

          <Button
            variant={categoryFilter === 'food' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('food')}
            className="h-8"
          >
            🍜 Ẩm thực
          </Button>

          <Button
            variant={categoryFilter === 'travel' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('travel')}
            className="h-8"
          >
            ✈️ Du lịch
          </Button>

          <Button
            variant={categoryFilter === 'general' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('general')}
            className="h-8"
          >
            📝 Tổng hợp
          </Button>

          {videoTitle && (
            <>
              <div className="h-6 w-px bg-gray-300 mx-1" />
              <Button
                variant="outline"
                size="sm"
                onClick={getRecommendation}
                disabled={recommendationLoading}
                className="h-8"
              >
                <Sparkles className="h-3 w-3 mr-2" />
                {recommendationLoading ? 'Đang phân tích...' : 'AI Gợi ý'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommended" className="flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Gợi ý
          </TabsTrigger>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="mine">Của tôi</TabsTrigger>
        </TabsList>

        {/* Recommended Tab */}
        <TabsContent value="recommended" className="mt-6">
          {recommendationLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : recommendedTemplate ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      Template được gợi ý cho video của bạn
                    </h4>
                    <p className="text-sm text-blue-700">
                      Dựa trên nội dung video, AI nhận thấy template này phù hợp nhất
                    </p>
                  </div>
                </div>
              </div>

              <TemplateCard
                template={recommendedTemplate}
                onSelect={onSelect}
                selected={selectedTemplate?.id === recommendedTemplate.id}
              />

              {/* Show alternatives */}
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Templates tương tự
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                  {systemTemplates
                    .filter((t) => t.id !== recommendedTemplate.id)
                    .slice(0, 6)
                    .map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={onSelect}
                        selected={selectedTemplate?.id === template.id}
                      />
                    ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-4">
                Nhập video URL để nhận gợi ý template từ AI
              </p>
            </div>
          )}
        </TabsContent>

        {/* All Templates Tab */}
        <TabsContent value="all" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Không tìm thấy template nào</p>
            </div>
          ) : categoryFilter === 'all' ? (
            // Flat grid when "Tất cả" selected
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={onSelect}
                  selected={selectedTemplate?.id === template.id}
                />
              ))}
            </div>
          ) : (
            // Grouped by category when specific category selected
            <div className="space-y-8">
              {Object.entries(groupedByCategory(filteredTemplates)).map(([category, templates]) => {
                const categoryInfo = categoryLabels[category] || {
                  label: category,
                  icon: '📁',
                  color: 'bg-gray-50 text-gray-700 border-gray-200',
                };

                return (
                  <div key={category} className="space-y-4">
                    {/* Category Header */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${categoryInfo.color}`}>
                      <span className="text-lg">{categoryInfo.icon}</span>
                      <span className="font-semibold text-sm">{categoryInfo.label}</span>
                      <span className="text-xs opacity-70">({templates.length})</span>
                    </div>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                      {templates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onSelect={onSelect}
                          selected={selectedTemplate?.id === template.id}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* System Templates Tab */}
        <TabsContent value="system" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : systemTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">Không có system template nào</p>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.entries(groupedByCategory(systemTemplates)).map(([category, templates]) => {
                const categoryInfo = categoryLabels[category] || {
                  label: category,
                  icon: '📁',
                  color: 'bg-gray-50 text-gray-700 border-gray-200',
                };

                return (
                  <div key={category} className="space-y-4">
                    {/* Category Header */}
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border ${categoryInfo.color}`}>
                      <span className="text-lg">{categoryInfo.icon}</span>
                      <span className="font-semibold text-sm">{categoryInfo.label}</span>
                      <span className="text-xs opacity-70">({templates.length})</span>
                    </div>

                    {/* Templates Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                      {templates.map((template) => (
                        <TemplateCard
                          key={template.id}
                          template={template}
                          onSelect={onSelect}
                          selected={selectedTemplate?.id === template.id}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* User Templates Tab */}
        <TabsContent value="mine" className="mt-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : userTemplates.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">
                Bạn chưa có template nào
              </p>
              <Button>Tạo template mới</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userTemplates.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onSelect={onSelect}
                  selected={selectedTemplate?.id === template.id}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
