'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PromptTemplate, AIAnalysis } from '@/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Eye, CheckCircle2, Info } from 'lucide-react';
import { getVariableMetadata, isAutoFillVariable, getFieldType as getMetadataFieldType } from '@/lib/templates/variable-metadata';

interface TemplateConfigFormProps {
  template: PromptTemplate;
  videoData?: {
    title: string;
    description?: string;
    transcript?: string;
    channelName?: string;
  };
  aiAnalysis?: AIAnalysis; // ✅ Thêm AI analysis
  onVariablesChange: (variables: Record<string, string>) => void;
  onPreview?: () => void;
  showPreview?: boolean;
}

export function TemplateConfigForm({
  template,
  videoData,
  aiAnalysis,
  onVariablesChange,
  onPreview,
  showPreview = true,
}: TemplateConfigFormProps) {
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const isInitializedRef = useRef(false);

  // Initialize variables with video data and AI analysis
  useEffect(() => {
    console.log('🔍 TemplateConfigForm - Initializing with data:', {
      hasVideoData: !!videoData,
      hasAIAnalysis: !!aiAnalysis,
      title: videoData?.title?.substring(0, 50),
      hasSummary: !!aiAnalysis?.summary,
      summaryLength: aiAnalysis?.summary?.length,
      templateVariables: Object.keys(template.variables)
    });

    const initialVariables: Record<string, string> = {};

    // Auto-fill from video data
    if (videoData) {
      if ('video_title' in template.variables) {
        initialVariables.video_title = videoData.title || '';
        console.log('✅ Auto-filled video_title');
      }
      if ('video_description' in template.variables) {
        initialVariables.video_description = videoData.description || '';
        console.log('✅ Auto-filled video_description');
      }
      if ('channel_name' in template.variables) {
        initialVariables.channel_name = videoData.channelName || '';
        console.log('✅ Auto-filled channel_name');
      }
    }

    // Auto-fill from AI analysis (thay vì transcript)
    if (aiAnalysis) {
      // Nội dung video = tổng hợp từ AI analysis
      if ('transcript' in template.variables) {
        const content = [
          aiAnalysis.summary,
          '',
          '**Ưu điểm:**',
          ...aiAnalysis.pros.map((p, i) => `${i + 1}. ${p}`),
          '',
          '**Nhược điểm:**',
          ...aiAnalysis.cons.map((c, i) => `${i + 1}. ${c}`),
          '',
          '**Điểm nổi bật:**',
          ...aiAnalysis.keyPoints.map(kp => `- [${kp.time}] ${kp.content}`)
        ].join('\n');

        initialVariables.transcript = content;
        console.log('✅ Auto-filled transcript from AI analysis:', content.length, 'chars');
      }

      // Summary
      if ('summary' in template.variables) {
        initialVariables.summary = aiAnalysis.summary || '';
        console.log('✅ Auto-filled summary');
      }

      // Pros/Cons
      if ('pros' in template.variables) {
        initialVariables.pros = aiAnalysis.pros.join('\n') || '';
        console.log('✅ Auto-filled pros');
      }
      if ('cons' in template.variables) {
        initialVariables.cons = aiAnalysis.cons.join('\n') || '';
        console.log('✅ Auto-filled cons');
      }
    }

    // Initialize other variables as empty
    Object.keys(template.variables).forEach((key) => {
      if (initialVariables[key] === undefined) {
        initialVariables[key] = '';
      }
    });

    console.log('📋 Final initialVariables:', Object.keys(initialVariables).map(k => ({
      key: k,
      hasValue: !!initialVariables[k],
      length: initialVariables[k]?.length
    })));

    setVariables(initialVariables);
    isInitializedRef.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template.id]);

  // Notify parent of changes separately to avoid "setState during render" error
  // Only notify after initial setup and when user makes changes
  useEffect(() => {
    if (isInitializedRef.current && Object.keys(variables).length > 0) {
      onVariablesChange(variables);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variables]);

  const handleVariableChange = (key: string, value: string) => {
    const newVariables = { ...variables, [key]: value };
    setVariables(newVariables);
    onVariablesChange(newVariables);

    // Clear error for this field
    if (errors[key]) {
      const newErrors = { ...errors };
      delete newErrors[key];
      setErrors(newErrors);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    Object.entries(template.variables).forEach(([key, description]) => {
      if (!variables[key] || variables[key].trim() === '') {
        newErrors[key] = `${description} là bắt buộc`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getVariableLabel = (key: string, oldDescription: string) => {
    const metadata = getVariableMetadata(key);
    const isAutoFilled = isAutoFillVariable(key);

    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="font-medium">{metadata.label}</span>
          {isAutoFilled && (
            <span className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Tự động điền
            </span>
          )}
        </div>
        {metadata.description && (
          <span className="text-xs text-gray-500 flex items-start gap-1">
            <Info className="h-3 w-3 mt-0.5 flex-shrink-0" />
            <span>{metadata.description}</span>
          </span>
        )}
      </div>
    );
  };

  const getFieldType = (key: string) => {
    const metadata = getVariableMetadata(key);
    return metadata.type === 'textarea' ? 'textarea' : 'input';
  };

  const getPlaceholder = (key: string) => {
    const metadata = getVariableMetadata(key);
    return metadata.placeholder || `Nhập ${metadata.label}...`;
  };

  const isReadOnly = (key: string) => {
    // Allow ALL fields to be editable for debugging and flexibility
    // User can edit even auto-filled fields if needed
    return false;
  };

  const sortedVariables = Object.entries(template.variables).sort(([keyA], [keyB]) => {
    // Auto-filled fields first
    const aIsAuto = isAutoFillVariable(keyA);
    const bIsAuto = isAutoFillVariable(keyB);

    if (aIsAuto && !bIsAuto) return -1;
    if (!aIsAuto && bIsAuto) return 1;
    return keyA.localeCompare(keyB);
  });

  const filledCount = Object.values(variables).filter((v) => v.trim() !== '').length;
  const totalCount = Object.keys(template.variables).length;
  const isComplete = filledCount === totalCount;

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold">Điền thông tin Template</h3>
          <span className="text-sm text-gray-600">
            {filledCount}/{totalCount} trường đã điền
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              isComplete ? 'bg-green-500' : 'bg-blue-500'
            }`}
            style={{ width: `${(filledCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Template Info */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Template <strong>{template.name}</strong> cần {totalCount} thông tin.
          Một số trường đã được tự động điền từ video.
        </AlertDescription>
      </Alert>

      {/* Variables Form */}
      <div className="space-y-4">
        {sortedVariables.map(([key, description]) => {
          const fieldType = getFieldType(key);
          const readonly = isReadOnly(key);
          const placeholder = getPlaceholder(key);
          const metadata = getVariableMetadata(key);

          return (
            <div key={key} className="space-y-2">
              <Label htmlFor={key} className="text-sm">
                {getVariableLabel(key, description as string)}
                <span className="text-red-500 ml-1">*</span>
              </Label>

              {fieldType === 'textarea' ? (
                <Textarea
                  id={key}
                  value={variables[key] || ''}
                  onChange={(e) => handleVariableChange(key, e.target.value)}
                  placeholder={placeholder}
                  readOnly={false}
                  disabled={false}
                  className={`${
                    errors[key] ? 'border-red-500' : ''
                  }`}
                  rows={4}
                />
              ) : (
                <Input
                  id={key}
                  type={metadata.type === 'url' ? 'url' : metadata.type === 'number' ? 'number' : 'text'}
                  value={variables[key] || ''}
                  onChange={(e) => handleVariableChange(key, e.target.value)}
                  placeholder={placeholder}
                  readOnly={false}
                  disabled={false}
                  className={`${
                    errors[key] ? 'border-red-500' : ''
                  }`}
                />
              )}

              {/* Show example below input if available */}
              {metadata.example && (
                <p className="text-xs text-gray-400 italic">
                  Ví dụ: {metadata.example}
                </p>
              )}

              {errors[key] && (
                <p className="text-sm text-red-500">{errors[key]}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Preview Button */}
      {showPreview && onPreview && (
        <Button
          variant="outline"
          onClick={() => {
            if (validate()) {
              onPreview();
            }
          }}
          className="w-full"
        >
          <Eye className="h-4 w-4 mr-2" />
          Xem trước prompt với dữ liệu đã điền
        </Button>
      )}

      {/* Validation Errors */}
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Vui lòng điền đầy đủ tất cả các trường bắt buộc
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
