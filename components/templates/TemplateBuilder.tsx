'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Save, Eye } from 'lucide-react';
import { supabase } from '@/lib/db/supabase';

// Sub-components
import { TemplateBasicTab } from './builder/TemplateBasicTab';
import { TemplateStructureTab } from './builder/TemplateStructureTab';
import { TemplateAdvancedTab } from './builder/TemplateAdvancedTab';
import { PromptPreviewPanel } from './builder/PromptPreviewPanel';

// Types
import type {
  PromptTemplate,
  PromptCategory,
  PromptPlatform,
  PromptContentType,
  PromptConfig,
  PromptObjective,
  PromptConstraints,
  AIParameters,
} from '@/types';

export interface TemplateFormData {
  // Basic info
  name: string;
  description: string;
  category: PromptCategory | '';
  platform: PromptPlatform | '';
  content_type: PromptContentType | '';

  // Element 1 & 2: Context & Role
  role_instruction: string;
  context: {
    business_type: string;
    target_audience: string;
    brand_voice: string;
    campaign_goal: string;
  };

  // Element 3: Objective
  objective: PromptObjective;

  // Element 4: Requirements (config)
  config: PromptConfig;

  // Element 5: Constraints
  constraints: PromptConstraints;

  // Element 6: Examples
  example_input: Record<string, string>;
  example_output: string;

  // Element 7: Tone & Style (in config)

  // Element 8: Feedback Loop
  feedback_instructions: string;

  // Element 9: AI Parameters
  ai_parameters: AIParameters;

  // Element 10: Additional Notes
  additional_notes: string;

  // Template content
  prompt_template: string;
  variables: Record<string, string>;
}

const defaultFormData: TemplateFormData = {
  name: '',
  description: '',
  category: '',
  platform: '',
  content_type: '',
  role_instruction: '',
  context: {
    business_type: '',
    target_audience: '',
    brand_voice: '',
    campaign_goal: '',
  },
  objective: {
    primary_goal: '',
    secondary_goal: '',
    success_metrics: '',
  },
  config: {
    tone: 'casual',
    length: 'medium',
    language: 'vi',
    structure: {
      intro: true,
      hook: true,
      summary: true,
      keyPoints: true,
      prosCons: true,
      comparison: false,
      priceAnalysis: false,
      verdict: true,
      callToAction: true,
    },
    emojiUsage: 'moderate',
    hashtagCount: 5,
    seoOptimized: true,
    includeTimestamps: false,
    formality: 'informal',
    perspective: 'first_person',
    emotional_tone: 'enthusiastic',
    punctuation_style: 'neutral',
  },
  constraints: {
    do_list: [],
    dont_list: [],
    compliance: [],
    seo_requirements: [],
  },
  example_input: {},
  example_output: '',
  feedback_instructions: '',
  ai_parameters: {
    temperature: 0.7,
    max_tokens: 2048,
    top_p: 0.9,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  },
  additional_notes: '',
  prompt_template: '',
  variables: {},
};

