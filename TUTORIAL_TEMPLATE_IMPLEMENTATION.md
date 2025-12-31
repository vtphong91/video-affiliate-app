# Tutorial Template Implementation Guide

## Overview

This document describes the implementation of the Tutorial/How-to template system, which extends the existing Video Affiliate App to support tutorial content with natural product placement while maintaining full compatibility with the existing reviews table and auto cron schedules system.

## Architecture

### Core Concept: Transform Pattern

Instead of creating a separate tutorials table, we use a **transformation pattern** where Tutorial-specific AI output is transformed to Review-compatible structure at save time. This ensures:

- ✅ No database schema changes
- ✅ Full compatibility with schedules system
- ✅ Cron service works unchanged
- ✅ Existing UI components work seamlessly
- ✅ Single source of truth for content

### Data Flow

```
1. User selects Tutorial template
   ↓
2. AI generates Tutorial structure (materials, steps, tips, mistakes)
   ↓
3. Transformer converts Tutorial → Review structure
   ↓
4. Save to existing reviews table (semantic mapping)
   ↓
5. Schedule creation works as before
   ↓
6. Cron service posts to Facebook via Make.com webhook
```

## Files Created/Modified

### New Files

1. **`lib/transformers/tutorial-to-review.ts`**
   - Core transformation logic
   - Type definitions for Tutorial and Review structures
   - Helper functions for detection and validation

2. **`sql/insert-tutorial-template.sql`**
   - SQL script to insert Tutorial template into database
   - Comprehensive prompt with variable substitution
   - Category set to 'tutorial' for detection

3. **`TUTORIAL_TEMPLATE_ANALYSIS.md`**
   - Design document and analysis
   - Three implementation options comparison
   - Semantic flexibility table
   - Product placement strategies

4. **`TUTORIAL_TEMPLATE_IMPLEMENTATION.md`** (this file)
   - Implementation guide
   - Usage instructions
   - Testing procedures

### Modified Files

1. **`app/api/generate-review-from-template/route.ts`**
   - Added import for transformer functions
   - Template type detection (Tutorial vs Product Review)
   - Conditional system prompts based on type
   - Transform logic for Tutorial content
   - Return affiliate links in response

## Semantic Mapping Strategy

The transformer maps Tutorial-specific fields to Review table columns using semantic flexibility:

| Reviews Column | Product Review Meaning | Tutorial Meaning | Example |
|---------------|------------------------|------------------|---------|
| `title` | Product review title | Tutorial title | "Cách làm bánh mì giòn rụm tại nhà" |
| `summary` | Product summary | Goal + metadata | "Học cách làm bánh mì \| Độ khó: Dễ \| 45 phút" |
| `pros` | Product advantages | Materials needed | "**Bột mì** (500g) - Tạo độ giòn hoàn hảo" |
| `cons` | Product disadvantages | Common mistakes | "❌ Nhào bột quá lâu → ✅ Chỉ nhào 10 phút" |
| `key_points` | Review highlights | Tutorial steps | "Bước 1: Trộn bột - Kết hợp bột và nước" |
| `custom_content` | Full review text | Full tutorial | Rich formatted markdown with all sections |
| `affiliate_links` | Product purchase links | Material purchase links | Links extracted from materials_needed |

## Tutorial AI Output Structure

When a Tutorial template is used, AI returns this structure:

```typescript
{
  tutorial_title: "Cách làm bánh mì giòn rụm tại nhà",
  goal_statement: "Học cách làm bánh mì Việt Nam chuẩn vị",
  difficulty: "Dễ",
  time_estimate: "45 phút",

  materials_needed: [
    {
      item_name: "Bột mì đa dụng",
      quantity: "500g",
      why_this_product: "Tạo độ giòn hoàn hảo cho vỏ bánh",
      affiliate_link: "https://shopee.vn/...",
      recommended_brands: ["Number 1", "Meizan"]
    }
  ],

  steps: [
    {
      step_number: 1,
      title: "Trộn bột",
      description: "Kết hợp bột mì, nước, men và muối",
      timestamp: "02:30",
      tips: ["Dùng nước ấm 40°C để men hoạt động tốt"],
      products_used: ["Bột mì đa dụng", "Men nở"]
    }
  ],

  tips_and_tricks: [
    "Để bột nghỉ đủ 1 giờ để bánh mềm"
  ],

  common_mistakes: [
    {
      mistake: "Nhào bột quá lâu",
      why_it_happens: "Nghĩ rằng nhào lâu sẽ mềm hơn",
      how_to_avoid: "Chỉ nhào 8-10 phút là đủ"
    }
  ],

  final_result: "Bánh mì vỏ giòn, ruột mềm, thơm mùi bơ",
  cta: "Hãy thử làm ngay hôm nay và chia sẻ kết quả!",
  target_audience: ["Người mới học nấu ăn", "Yêu thích làm bánh"],
  seoKeywords: ["cách làm bánh mì", "bánh mì tại nhà", "công thức bánh mì"]
}
```

