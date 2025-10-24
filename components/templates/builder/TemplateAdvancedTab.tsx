'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Info, Plus, X } from 'lucide-react';
import type { TemplateFormData } from '../TemplateBuilder';

interface TemplateAdvancedTabProps {
  formData: TemplateFormData;
  updateFormData: (updates: Partial<TemplateFormData>) => void;
}

export function TemplateAdvancedTab({
  formData,
  updateFormData,
}: TemplateAdvancedTabProps) {
  const [newDo, setNewDo] = useState('');
  const [newDont, setNewDont] = useState('');
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');

  const addDoItem = () => {
    if (!newDo.trim()) return;
    updateFormData({
      constraints: {
        ...formData.constraints,
        do_list: [...formData.constraints.do_list, newDo.trim()],
      },
    });
    setNewDo('');
  };

  const removeDo = (index: number) => {
    const newList = formData.constraints.do_list.filter((_, i) => i !== index);
    updateFormData({
      constraints: {
        ...formData.constraints,
        do_list: newList,
      },
    });
  };

  const addDontItem = () => {
    if (!newDont.trim()) return;
    updateFormData({
      constraints: {
        ...formData.constraints,
        dont_list: [...formData.constraints.dont_list, newDont.trim()],
      },
    });
    setNewDont('');
  };

  const removeDont = (index: number) => {
    const newList = formData.constraints.dont_list.filter((_, i) => i !== index);
    updateFormData({
      constraints: {
        ...formData.constraints,
        dont_list: newList,
      },
    });
  };

  const addVariable = () => {
    if (!newVarKey.trim()) return;
    updateFormData({
      example_input: {
        ...formData.example_input,
        [newVarKey.trim()]: newVarValue.trim(),
      },
    });
    setNewVarKey('');
    setNewVarValue('');
  };

  const removeVariable = (key: string) => {
    const newVars = { ...formData.example_input };
    delete newVars[key];
    updateFormData({ example_input: newVars });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Tab này bao gồm <strong>5 yếu tố nâng cao</strong>: Constraints, Examples, Tone & Style Extended, AI Parameters và Additional Notes.
        </AlertDescription>
      </Alert>

      {/* Element 5: Constraints */}
      <Card>
        <CardHeader>
          <CardTitle>🚦 Ràng buộc (Constraints)</CardTitle>
          <CardDescription>
            <strong>Yếu tố 5:</strong> Danh sách những gì NÊN làm và KHÔNG NÊN làm
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Danh sách NÊN làm (DO)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="VD: Sử dụng số liệu cụ thể khi so sánh"
                value={newDo}
                onChange={(e) => setNewDo(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDoItem()}
              />
              <Button type="button" size="sm" onClick={addDoItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.constraints.do_list.map((item, index) => (
                <Badge
                  key={index}
                  variant="default"
                  className="gap-1 bg-green-100 text-green-800 hover:bg-green-200"
                >
                  ✓ {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeDo(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Danh sách KHÔNG NÊN làm (DON'T)</Label>
            <div className="flex gap-2">
              <Input
                placeholder="VD: Không dùng từ ngữ thiếu khách quan"
                value={newDont}
                onChange={(e) => setNewDont(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDontItem()}
              />
              <Button type="button" size="sm" onClick={addDontItem}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.constraints.dont_list.map((item, index) => (
                <Badge
                  key={index}
                  variant="destructive"
                  className="gap-1"
                >
                  ✗ {item}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeDont(index)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Element 6: Examples */}
      <Card>
        <CardHeader>
          <CardTitle>📚 Ví dụ mẫu (Examples)</CardTitle>
          <CardDescription>
            <strong>Yếu tố 6:</strong> Input mẫu và Output mẫu để AI học theo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label>Example Input (Biến mẫu)</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="Tên biến (VD: product_name)"
                value={newVarKey}
                onChange={(e) => setNewVarKey(e.target.value)}
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Giá trị mẫu (VD: iPhone 15 Pro Max)"
                  value={newVarValue}
                  onChange={(e) => setNewVarValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addVariable()}
                />
                <Button type="button" size="sm" onClick={addVariable}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {Object.entries(formData.example_input).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <div>
                    <code className="text-sm font-mono text-blue-600">{`{{${key}}}`}</code>
                    <span className="text-gray-400 mx-2">→</span>
                    <span className="text-sm">{value}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariable(key)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="example_output">Example Output (Kết quả mẫu)</Label>
            <Textarea
              id="example_output"
              placeholder="Dán một bài review mẫu hoàn chỉnh mà bạn muốn AI học theo..."
              rows={6}
              value={formData.example_output}
              onChange={(e) => updateFormData({ example_output: e.target.value })}
            />
            <p className="text-xs text-gray-500">
              💡 Mẹo: Cung cấp 1-2 ví dụ output chất lượng giúp AI hiểu rõ hơn phong cách bạn mong muốn
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Element 7: Tone & Style Extended */}
      <Card>
        <CardHeader>
          <CardTitle>🎨 Tone & Style (Mở rộng)</CardTitle>
          <CardDescription>
            <strong>Yếu tố 7:</strong> Các tùy chọn nâng cao về giọng điệu và phong cách
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="formality">Formality (Tính trang trọng)</Label>
              <Select
                value={formData.config.formality}
                onValueChange={(value: any) =>
                  updateFormData({
                    config: { ...formData.config, formality: value },
                  })
                }
              >
                <SelectTrigger id="formality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="formal">Formal (Trang trọng)</SelectItem>
                  <SelectItem value="neutral">Neutral (Trung lập)</SelectItem>
                  <SelectItem value="informal">Informal (Thân mật)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="perspective">Perspective (Góc nhìn)</Label>
              <Select
                value={formData.config.perspective}
                onValueChange={(value: any) =>
                  updateFormData({
                    config: { ...formData.config, perspective: value },
                  })
                }
              >
                <SelectTrigger id="perspective">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="first_person">First Person (Tôi, mình)</SelectItem>
                  <SelectItem value="second_person">Second Person (Bạn)</SelectItem>
                  <SelectItem value="third_person">Third Person (Họ, người dùng)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emotional_tone">Emotional Tone</Label>
              <Select
                value={formData.config.emotional_tone}
                onValueChange={(value: any) =>
                  updateFormData({
                    config: { ...formData.config, emotional_tone: value },
                  })
                }
              >
                <SelectTrigger id="emotional_tone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enthusiastic">Enthusiastic (Nhiệt tình)</SelectItem>
                  <SelectItem value="balanced">Balanced (Cân bằng)</SelectItem>
                  <SelectItem value="critical">Critical (Phê bình)</SelectItem>
                  <SelectItem value="inspirational">Inspirational (Truyền cảm hứng)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="punctuation_style">Punctuation Style</Label>
              <Select
                value={formData.config.punctuation_style}
                onValueChange={(value: any) =>
                  updateFormData({
                    config: { ...formData.config, punctuation_style: value },
                  })
                }
              >
                <SelectTrigger id="punctuation_style">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="neutral">Neutral (Bình thường)</SelectItem>
                  <SelectItem value="exclamatory">Exclamatory (Nhiều dấu !)</SelectItem>
                  <SelectItem value="question-based">Question-based (Nhiều dấu ?)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Element 9: AI Parameters */}
      <Card>
        <CardHeader>
          <CardTitle>🤖 AI Parameters</CardTitle>
          <CardDescription>
            <strong>Yếu tố 9:</strong> Tham số điều chỉnh hành vi của AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Temperature</Label>
              <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                {formData.ai_parameters.temperature.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={formData.ai_parameters.temperature}
              onChange={(e) =>
                updateFormData({
                  ai_parameters: { ...formData.ai_parameters, temperature: parseFloat(e.target.value) },
                })
              }
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
            <p className="text-xs text-gray-500">
              0.0 = Chính xác, nhất quán | 1.0 = Sáng tạo, đa dạng
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_tokens">Max Tokens</Label>
            <Input
              id="max_tokens"
              type="number"
              min="100"
              max="4000"
              value={formData.ai_parameters.max_tokens}
              onChange={(e) =>
                updateFormData({
                  ai_parameters: {
                    ...formData.ai_parameters,
                    max_tokens: parseInt(e.target.value) || 2048,
                  },
                })
              }
            />
            <p className="text-xs text-gray-500">
              Số lượng tokens tối đa AI có thể tạo ra (1 token ≈ 0.75 từ tiếng Anh, 0.5 từ tiếng Việt)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Top P</Label>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {(formData.ai_parameters.top_p || 0.9).toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={formData.ai_parameters.top_p || 0.9}
                onChange={(e) =>
                  updateFormData({
                    ai_parameters: { ...formData.ai_parameters, top_p: parseFloat(e.target.value) },
                  })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500">Giới hạn phạm vi từ vựng</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Frequency Penalty</Label>
                <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                  {(formData.ai_parameters.frequency_penalty || 0).toFixed(1)}
                </span>
              </div>
              <input
                type="range"
                min="-2"
                max="2"
                step="0.1"
                value={formData.ai_parameters.frequency_penalty || 0}
                onChange={(e) =>
                  updateFormData({
                    ai_parameters: { ...formData.ai_parameters, frequency_penalty: parseFloat(e.target.value) },
                  })
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <p className="text-xs text-gray-500">Giảm lặp từ</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Element 8: Feedback Loop */}
      <Card>
        <CardHeader>
          <CardTitle>🔄 Feedback Loop</CardTitle>
          <CardDescription>
            <strong>Yếu tố 8:</strong> Hướng dẫn AI tự kiểm tra và cải thiện kết quả
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="feedback_instructions"
            placeholder="VD: Sau khi tạo nội dung, hãy tự kiểm tra xem đã đáp ứng đủ các yêu cầu chưa: Có đủ emoji chưa? Có CTA mạnh mẽ chưa? Độ dài có phù hợp chưa?"
            rows={3}
            value={formData.feedback_instructions}
            onChange={(e) => updateFormData({ feedback_instructions: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Element 10: Additional Notes */}
      <Card>
        <CardHeader>
          <CardTitle>📝 Ghi chú bổ sung</CardTitle>
          <CardDescription>
            <strong>Yếu tố 10:</strong> Thông tin thêm, tips, tricks, ưu tiên
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            id="additional_notes"
            placeholder="VD: Luôn kết thúc bằng CTA mạnh. Ưu tiên sử dụng từ đơn giản, dễ hiểu. Tham khảo phong cách của kênh XYZ..."
            rows={4}
            value={formData.additional_notes}
            onChange={(e) => updateFormData({ additional_notes: e.target.value })}
          />
        </CardContent>
      </Card>
    </div>
  );
}
