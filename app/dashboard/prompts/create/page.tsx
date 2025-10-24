'use client';

import { TemplateBuilder } from '@/components/templates/TemplateBuilder';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

function CreatePromptPage() {
  const router = useRouter();

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Back button and header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/prompts')}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại danh sách
        </Button>

        <h1 className="text-3xl font-bold text-gray-900">Tạo Prompt Template Mới</h1>
        <p className="text-gray-600 mt-2">
          Tạo prompt template tùy chỉnh với 10 yếu tố chất lượng để sử dụng cho các reviews sau này
        </p>
      </div>

      {/* Template Builder */}
      <TemplateBuilder redirectPath="/dashboard/prompts" />
    </div>
  );
}

export default withUserRoute(CreatePromptPage);