## Transformation Process

The `transformTutorialToReview()` function performs these mappings:

### 1. Title Construction
```typescript
title = tutorial.tutorial_title.includes(videoData.videoTitle.substring(0, 20))
  ? tutorial.tutorial_title
  : `${tutorial.tutorial_title} - ${videoData.videoTitle}`;
```

### 2. Summary with Metadata
```typescript
summary = `${tutorial.goal_statement} | Độ khó: ${tutorial.difficulty} | Thời gian: ${tutorial.time_estimate} | Video từ: ${videoData.channelName}`;
```

### 3. Materials → Pros
```typescript
pros = tutorial.materials_needed.map(material => {
  let text = `**${material.item_name}** (${material.quantity})`;
  if (material.why_this_product) {
    text += ` - ${material.why_this_product}`;
  }
  if (material.recommended_brands?.length > 0) {
    text += ` | Thương hiệu đề xuất: ${material.recommended_brands.join(', ')}`;
  }
  return text;
});
```

### 4. Mistakes → Cons
```typescript
cons = tutorial.common_mistakes.map(mistake =>
  `❌ **${mistake.mistake}** - ${mistake.why_it_happens} → ✅ Giải pháp: ${mistake.how_to_avoid}`
);
```

### 5. Steps → Key Points
```typescript
key_points = tutorial.steps.map(step => ({
  time: step.timestamp || '00:00',
  content: `**Bước ${step.step_number}: ${step.title}** - ${step.description}${
    step.tips?.length > 0 ? ` | 💡 Mẹo: ${step.tips.join('; ')}` : ''
  }`
}));
```

### 6. Rich Custom Content
The `buildRichTutorialContent()` function creates a comprehensive markdown document with:
- Header with metadata
- Materials section with affiliate links
- Step-by-step instructions
- Tips and tricks
- Common mistakes
- Final result
- Target audience

### 7. Affiliate Links Extraction
```typescript
affiliate_links = tutorial.materials_needed
  .filter(m => m.affiliate_link)
  .map(m => m.affiliate_link!);
```

## Usage Guide

### 1. Install the Template

Run the SQL script to insert the Tutorial template:

```bash
# Connect to your Supabase database and run:
psql $SUPABASE_DATABASE_URL -f sql/insert-tutorial-template.sql
```

Or use Supabase SQL Editor:
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `sql/insert-tutorial-template.sql`
3. Execute

### 2. Use the Template

1. Navigate to `/dashboard/create-from-template`
2. Select "Tutorial/How-to với Product Placement" template
3. Paste YouTube/TikTok video URL
4. System analyzes video and extracts metadata
5. Fill in template variables (many auto-filled from video)
6. Click "Generate Content"
7. AI generates Tutorial structure
8. Transformer converts to Review structure automatically
9. Review and edit the generated content
10. Save as review (stores in `reviews` table)
11. Create schedule as normal
12. Cron posts to Facebook via Make.com

### 3. Frontend Integration

The existing `TemplateConfigForm.tsx` already supports this flow:
- Auto-fills video data
- Uses AI analysis for transcript field
- Shows progress indicator
- Validates all required fields

The `create-from-template` page handles:
- Video analysis
- Template selection
- Content generation
- Review creation

## API Endpoint Behavior

### POST `/api/generate-review-from-template`

**Request:**
```json
{
  "template_id": "uuid-of-tutorial-template",
  "videoData": {
    "videoTitle": "Cách làm bánh mì Việt Nam",
    "videoDescription": "Hướng dẫn làm bánh mì...",
    "channelName": "Nấu Ăn Pro",
    "platform": "YouTube",
    "transcript": "Video transcript or AI analysis"
  },
  "config": {
    "tone": "friendly",
    "language": "vi",
    "length": "medium",
    "affiliateLinks": ["https://shopee.vn/..."]
  }
}
```

