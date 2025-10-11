# 🧹 QUY TẮC DỌN DẸP PROJECT

## ⚠️ **NGUYÊN TẮC QUAN TRỌNG**
**KHÔNG BAO GIỜ XÓA CÁC FILE/FOLDER SAU:**
- `lib/utils/` - Chứa các utility functions quan trọng
- `components/ui/` - UI components cơ bản
- `types/` - Type definitions
- `lib/db/` - Database functions
- `lib/auth/` - Authentication logic
- `lib/services/` - Business logic services
- `lib/ai/` - AI integration
- `lib/apis/` - External API integrations

## 📁 **CẤU TRÚC FOLDER CHO DEVELOPMENT**

### **1. Test Files**
```
__tests__/                    # Unit tests
├── auth/
├── components/
├── api/
└── utils/

tests/                        # Integration tests
├── e2e/
├── api/
└── components/

test-data/                    # Test data files
├── fixtures/
├── mocks/
└── samples/
```

### **2. Debug Files**
```
debug/                        # Debug utilities
├── components/
│   ├── DebugInfo.tsx
│   └── DebugPanel.tsx
├── utils/
│   ├── debug-helpers.ts
│   └── logger.ts
└── pages/
    ├── debug-auth/
    └── debug-db/

dev-tools/                    # Development tools
├── scripts/
├── generators/
└── analyzers/
```

### **3. SQL Scripts**
```
sql/                          # Database scripts
├── migrations/
│   ├── 001_initial.sql
│   ├── 002_auth_tables.sql
│   └── 003_schedules.sql
├── seeds/
│   ├── test-users.sql
│   └── sample-data.sql
├── backups/
└── utilities/
    ├── reset-db.sql
    └── cleanup.sql
```

### **4. Documentation**
```
docs/                         # Project documentation
├── api/
├── deployment/
├── troubleshooting/
└── guides/

temp/                         # Temporary files
├── logs/
├── exports/
└── cache/
```

## 🗑️ **QUY TẮC XÓA FILE**

### **✅ ĐƯỢC PHÉP XÓA:**
- Files trong `temp/`
- Files trong `debug/` (chỉ khi không còn import)
- Files trong `test-data/`
- Files backup cũ (`*.backup`, `*.old`)
- Log files (`*.log`)
- Cache files (`*.cache`, `.next/`)
- Node modules (`node_modules/`)

### **❌ KHÔNG ĐƯỢC XÓA:**
- Files trong `lib/` (trừ debug)
- Files trong `components/ui/`
- Files trong `types/`
- API routes (`app/api/`)
- Pages (`app/*/page.tsx`)
- Configuration files (`*.config.*`)

## 🔍 **QUY TRÌNH DỌN DẸP AN TOÀN**

### **Bước 1: Kiểm tra dependencies**
```bash
# Tìm tất cả imports của file/folder muốn xóa
grep -r "import.*from.*'@/path/to/file'" .
grep -r "require.*path/to/file" .
```

### **Bước 2: Backup quan trọng**
```bash
# Backup trước khi xóa
cp -r important-folder/ backup/important-folder-$(date +%Y%m%d)
```

### **Bước 3: Xóa từng bước**
```bash
# Xóa từng file một, không xóa cả folder
rm file1.ts
rm file2.ts
# Kiểm tra app vẫn chạy được
npm run dev
```

### **Bước 4: Test sau khi xóa**
```bash
# Chạy tests
npm test
# Chạy build
npm run build
# Kiểm tra linting
npm run lint
```

## 📝 **CHECKLIST TRƯỚC KHI XÓA**

- [ ] File có được import ở đâu không?
- [ ] File có chứa logic business quan trọng không?
- [ ] File có được sử dụng trong production không?
- [ ] Đã backup file quan trọng chưa?
- [ ] Đã test app sau khi xóa chưa?

## 🚨 **KHI GẶP LỖI SAU KHI XÓA**

1. **Khôi phục từ backup**
2. **Kiểm tra git history**: `git log --oneline`
3. **Revert commit**: `git revert <commit-hash>`
4. **Tạo lại file bị thiếu**

## 📋 **TEMPLATE CHO DEVELOPMENT FILES**

### **Debug Component Template**
```typescript
// debug/components/DebugComponent.tsx
'use client';

export function DebugComponent() {
  // Debug logic here
  return <div>Debug Info</div>;
}
```

### **Test File Template**
```typescript
// __tests__/feature.test.ts
import { describe, it, expect } from '@jest/globals';

describe('Feature', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});
```

### **SQL Script Template**
```sql
-- sql/migrations/XXX_description.sql
-- Description: What this migration does
-- Date: YYYY-MM-DD

BEGIN;

-- Migration SQL here

COMMIT;
```

## 🎯 **MỤC TIÊU**

- **Giữ project sạch sẽ** nhưng **không phá vỡ functionality**
- **Dễ dàng tìm và quản lý** các file development
- **Tránh xóa nhầm** file quan trọng
- **Có thể khôi phục** khi cần thiết
