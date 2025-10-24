'use client';

import { TemplateBuilder } from '@/components/templates/TemplateBuilder';
import { withUserRoute } from '@/lib/auth/middleware/route-protection';

function CreateTemplatePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Tạo Template Mới</h1>
        <p className="text-gray-600 mt-2">
          Tạo prompt template tùy chỉnh với 10 yếu tố chất lượng
        </p>
      </div>

      <TemplateBuilder />
    </div>
  );
}

export default withUserRoute(CreateTemplatePage);