**Response (after transformation):**
```json
{
  "success": true,
  "data": {
    "summary": "Học cách làm bánh mì | Độ khó: Dễ | 45 phút | Video từ: Nấu Ăn Pro",
    "pros": [
      "**Bột mì đa dụng** (500g) - Tạo độ giòn hoàn hảo | Thương hiệu: Number 1, Meizan"
    ],
    "cons": [
      "❌ **Nhào bột quá lâu** - Nghĩ rằng nhào lâu sẽ mềm → ✅ Giải pháp: Chỉ nhào 8-10 phút"
    ],
    "keyPoints": [
      {
        "time": "02:30",
        "content": "**Bước 1: Trộn bột** - Kết hợp bột mì, nước, men | 💡 Mẹo: Dùng nước ấm 40°C"
      }
    ],
    "mainContent": "# Cách làm bánh mì giòn rụm...\n## 🛒 Vật liệu...\n## 📋 Các bước...",
    "cta": "Hãy thử làm ngay hôm nay và chia sẻ kết quả!",
    "targetAudience": ["Người mới học nấu ăn", "Yêu thích làm bánh"],
    "seoKeywords": ["cách làm bánh mì", "bánh mì tại nhà", "công thức bánh mì"],
    "affiliateLinks": ["https://shopee.vn/..."]
  },
  "message": "Tutorial content generated and transformed successfully",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## Testing

### Unit Test Example

```typescript
import { transformTutorialToReview, isTutorialContent } from '@/lib/transformers/tutorial-to-review';

const tutorialContent = {
  tutorial_title: "Cách làm bánh mì",
  goal_statement: "Học làm bánh mì Việt Nam",
  difficulty: "Dễ" as const,
  time_estimate: "45 phút",
  materials_needed: [
    {
      item_name: "Bột mì",
      quantity: "500g",
      why_this_product: "Tạo độ giòn",
      affiliate_link: "https://shopee.vn/bot-mi"
    }
  ],
  steps: [
    {
      step_number: 1,
      title: "Trộn bột",
      description: "Kết hợp bột và nước",
      timestamp: "02:30"
    }
  ],
  tips_and_tricks: ["Để bột nghỉ 1 giờ"],
  common_mistakes: [
    {
      mistake: "Nhào quá lâu",
      why_it_happens: "Nghĩ sẽ mềm hơn",
      how_to_avoid: "Chỉ nhào 10 phút"
    }
  ],
  final_result: "Bánh mì giòn ngon",
  cta: "Thử ngay!",
  target_audience: ["Người mới"],
  seo_keywords: ["bánh mì"]
};

const videoData = {
  videoTitle: "Làm bánh mì tại nhà",
  platform: "YouTube"
};

// Test transformation
const result = transformTutorialToReview(tutorialContent, videoData);

console.assert(result.affiliate_links.length === 1);
console.assert(result.pros.length === 1);
console.assert(result.cons.length === 1);
console.assert(result.key_points.length === 1);
console.assert(result.custom_content.includes('# Cách làm bánh mì'));
```

### Integration Test

1. **Create Tutorial Template:**
   ```bash
   psql $SUPABASE_URL -f sql/insert-tutorial-template.sql
   ```

2. **Test API Endpoint:**
   ```bash
   curl -X POST http://localhost:3000/api/generate-review-from-template \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "template_id": "tutorial-template-uuid",
       "videoData": {
         "videoTitle": "Cách làm bánh mì",
         "platform": "YouTube"
       },
       "config": {
         "tone": "friendly",
         "language": "vi",
         "length": "medium"
       }
     }'
   ```

3. **Verify Response:**
   - Check `message` contains "Tutorial content generated and transformed"
   - Verify `pros` contains materials
   - Verify `cons` contains mistakes
   - Verify `affiliateLinks` array is populated

4. **Test Full Flow:**
   - Create review from tutorial content
   - Create schedule from review
   - Run manual cron: `POST /api/manual-cron`
   - Check webhook logs for successful post

## Database Verification

After saving a Tutorial as Review:

```sql
-- Check the saved tutorial review
SELECT
  id,
  title,
  summary,
  LENGTH(custom_content) as content_length,
  ARRAY_LENGTH(pros, 1) as pros_count,
  ARRAY_LENGTH(cons, 1) as cons_count,
  ARRAY_LENGTH(affiliate_links, 1) as links_count
