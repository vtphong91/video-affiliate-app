'use client';

import React, { useState } from 'react';
import { PromptTemplate } from '@/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Copy, CheckCircle2, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface TemplatePreviewProps {
  template: PromptTemplate;
  variables: Record<string, string>;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TemplatePreview({
  template,
  variables,
  open,
  onOpenChange,
}: TemplatePreviewProps) {
  const [previewData, setPreviewData] = useState<{
    final_prompt: string;
    estimated_tokens: number;
    warning?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch preview when dialog opens
  React.useEffect(() => {
    if (open && template && variables) {
      fetchPreview();
    }
  }, [open, template?.id]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/templates/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          template_id: template.id,
          variables,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setPreviewData(data.data);
      } else {
        toast.error(data.error || 'Không thể tạo preview');
      }
    } catch (error) {
      console.error('Error fetching preview:', error);
      toast.error('Lỗi khi tạo preview');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (previewData?.final_prompt) {
      navigator.clipboard.writeText(previewData.final_prompt);
      setCopied(true);
      toast.success('Đã copy prompt');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Xem trước Prompt</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : previewData ? (
          <div className="space-y-4">
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1">Độ dài Prompt</div>
                <div className="text-2xl font-bold">
                  {previewData.final_prompt.length.toLocaleString()} ký tự
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Token ước tính
                </div>
                <div className={`text-2xl font-bold ${
                  previewData.estimated_tokens > 4000 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  ~{previewData.estimated_tokens.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Warning */}
            {previewData.warning && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{previewData.warning}</AlertDescription>
              </Alert>
            )}

            {/* Template Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Thông tin Template</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-700">Tên:</span>{' '}
                  <span className="font-medium">{template.name}</span>
                </div>
                <div>
                  <span className="text-blue-700">Platform:</span>{' '}
                  <span className="font-medium">{template.platform}</span>
                </div>
                <div>
                  <span className="text-blue-700">Tone:</span>{' '}
                  <span className="font-medium">{template.config.tone}</span>
                </div>
                <div>
                  <span className="text-blue-700">Độ dài:</span>{' '}
                  <span className="font-medium">{template.config.length}</span>
                </div>
              </div>
            </div>

            {/* Prompt Preview */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">Prompt đầy đủ sẽ gửi cho AI:</h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Đã copy
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                {previewData.final_prompt}
              </div>
            </div>

            {/* Variables Used */}
            <div>
              <h4 className="font-medium mb-2">Biến đã sử dụng:</h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(variables).map(([key, value]) => (
                  <div key={key} className="bg-gray-50 rounded p-2 text-sm">
                    <div className="text-gray-600 font-medium mb-1">
                      {'{{'}{key}{'}}'}
                    </div>
                    <div className="text-gray-900 truncate" title={value}>
                      {value || '<trống>'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-600">
            Không thể tải preview
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
