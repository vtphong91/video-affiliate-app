'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import type { TemplateFormData } from '../TemplateBuilder';

interface PromptPreviewPanelProps {
  formData: TemplateFormData;
  show: boolean;
  onToggle: () => void;
}

export function PromptPreviewPanel({
  formData,
  show,
  onToggle,
}: PromptPreviewPanelProps) {
  const [copied, setCopied] = useState(false);

  const generatedPrompt = generateFullPrompt(formData);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    toast.success('Đã copy prompt vào clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (!show) {
    return (
      <Card className="sticky top-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Preview</CardTitle>
            <Button variant="ghost" size="sm" onClick={onToggle}>
              <Eye className="h-4 w-4 mr-2" />
              Hiện
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="sticky top-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>🔍 Preview Prompt</CardTitle>
          <Button variant="ghost" size="sm" onClick={onToggle}>
            <EyeOff className="h-4 w-4 mr-2" />
            Ẩn
          </Button>
        </div>
        <CardDescription>
          Xem trước prompt sẽ được tạo ra
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Summary badges */}
        <div className="flex flex-wrap gap-2">
          {formData.category && (
            <Badge variant="outline" className="text-xs">
              {formData.category}
            </Badge>
          )}
          {formData.platform && (
            <Badge variant="outline" className="text-xs">
              {formData.platform}
            </Badge>
          )}
          {formData.content_type && (
            <Badge variant="outline" className="text-xs">
              {formData.content_type}
            </Badge>
          )}
        </div>

        {/* Prompt content */}
        <div className="border rounded-lg p-4 bg-gray-50 max-h-[600px] overflow-y-auto">
          <pre className="text-xs whitespace-pre-wrap font-mono leading-relaxed text-gray-800">
            {generatedPrompt}
          </pre>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="font-medium">Độ dài:</span>
            <span>{generatedPrompt.length} ký tự</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Tokens:</span>
            <span>~{Math.ceil(generatedPrompt.length / 4)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Dòng:</span>
            <span>{generatedPrompt.split('\n').length}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="font-medium">Biến:</span>
            <span>{Object.keys(formData.example_input).length}</span>
          </div>
        </div>

        {/* Variables used */}
        {Object.keys(formData.example_input).length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-gray-700">Biến sử dụng:</p>
            <div className="flex flex-wrap gap-1">
              {Object.keys(formData.example_input).map((key) => (
                <code
                  key={key}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded"
                >
                  {`{{${key}}}`}
                </code>
              ))}
            </div>
          </div>
        )}

        {/* Copy button */}
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={handleCopy}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4 mr-2" />
              Đã copy!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4 mr-2" />
              Copy Prompt
            </>
          )}
        </Button>

        {/* Validation warnings */}
        <div className="space-y-1">
          {!formData.name && (
            <p className="text-xs text-amber-600">⚠️ Chưa có tên template</p>
          )}
          {!formData.role_instruction && (
            <p className="text-xs text-amber-600">⚠️ Chưa có role instruction</p>
          )}
          {formData.constraints.do_list.length === 0 && formData.constraints.dont_list.length === 0 && (
            <p className="text-xs text-gray-500">💡 Nên thêm constraints để prompt rõ ràng hơn</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Generate full prompt from form data
 * This combines all 10 elements into a complete, ready-to-use prompt
 */
function generateFullPrompt(data: TemplateFormData): string {
  let prompt = '';

  // ========== ELEMENT 2: ROLE INSTRUCTION ==========
  if (data.role_instruction.trim()) {
    prompt += `# ROLE\n\n`;
    prompt += `${data.role_instruction.trim()}\n\n`;
    prompt += `---\n\n`;
  }

  // ========== ELEMENT 1: CONTEXT ==========
  const hasContext = Object.values(data.context).some((v) => v.trim());
  if (hasContext) {
    prompt += `# CONTEXT\n\n`;
    if (data.context.business_type.trim()) {
      prompt += `**Business Type:** ${data.context.business_type.trim()}\n`;
    }
    if (data.context.target_audience.trim()) {
      prompt += `**Target Audience:** ${data.context.target_audience.trim()}\n`;
    }
    if (data.context.brand_voice.trim()) {
      prompt += `**Brand Voice:** ${data.context.brand_voice.trim()}\n`;
    }
    if (data.context.campaign_goal.trim()) {
      prompt += `**Campaign Goal:** ${data.context.campaign_goal.trim()}\n`;
    }
    prompt += `\n---\n\n`;
  }

  // ========== ELEMENT 3: OBJECTIVE ==========
  if (data.objective.primary_goal.trim()) {
    prompt += `# OBJECTIVE\n\n`;
    prompt += `**Primary Goal:** ${data.objective.primary_goal.trim()}\n`;
    if (data.objective.secondary_goal?.trim()) {
      prompt += `**Secondary Goal:** ${data.objective.secondary_goal.trim()}\n`;
    }
    if (data.objective.success_metrics?.trim()) {
      prompt += `**Success Metrics:** ${data.objective.success_metrics.trim()}\n`;
    }
    prompt += `\n---\n\n`;
  }

  // ========== ELEMENT 4: REQUIREMENTS ==========
  prompt += `# REQUIREMENTS\n\n`;
  prompt += `**Tone:** ${data.config.tone}\n`;
  prompt += `**Length:** ${data.config.length} (${getLengthDescription(data.config.length)})\n`;
  prompt += `**Language:** ${data.config.language === 'vi' ? 'Tiếng Việt' : 'English'}\n`;
  prompt += `**Emoji Usage:** ${data.config.emojiUsage}\n`;
  if (data.config.hashtagCount && data.config.hashtagCount > 0) {
    prompt += `**Hashtags:** ${data.config.hashtagCount} hashtags\n`;
  }
  if (data.config.seoOptimized) {
    prompt += `**SEO:** Optimized for search engines\n`;
  }
  if (data.config.includeTimestamps) {
    prompt += `**Timestamps:** Include video timestamps\n`;
  }
  prompt += `\n---\n\n`;

  // ========== ELEMENT 4 (continued): STRUCTURE ==========
  const structure = data.config.structure;
  const selectedStructure = Object.entries(structure)
    .filter(([_, value]) => value)
    .map(([key]) => key);

  if (selectedStructure.length > 0) {
    prompt += `# CONTENT STRUCTURE\n\n`;
    prompt += `Bài viết phải bao gồm các phần sau:\n\n`;
    selectedStructure.forEach((key, index) => {
      prompt += `${index + 1}. ${getStructureLabel(key)}\n`;
    });
    prompt += `\n---\n\n`;
  }

  // ========== ELEMENT 7: TONE & STYLE (EXTENDED) ==========
  if (data.config.formality || data.config.perspective || data.config.emotional_tone) {
    prompt += `# TONE & STYLE\n\n`;
    if (data.config.formality) {
      prompt += `**Formality:** ${data.config.formality}\n`;
    }
    if (data.config.perspective) {
      prompt += `**Perspective:** ${data.config.perspective.replace('_', ' ')}\n`;
    }
    if (data.config.emotional_tone) {
      prompt += `**Emotional Tone:** ${data.config.emotional_tone}\n`;
    }
    if (data.config.punctuation_style) {
      prompt += `**Punctuation Style:** ${data.config.punctuation_style.replace('-', ' ')}\n`;
    }
    prompt += `\n---\n\n`;
  }

  // ========== ELEMENT 5: CONSTRAINTS ==========
  const hasConstraints = data.constraints.do_list.length > 0 || data.constraints.dont_list.length > 0;
  if (hasConstraints) {
    prompt += `# CONSTRAINTS\n\n`;

    if (data.constraints.do_list.length > 0) {
      prompt += `**DO:**\n`;
      data.constraints.do_list.forEach((item) => {
        prompt += `- ${item}\n`;
      });
      prompt += `\n`;
    }

    if (data.constraints.dont_list.length > 0) {
      prompt += `**DON'T:**\n`;
      data.constraints.dont_list.forEach((item) => {
        prompt += `- ${item}\n`;
      });
      prompt += `\n`;
    }

    prompt += `---\n\n`;
  }

  // ========== ELEMENT 6: EXAMPLES (if provided) ==========
  if (data.example_output.trim()) {
    prompt += `# EXAMPLE OUTPUT\n\n`;
    prompt += `Dưới đây là ví dụ mẫu về phong cách và chất lượng mong muốn:\n\n`;
    prompt += `\`\`\`\n${data.example_output.trim()}\n\`\`\`\n\n`;
    prompt += `---\n\n`;
  }

  // ========== ELEMENT 8: FEEDBACK LOOP ==========
  if (data.feedback_instructions.trim()) {
    prompt += `# SELF-CHECK\n\n`;
    prompt += `${data.feedback_instructions.trim()}\n\n`;
    prompt += `---\n\n`;
  }

  // ========== ELEMENT 10: ADDITIONAL NOTES ==========
  if (data.additional_notes.trim()) {
    prompt += `# ADDITIONAL NOTES\n\n`;
    prompt += `${data.additional_notes.trim()}\n\n`;
    prompt += `---\n\n`;
  }

  // ========== INPUT DATA SECTION ==========
  prompt += `# INPUT DATA\n\n`;
  prompt += `Dựa trên thông tin sau để tạo nội dung:\n\n`;

  if (Object.keys(data.example_input).length > 0) {
    Object.entries(data.example_input).forEach(([key, value]) => {
      prompt += `**${key}:** {{${key}}}\n`;
    });
  } else {
    prompt += `**video_title:** {{video_title}}\n`;
    prompt += `**video_description:** {{video_description}}\n`;
    prompt += `**transcript:** {{transcript}}\n`;
  }

  prompt += `\n---\n\n`;
  prompt += `# TASK\n\nHãy tạo nội dung review dựa trên tất cả các yêu cầu và thông tin trên.`;

  return prompt;
}

function getLengthDescription(length: string): string {
  const map: Record<string, string> = {
    short: '150-300 words',
    medium: '300-600 words',
    long: '1000+ words',
  };
  return map[length] || length;
}

function getStructureLabel(key: string): string {
  const map: Record<string, string> = {
    intro: 'Introduction (Phần mở đầu)',
    hook: 'Hook (Câu móc hấp dẫn)',
    summary: 'Summary (Tóm tắt)',
    keyPoints: 'Key Points (Điểm nổi bật)',
    prosCons: 'Pros & Cons (Ưu/Nhược điểm)',
    comparison: 'Comparison (So sánh)',
    priceAnalysis: 'Price Analysis (Phân tích giá)',
    verdict: 'Verdict (Đánh giá cuối)',
    callToAction: 'Call-to-Action (Kêu gọi hành động)',
  };
  return map[key] || key;
}