export function TemplateBuilder() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'basic' | 'structure' | 'advanced'>('basic');
  const [formData, setFormData] = useState<TemplateFormData>(defaultFormData);
  const [isSaving, setIsSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);

  const updateFormData = (updates: Partial<TemplateFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const updateConfig = (configUpdates: Partial<PromptConfig>) => {
    setFormData((prev) => ({
      ...prev,
      config: { ...prev.config, ...configUpdates },
    }));
  };

  const handleSave = async (publish: boolean = false) => {
    // Validation
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên template');
      setActiveTab('basic');
      return;
    }

    if (!formData.category || !formData.platform || !formData.content_type) {
      toast.error('Vui lòng chọn đầy đủ category, platform và content type');
      setActiveTab('basic');
      return;
    }

    if (!formData.role_instruction.trim()) {
      toast.error('Vui lòng nhập Role Instruction (vai trò AI)');
      setActiveTab('basic');
      return;
    }

    try {
      setIsSaving(true);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('Phiên đăng nhập đã hết hạn');
      }

      // Build template payload
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        platform: formData.platform,
        content_type: formData.content_type,
        version: '2.0' as const, // Using 10-element framework

        // Configuration (Elements 1, 4, 7)
        config: {
          ...formData.config,
          context: formData.context,
        },

        // Template content
        prompt_template: formData.prompt_template || generatePromptTemplate(formData),
        variables: formData.variables,

        // Element 2: Role
        role_instruction: formData.role_instruction.trim() || null,

        // Element 3: Objective
        objective: formData.objective.primary_goal ? formData.objective : null,

        // Element 5: Constraints
        constraints: formData.constraints.do_list.length > 0 || formData.constraints.dont_list.length > 0
          ? formData.constraints
          : null,

        // Element 6: Examples
        example_input: Object.keys(formData.example_input).length > 0 ? formData.example_input : null,
        example_output: formData.example_output.trim() || null,

        // Element 8: Feedback Loop
        feedback_instructions: formData.feedback_instructions.trim() || null,

        // Element 9: AI Parameters
        ai_parameters: formData.ai_parameters,

        // Element 10: Additional Notes
        additional_notes: formData.additional_notes.trim() || null,

        // Flags
        is_public: publish,
      };

      console.log('💾 Saving template:', payload);

      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Không thể tạo template');
      }

      toast.success(publish ? 'Template đã được tạo và publish!' : 'Template đã được lưu nháp!');
      router.push('/dashboard/templates');
    } catch (error) {
      console.error('❌ Save template error:', error);
      toast.error(error instanceof Error ? error.message : 'Không thể lưu template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {/* Left Panel: Form (60% = 3/5) */}
      <div className="lg:col-span-3 space-y-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">
              1. Cơ bản
            </TabsTrigger>
            <TabsTrigger value="structure">
              2. Cấu trúc
            </TabsTrigger>
            <TabsTrigger value="advanced">
              3. Nâng cao
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-6">
            <TemplateBasicTab
              formData={formData}
              updateFormData={updateFormData}
              updateConfig={updateConfig}
            />
          </TabsContent>

          <TabsContent value="structure" className="mt-6">
            <TemplateStructureTab
              formData={formData}
              updateConfig={updateConfig}
            />
          </TabsContent>

          <TabsContent value="advanced" className="mt-6">
            <TemplateAdvancedTab
              formData={formData}
              updateFormData={updateFormData}
            />
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <Button
            variant="outline"
            onClick={() => router.push('/dashboard/templates')}
            disabled={isSaving}
          >
            Hủy
          </Button>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => handleSave(false)}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Lưu nháp
                </>
              )}
            </Button>

            <Button
              onClick={() => handleSave(true)}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang tạo...
                </>
              ) : (
                'Tạo & Publish'
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel: Preview (40% = 2/5) */}
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-6">
          <PromptPreviewPanel
            formData={formData}
            show={showPreview}
            onToggle={() => setShowPreview(!showPreview)}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Generate prompt template from form data
 * This is a basic template generator - user can customize later
 */
function generatePromptTemplate(data: TemplateFormData): string {
  let template = '';

  // Add role instruction
  if (data.role_instruction) {
    template += `${data.role_instruction}\n\n`;
  }

  // Add objective
  if (data.objective.primary_goal) {
    template += `**MỤC TIÊU:** ${data.objective.primary_goal}\n\n`;
  }

  // Add context
  if (data.context.target_audience) {
    template += `**ĐỐI TƯỢNG MỤC TIÊU:** ${data.context.target_audience}\n\n`;
  }

  // Add requirements
  template += `**YÊU CẦU:**\n`;
  template += `- Tone: ${data.config.tone}\n`;
  template += `- Độ dài: ${data.config.length}\n`;
  template += `- Ngôn ngữ: ${data.config.language}\n`;
  template += `- Emoji: ${data.config.emojiUsage}\n\n`;

  // Add structure requirements
  template += `**CẤU TRÚC NỘI DUNG:**\n`;
  const structure = data.config.structure;
  if (structure.intro) template += `- Phần mở đầu hấp dẫn\n`;
  if (structure.summary) template += `- Tóm tắt tổng quan\n`;
  if (structure.keyPoints) template += `- Các điểm chính\n`;
  if (structure.prosCons) template += `- Ưu điểm và nhược điểm\n`;
  if (structure.verdict) template += `- Đánh giá cuối cùng\n`;
  if (structure.callToAction) template += `- Call-to-action mạnh mẽ\n`;
  template += `\n`;

  // Add constraints
  if (data.constraints.do_list.length > 0) {
    template += `**NÊN LÀM:**\n`;
    data.constraints.do_list.forEach(item => {
      template += `- ${item}\n`;
    });
    template += `\n`;
  }

  if (data.constraints.dont_list.length > 0) {
    template += `**KHÔNG NÊN:**\n`;
    data.constraints.dont_list.forEach(item => {
      template += `- ${item}\n`;
    });
    template += `\n`;
  }

  // Placeholder for variables
  template += `\n---\n\n`;
  template += `Hãy tạo nội dung dựa trên thông tin sau:\n`;
  template += `{{video_title}}\n`;
  template += `{{video_description}}\n`;
  template += `{{transcript}}\n`;

  return template;
}
