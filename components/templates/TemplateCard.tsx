'use client';

import React from 'react';
import { PromptTemplate } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import {
  getTemplateDisplayName,
  getCategoryDisplayName,
  getPlatformDisplayName,
  getContentTypeDisplayName,
} from '@/lib/templates/template-helpers';
import { Eye, Star, TrendingUp, CheckCircle2 } from 'lucide-react';

interface TemplateCardProps {
  template: PromptTemplate;
  onSelect?: (template: PromptTemplate) => void;
  onPreview?: (template: PromptTemplate) => void;
  selected?: boolean;
  showUsageStats?: boolean;
}

export function TemplateCard({
  template,
  onSelect,
  onPreview,
  selected = false,
  showUsageStats = true,
}: TemplateCardProps) {
  const getToneColor = (tone: string) => {
    const colors: Record<string, string> = {
      professional: 'bg-blue-100 text-blue-800',
      casual: 'bg-green-100 text-green-800',
      funny: 'bg-yellow-100 text-yellow-800',
      formal: 'bg-purple-100 text-purple-800',
    };
    return colors[tone] || 'bg-gray-100 text-gray-800';
  };

  const getLengthLabel = (length: string) => {
    const labels: Record<string, string> = {
      short: 'Ngắn (150-300 từ)',
      medium: 'Trung bình (300-600 từ)',
      long: 'Dài (1000+ từ)',
    };
    return labels[length] || length;
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      tech: '💻',
      beauty: '💄',
      food: '🍜',
      travel: '✈️',
      general: '📝',
    };
    return icons[category] || '📝';
  };

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, string> = {
      facebook: '📘',
      instagram: '📷',
      tiktok: '🎵',
      blog: '📰',
    };
    return icons[platform] || '📝';
  };

  return (
    <Card
      className={`relative transition-all hover:shadow-lg h-full flex flex-col ${
        selected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
    >
      {/* System Template Badge */}
      {template.is_system && (
        <div className="absolute top-3 right-3">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <Star className="h-3 w-3 mr-1" />
            System
          </Badge>
        </div>
      )}

      {/* Selected Indicator */}
      {selected && (
        <div className="absolute top-3 left-3">
          <CheckCircle2 className="h-6 w-6 text-blue-500" />
        </div>
      )}

      <CardHeader className={selected ? 'pt-12' : ''}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl">{getCategoryIcon(template.category)}</span>
          <span className="text-2xl">{getPlatformIcon(template.platform)}</span>
        </div>
        <CardTitle className="text-lg">{template.name}</CardTitle>
        <CardDescription className="text-sm">
          {template.description || 'Không có mô tả'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 flex-1">
        {/* Category & Platform */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs">
            {getCategoryDisplayName(template.category)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getPlatformDisplayName(template.platform)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {getContentTypeDisplayName(template.content_type)}
          </Badge>
        </div>

        {/* Configuration Details */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tone:</span>
            <Badge className={getToneColor(template.config.tone)}>
              {template.config.tone}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Độ dài:</span>
            <span className="text-gray-900 font-medium">
              {getLengthLabel(template.config.length)}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Ngôn ngữ:</span>
            <span className="text-gray-900 font-medium">
              {template.config.language === 'vi' ? 'Tiếng Việt' : 'English'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-gray-600">Emoji:</span>
            <span className="text-gray-900 font-medium">
              {template.config.emojiUsage === 'none' && 'Không có'}
              {template.config.emojiUsage === 'minimal' && 'Ít'}
              {template.config.emojiUsage === 'moderate' && 'Vừa phải'}
              {template.config.emojiUsage === 'heavy' && 'Nhiều'}
            </span>
          </div>

          {template.config.seoOptimized && (
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span>SEO Optimized</span>
            </div>
          )}
        </div>

        {/* Usage Statistics */}
        {showUsageStats && (
          <div className="pt-3 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star className="h-4 w-4" />
              <span>Đã sử dụng: {template.usage_count} lần</span>
            </div>
          </div>
        )}

        {/* Variables Count */}
        <div className="text-xs text-gray-500">
          {Object.keys(template.variables).length} biến cần điền
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        {onPreview && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(template)}
            className="flex-1"
          >
            <Eye className="h-4 w-4 mr-1" />
            Xem trước
          </Button>
        )}
        {onSelect && (
          <Button
            size="sm"
            onClick={() => onSelect(template)}
            className={`flex-1 ${
              selected ? 'bg-blue-600 hover:bg-blue-700' : ''
            }`}
          >
            {selected ? 'Đã chọn' : 'Chọn template'}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
