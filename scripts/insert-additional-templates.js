/**
 * Script to insert 5 additional system templates
 * Run: node scripts/insert-additional-templates.js
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const templates = [
  // 1. COMPARISON TEMPLATE
  {
    name: 'So Sánh Sản Phẩm (Comparison)',
    category: 'comparison',
    platform: 'facebook',
    description: 'Template để tạo nội dung so sánh 2 sản phẩm cùng loại, giúp người đọc đưa ra quyết định mua hàng sáng suốt.',
    prompt_template: `Bạn đang phân tích một video so sánh sản phẩm để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Phân tích So Sánh:**
   - Xác định 2 sản phẩm được so sánh
   - Tiêu chí so sánh (giá, tính năng, hiệu suất, thiết kế, v.v.)
   - Điểm mạnh/yếu của từng sản phẩm
   - Kết luận: Sản phẩm nào phù hợp với đối tượng nào

2. **Tone và Style:**
   - Tone: {{tone}}
   - Ngôn ngữ: {{language}}
   - Độ dài: {{length}}
   - Khách quan, cân bằng, không thiên vị

3. **Comparison Table:**
   - Tạo bảng so sánh rõ ràng
   - Highlight điểm khác biệt quan trọng
   - Đánh giá từng tiêu chí

4. **Recommendation:**
   - Đưa ra khuyến nghị dựa trên use case
   - Giải thích tại sao chọn sản phẩm này vs sản phẩm kia

🎨 OUTPUT (JSON):

{
  "comparison_title": "Tiêu đề so sánh hấp dẫn",
  "products": [
    {
      "name": "Tên sản phẩm 1",
      "brand": "Thương hiệu",
      "price_range": "Giá",
      "key_features": ["Tính năng 1", "Tính năng 2"],
      "affiliate_link": ""
    }
  ],
  "comparison_criteria": [
    {
      "criterion": "Giá cả",
      "product1_score": "8/10",
      "product2_score": "6/10",
      "winner": "Sản phẩm 1",
      "explanation": "Giải thích"
    }
  ],
  "summary": "Tóm tắt ngắn gọn về so sánh",
  "product1_pros": ["Ưu điểm 1", "Ưu điểm 2"],
  "product1_cons": ["Nhược điểm 1"],
  "product2_pros": ["Ưu điểm 1"],
  "product2_cons": ["Nhược điểm 1"],
  "recommendation": {
    "best_for_budget": "Sản phẩm X vì...",
    "best_for_performance": "Sản phẩm Y vì..."
  },
  "final_verdict": "Kết luận tổng quan",
  "cta": "Lời kêu gọi hành động",
  "target_audience": ["Đối tượng 1", "Đối tượng 2"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`,
    variables: {
      videoTitle: 'Tiêu đề video',
      videoDescription: 'Mô tả video',
      channelName: 'Tên kênh',
      platform: 'Nền tảng',
      transcript: 'Nội dung video',
      tone: 'Giọng điệu (casual, professional, friendly)',
      language: 'Ngôn ngữ (vi, en)',
      length: 'Độ dài (short, medium, long)',
    },
    is_system: true,
    is_public: true,
    is_active: true,
    version: '2.0',
  },

  // 2. UNBOXING TEMPLATE
  {
    name: 'Unboxing - Mở Hộp Trải Nghiệm',
    category: 'unboxing',
    platform: 'facebook',
    description: 'Template để tạo nội dung unboxing/mở hộp sản phẩm, chia sẻ first impression và trải nghiệm ban đầu.',
    prompt_template: `Bạn đang phân tích một video unboxing để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Mô tả: {{videoDescription}}
- Kênh: {{channelName}}
- Platform: {{platform}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU TẠO NỘI DUNG:

1. **Unboxing Experience:**
   - First impression về bao bì
   - Nội dung trong hộp (what's in the box)
   - Chất lượng packaging
   - Phụ kiện đi kèm
   - Build quality và materials

2. **First Impressions:**
   - Cảm nhận ban đầu về sản phẩm
   - Design và aesthetics
   - So sánh với kỳ vọng

3. **Tone:** {{tone}}, Ngôn ngữ: {{language}}, Độ dài: {{length}}

🎨 OUTPUT (JSON):

{
  "unboxing_title": "Tiêu đề unboxing hấp dẫn",
  "product_info": {
    "name": "Tên sản phẩm",
    "brand": "Thương hiệu",
    "price": "Giá",
    "affiliate_link": ""
  },
  "packaging": {
    "box_quality": "Đánh giá chất lượng hộp",
    "first_impression": "Ấn tượng đầu tiên"
  },
  "whats_in_the_box": [
    {
      "item": "Sản phẩm chính",
      "description": "Mô tả",
      "timestamp": "00:00"
    }
  ],
  "first_impressions": {
    "design": "Đánh giá thiết kế",
    "build_quality": "Đánh giá chất lượng"
  },
  "highlights": ["Điểm nổi bật 1"],
  "concerns": ["Điểm cần lưu ý"],
  "summary": "Tóm tắt unboxing experience",
  "cta": "Lời kêu gọi hành động",
  "target_audience": ["Đối tượng 1"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`,
    variables: {
      videoTitle: 'Tiêu đề video',
      videoDescription: 'Mô tả video',
      channelName: 'Tên kênh',
      platform: 'Nền tảng',
      transcript: 'Nội dung video',
      tone: 'Giọng điệu (casual, professional, friendly)',
      language: 'Ngôn ngữ (vi, en)',
      length: 'Độ dài (short, medium, long)',
    },
    is_system: true,
    is_public: true,
    is_active: true,
    version: '2.0',
  },

  // 3. COOKING TUTORIAL
  {
    name: 'Hướng Dẫn Nấu Ăn (Cooking Tutorial)',
    category: 'cooking-tutorial',
    platform: 'facebook',
    description: 'Template chuyên biệt cho video hướng dẫn nấu ăn, công thức món ăn với tích hợp sản phẩm nguyên liệu.',
    prompt_template: `Bạn đang phân tích một video hướng dẫn nấu ăn để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU:

1. Recipe với nguyên liệu chi tiết
2. Các bước nấu rõ ràng
3. Mẹo và lỗi thường gặp
4. Tone: {{tone}}, Ngôn ngữ: {{language}}

🎨 OUTPUT (JSON):

{
  "recipe_title": "Tên món ăn",
  "difficulty": "Dễ|Trung bình|Khó",
  "prep_time": "Thời gian chuẩn bị",
  "cook_time": "Thời gian nấu",
  "servings": "Khẩu phần",
  "ingredients": [
    {
      "category": "Nguyên liệu chính",
      "items": [
        {
          "name": "Tên nguyên liệu",
          "quantity": "Khối lượng",
          "affiliate_link": ""
        }
      ]
    }
  ],
  "steps": [
    {
      "step_number": 1,
      "title": "Tiêu đề bước",
      "instruction": "Hướng dẫn",
      "tips": ["Mẹo"]
    }
  ],
  "cooking_tips": ["Mẹo chung"],
  "common_mistakes": [
    {
      "mistake": "Lỗi",
      "how_to_avoid": "Cách tránh"
    }
  ],
  "summary": "Tóm tắt",
  "cta": "Call-to-action",
  "target_audience": ["Đối tượng"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`,
    variables: {
      videoTitle: 'Tiêu đề video',
      videoDescription: 'Mô tả video',
      channelName: 'Tên kênh',
      platform: 'Nền tảng',
      transcript: 'Nội dung video',
      tone: 'Giọng điệu',
      language: 'Ngôn ngữ (vi, en)',
      length: 'Độ dài',
    },
    is_system: true,
    is_public: true,
    is_active: true,
    version: '2.0',
  },

  // 4. TECH TUTORIAL
  {
    name: 'Hướng Dẫn Công Nghệ (Tech Tutorial)',
    category: 'tech-tutorial',
    platform: 'facebook',
    description: 'Template cho video hướng dẫn công nghệ: setup, troubleshooting, tips & tricks.',
    prompt_template: `Bạn đang phân tích một video hướng dẫn công nghệ để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU:

1. Mục tiêu và requirements
2. Step-by-step hướng dẫn
3. Troubleshooting tips
4. Tone: {{tone}}, Ngôn ngữ: {{language}}

🎨 OUTPUT (JSON):

{
  "tutorial_title": "Tiêu đề tech tutorial",
  "tutorial_type": "Setup|Troubleshooting|Tips & Tricks",
  "goal": "Mục tiêu",
  "difficulty": "Beginner|Intermediate|Advanced",
  "estimated_time": "Thời gian",
  "requirements": {
    "hardware": [
      {
        "item": "Thiết bị",
        "recommended_product": "Sản phẩm khuyến nghị",
        "affiliate_link": ""
      }
    ],
    "software": [
      {
        "name": "Phần mềm",
        "version": "Phiên bản"
      }
    ]
  },
  "steps": [
    {
      "step_number": 1,
      "title": "Tiêu đề",
      "instruction": "Hướng dẫn",
      "tips": ["Mẹo"]
    }
  ],
  "troubleshooting": [
    {
      "problem": "Vấn đề",
      "solution": "Giải pháp"
    }
  ],
  "summary": "Tóm tắt",
  "cta": "Call-to-action",
  "target_audience": ["Đối tượng"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`,
    variables: {
      videoTitle: 'Tiêu đề video',
      videoDescription: 'Mô tả video',
      channelName: 'Tên kênh',
      platform: 'Nền tảng',
      transcript: 'Nội dung video',
      tone: 'Giọng điệu',
      language: 'Ngôn ngữ (vi, en)',
      length: 'Độ dài',
    },
    is_system: true,
    is_public: true,
    is_active: true,
    version: '2.0',
  },

  // 5. BEAUTY TUTORIAL
  {
    name: 'Hướng Dẫn Làm Đẹp (Beauty Tutorial)',
    category: 'beauty-tutorial',
    platform: 'facebook',
    description: 'Template cho video hướng dẫn makeup, skincare, haircare với tích hợp sản phẩm mỹ phẩm.',
    prompt_template: `Bạn đang phân tích một video hướng dẫn làm đẹp để tạo nội dung cho Facebook.

📹 THÔNG TIN VIDEO:
- Tiêu đề: {{videoTitle}}
- Nội dung: {{transcript}}

🎯 YÊU CẦU:

1. Look/style cụ thể
2. Sản phẩm sử dụng
3. Step-by-step hướng dẫn
4. Tone: {{tone}}, Ngôn ngữ: {{language}}

🎨 OUTPUT (JSON):

{
  "tutorial_title": "Tiêu đề beauty tutorial",
  "tutorial_type": "Makeup|Skincare|Haircare",
  "look_style": "Tên look/style",
  "occasion": "Dịp sử dụng",
  "difficulty": "Dễ|Trung bình|Khó",
  "estimated_time": "Thời gian",
  "products_used": [
    {
      "category": "Skincare|Makeup",
      "items": [
        {
          "product_name": "Tên sản phẩm",
          "brand": "Thương hiệu",
          "why_this_product": "Lý do chọn",
          "affiliate_link": ""
        }
      ]
    }
  ],
  "main_steps": [
    {
      "step_number": 1,
      "title": "Tiêu đề",
      "instruction": "Hướng dẫn",
      "tips": ["Mẹo"]
    }
  ],
  "pro_tips": ["Mẹo chuyên nghiệp"],
  "common_mistakes": [
    {
      "mistake": "Lỗi",
      "how_to_avoid": "Cách tránh"
    }
  ],
  "summary": "Tóm tắt",
  "cta": "Call-to-action",
  "target_audience": ["Đối tượng"],
  "seo_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`,
    variables: {
      videoTitle: 'Tiêu đề video',
      videoDescription: 'Mô tả video',
      channelName: 'Tên kênh',
      platform: 'Nền tảng',
      transcript: 'Nội dung video',
      tone: 'Giọng điệu',
      language: 'Ngôn ngữ (vi, en)',
      length: 'Độ dài',
    },
    is_system: true,
    is_public: true,
    is_active: true,
    version: '2.0',
  },
];

async function insertTemplates() {
  console.log('🚀 Starting template insertion...\n');

  for (const template of templates) {
    console.log(`📝 Inserting: ${template.name}`);

    const { data, error } = await supabaseAdmin.from('templates').insert(template).select();

    if (error) {
      console.error(`❌ Error inserting ${template.name}:`, error.message);
    } else {
      console.log(`✅ Success: ${template.name} (ID: ${data[0].id})\n`);
    }
  }

  console.log('📊 Fetching summary...\n');

  const { data: summary, error: summaryError } = await supabaseAdmin
    .from('templates')
    .select('category, name, is_system, is_active')
    .eq('is_system', true)
    .eq('is_active', true)
    .order('category');

  if (summaryError) {
    console.error('❌ Error fetching summary:', summaryError);
  } else {
    console.log('📋 All System Templates:');
    console.log('========================');

    const grouped = {};
    summary.forEach((t) => {
      if (!grouped[t.category]) {
        grouped[t.category] = [];
      }
      grouped[t.category].push(t.name);
    });

    Object.keys(grouped)
      .sort()
      .forEach((category) => {
        console.log(`\n${category}:`);
        grouped[category].forEach((name) => {
          console.log(`  - ${name}`);
        });
      });

    console.log(`\n📊 Total: ${summary.length} system templates`);
  }
}

insertTemplates()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
