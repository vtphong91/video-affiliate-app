'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, X } from 'lucide-react';
import type { AIAnalysis, AffiliateLink } from '@/types';

interface AIContentEditorProps {
  analysis: AIAnalysis;
  onChange: (updates: Partial<AIAnalysis>) => void;
  affiliateLinks: AffiliateLink[];
  onAffiliateLinksChange: (links: AffiliateLink[]) => void;
}

export function AIContentEditor({
  analysis,
  onChange,
  affiliateLinks,
  onAffiliateLinksChange,
}: AIContentEditorProps) {
  const [newAffiliateLink, setNewAffiliateLink] = useState<AffiliateLink>({
    platform: '',
    url: '',
    price: '',
  });

  const handleAddAffiliateLink = () => {
    if (newAffiliateLink.platform && newAffiliateLink.url) {
      onAffiliateLinksChange([...affiliateLinks, newAffiliateLink]);
      setNewAffiliateLink({ platform: '', url: '', price: '' });
    }
  };

  const handleRemoveAffiliateLink = (index: number) => {
    onAffiliateLinksChange(affiliateLinks.filter((_, i) => i !== index));
  };

  const handleArrayItemChange = (
    field: 'pros' | 'cons' | 'targetAudience' | 'seoKeywords',
    index: number,
    value: string
  ) => {
    const newArray = [...analysis[field]];
    newArray[index] = value;
    onChange({ [field]: newArray });
  };

  const handleArrayItemAdd = (
    field: 'pros' | 'cons' | 'targetAudience' | 'seoKeywords'
  ) => {
    onChange({ [field]: [...analysis[field], ''] });
  };

  const handleArrayItemRemove = (
    field: 'pros' | 'cons' | 'targetAudience' | 'seoKeywords',
    index: number
  ) => {
    onChange({ [field]: analysis[field].filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            Chỉnh Sửa Nội Dung AI
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Summary */}
          <div className="space-y-2">
            <Label htmlFor="summary">Tóm Tắt</Label>
            <Textarea
              id="summary"
              value={analysis.summary}
              onChange={(e) => onChange({ summary: e.target.value })}
              rows={4}
              placeholder="Tóm tắt ngắn gọn về sản phẩm..."
            />
          </div>

          {/* Pros */}
          <div className="space-y-2">
            <Label>Ưu Điểm ({analysis.pros.length})</Label>
            <div className="space-y-2">
              {analysis.pros.map((pro, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={pro}
                    onChange={(e) =>
                      handleArrayItemChange('pros', index, e.target.value)
                    }
                    placeholder={`Ưu điểm ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleArrayItemRemove('pros', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleArrayItemAdd('pros')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm ưu điểm
              </Button>
            </div>
          </div>

          {/* Cons */}
          <div className="space-y-2">
            <Label>Nhược Điểm ({analysis.cons.length})</Label>
            <div className="space-y-2">
              {analysis.cons.map((con, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={con}
                    onChange={(e) =>
                      handleArrayItemChange('cons', index, e.target.value)
                    }
                    placeholder={`Nhược điểm ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleArrayItemRemove('cons', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleArrayItemAdd('cons')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm nhược điểm
              </Button>
            </div>
          </div>

          {/* Target Audience */}
          <div className="space-y-2">
            <Label>Đối Tượng Phù Hợp ({analysis.targetAudience.length})</Label>
            <div className="space-y-2">
              {analysis.targetAudience.map((audience, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={audience}
                    onChange={(e) =>
                      handleArrayItemChange('targetAudience', index, e.target.value)
                    }
                    placeholder={`Đối tượng ${index + 1}`}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleArrayItemRemove('targetAudience', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleArrayItemAdd('targetAudience')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Thêm đối tượng
              </Button>
            </div>
          </div>

          {/* CTA */}
          <div className="space-y-2">
            <Label htmlFor="cta">Call to Action</Label>
            <Textarea
              id="cta"
              value={analysis.cta}
              onChange={(e) => onChange({ cta: e.target.value })}
              rows={2}
              placeholder="Lời kêu gọi hành động hấp dẫn..."
            />
          </div>

          {/* SEO Keywords */}
          <div className="space-y-2">
            <Label>Từ Khóa SEO</Label>
            <div className="flex flex-wrap gap-2">
              {analysis.seoKeywords.map((keyword, index) => (
                <Badge key={index} variant="secondary" className="gap-1">
                  {keyword}
                  <button
                    onClick={() => handleArrayItemRemove('seoKeywords', index)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affiliate Links */}
      <Card>
        <CardHeader>
          <CardTitle>Link Affiliate</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {affiliateLinks.map((link, index) => (
            <div
              key={index}
              className="flex gap-2 items-start p-3 bg-gray-50 rounded-lg"
            >
              <div className="flex-1 space-y-2">
                <div className="font-medium">{link.platform}</div>
                <div className="text-sm text-gray-600 truncate">{link.url}</div>
                {link.price && (
                  <div className="text-sm font-bold text-green-600">
                    {link.price}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveAffiliateLink(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}

          <div className="space-y-2 p-3 border rounded-lg">
            <div className="space-y-2">
              <Input
                placeholder="Tên nền tảng (VD: Shopee, Lazada, Tiki)"
                value={newAffiliateLink.platform}
                onChange={(e) =>
                  setNewAffiliateLink({ ...newAffiliateLink, platform: e.target.value })
                }
              />
              <Input
                placeholder="Link affiliate"
                value={newAffiliateLink.url}
                onChange={(e) =>
                  setNewAffiliateLink({ ...newAffiliateLink, url: e.target.value })
                }
              />
              <Input
                placeholder="Giá (VD: 599.000đ)"
                value={newAffiliateLink.price}
                onChange={(e) =>
                  setNewAffiliateLink({ ...newAffiliateLink, price: e.target.value })
                }
              />
            </div>
            <Button onClick={handleAddAffiliateLink} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Thêm Link
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