FROM reviews
WHERE title ILIKE '%tutorial%' OR title ILIKE '%cách%'
ORDER BY created_at DESC
LIMIT 1;

-- Verify affiliate links are saved
SELECT
  title,
  affiliate_links
FROM reviews
WHERE ARRAY_LENGTH(affiliate_links, 1) > 0
ORDER BY created_at DESC
LIMIT 5;
```

## Compatibility Verification

### Schedules Table
Tutorial reviews work with schedules because they populate all required fields:

```sql
-- Verify schedule can be created from tutorial review
SELECT
  s.id,
  s.review_id,
  r.title,
  s.post_message,
  s.scheduled_for,
  s.status
FROM schedules s
JOIN reviews r ON r.id = s.review_id
WHERE r.title ILIKE '%tutorial%'
ORDER BY s.created_at DESC
LIMIT 5;
```

### Cron Service
The `buildWebhookPayload()` function in `lib/services/cron-service.ts` expects:
- `review_summary` → Comes from transformed `summary`
- `review_pros` → Comes from transformed `pros` (materials)
- `review_cons` → Comes from transformed `cons` (mistakes)
- `review_key_points` → Comes from transformed `key_points` (steps)
- `affiliate_links` → Extracted from materials

All fields are populated by the transformer, ensuring full compatibility.

## Troubleshooting

### Issue: AI returns Product Review structure for Tutorial template

**Cause:** Template detection not working correctly

**Solution:** Check template category in database:
```sql
UPDATE templates
SET category = 'tutorial'
WHERE name ILIKE '%tutorial%';
```

### Issue: Transformation not happening

**Cause:** `isTutorialContent()` validation failing

**Solution:** Check AI response structure. Must have:
- `tutorial_title`
- `goal_statement`
- `materials_needed` (array)
- `steps` (array)

Add logging:
```typescript
console.log('AI Response Keys:', Object.keys(aiResponse));
console.log('Is Tutorial Content:', isTutorialContent(aiResponse));
```

### Issue: Missing affiliate links in saved review

**Cause:** Links not provided in config or not extracted

**Solution:**
1. Ensure `affiliateLinks` is passed in config
2. Check transformer extracts links: `console.log('Extracted links:', affiliateLinks);`
3. Verify API response includes `affiliateLinks` array

### Issue: Cron posting fails for tutorial reviews

**Cause:** Webhook payload missing required fields

**Solution:** Check cron service logs for missing fields. Transformer should populate all:
```typescript
{
  reviewSummary: tutorial.summary,      // ✅
  reviewPros: tutorial.pros,            // ✅ Materials
  reviewCons: tutorial.cons,            // ✅ Mistakes
  reviewKeyPoints: tutorial.key_points, // ✅ Steps
  affiliateLinksText: "..."            // ✅ Formatted links
}
```

## Future Enhancements

1. **Tutorial-Specific Landing Page:**
   - Custom layout for tutorials (step-by-step format)
   - Interactive checklist for users
   - Video player with timestamp links

2. **Additional Tutorial Templates:**
   - Cooking recipes template
   - DIY/Crafts template
   - Tech tutorials template
   - Beauty/Makeup template

3. **Enhanced Product Matching:**
   - Auto-suggest products based on material names
   - Match with existing affiliate link database
   - Price comparison integration

4. **Tutorial Analytics:**
   - Track which steps users complete
   - A/B test different product placements
   - Measure conversion rates per material

## Conclusion

The Tutorial template system successfully extends the Video Affiliate App to support tutorial content while maintaining full compatibility with existing infrastructure. The transformation pattern ensures:

- ✅ **Zero Schema Changes** - Uses existing `reviews` table
- ✅ **Full Compatibility** - Works with schedules and cron
- ✅ **Semantic Flexibility** - Creative mapping of Tutorial → Review fields
- ✅ **Natural Product Placement** - Materials integrated as products
- ✅ **SEO Optimized** - Keywords and target audience
- ✅ **Rich Content** - Comprehensive formatted tutorials

The system is production-ready and can be deployed immediately after inserting the template SQL.
