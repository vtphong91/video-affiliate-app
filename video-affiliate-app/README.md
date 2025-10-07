# Video Affiliate Marketing Web App

Tạo landing page review tự động từ video YouTube/TikTok với AI, tích hợp affiliate links và đăng lên Facebook.

## 🎯 Tính Năng

- ✅ Phân tích video YouTube/TikTok tự động với AI
- ✅ Tạo landing page review chuyên nghiệp
- ✅ Chỉnh sửa nội dung AI-generated
- ✅ Tích hợp affiliate links (Shopee, Lazada, Tiki, v.v.)
- ✅ Đăng tự động lên Facebook Page
- ✅ Theo dõi views, clicks, conversions
- ✅ SEO-friendly URLs
- ✅ Mobile responsive

## 🏗️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **AI:** OpenAI GPT-4 / Anthropic Claude
- **APIs:** YouTube Data API v3, Facebook Graph API
- **Deployment:** Vercel

## 📋 Yêu Cầu

- Node.js 18+
- npm/yarn/pnpm
- Supabase account
- OpenAI API key hoặc Anthropic API key
- YouTube Data API v3 key
- Facebook Page (optional)

## 🚀 Cài Đặt

### 1. Clone repository

```bash
cd video-affiliate-app
npm install
```

### 2. Cấu hình Environment Variables

Tạo file `.env.local`:

```env
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI - Chọn một trong hai
OPENAI_API_KEY=your_openai_key
# HOẶC
ANTHROPIC_API_KEY=your_anthropic_key

# YouTube
YOUTUBE_API_KEY=your_youtube_api_key

# Facebook (Optional)
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_app_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Setup Database

Chạy SQL script trong file `lib/db/schema.sql` trên Supabase:

```bash
# Truy cập Supabase Dashboard > SQL Editor
# Copy và chạy nội dung file lib/db/schema.sql
```

### 4. Chạy Development Server

```bash
npm run dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📖 Hướng Dẫn Sử Dụng

### Tạo Review Mới

1. Truy cập `/dashboard/create`
2. Nhập link YouTube hoặc TikTok
3. Nhấn "Phân tích" - AI sẽ tự động:
   - Lấy thông tin video
   - Phân tích nội dung
   - Tạo summary, pros/cons, key points
   - Gợi ý SEO keywords
4. Chỉnh sửa nội dung nếu cần
5. Thêm affiliate links
6. Lưu và chia sẻ

### Đăng Lên Facebook

1. Cấu hình Facebook Page ID và Access Token trong Settings
2. Sau khi tạo review, chọn tab "Đăng Facebook"
3. Chỉnh sửa message
4. Nhấn "Đăng Lên Facebook"

## 🔑 Lấy API Keys

### YouTube Data API v3

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới
3. Enable "YouTube Data API v3"
4. Tạo credentials (API Key)
5. Copy API key vào `.env.local`

### OpenAI API

1. Truy cập [OpenAI Platform](https://platform.openai.com/)
2. Tạo account và add payment method
3. Tạo API key tại API Keys section
4. Copy vào `.env.local`

### Anthropic Claude API

1. Truy cập [Anthropic Console](https://console.anthropic.com/)
2. Tạo account
3. Tạo API key
4. Copy vào `.env.local`

### Facebook Graph API

1. Truy cập [Facebook Developers](https://developers.facebook.com/)
2. Tạo app mới
3. Add Facebook Page
4. Lấy Page Access Token với quyền `pages_manage_posts`
5. Copy Page ID và Access Token vào Settings

## 📁 Cấu Trúc Dự Án

```
video-affiliate-app/
├── app/
│   ├── (landing)/review/[slug]/     # Public landing pages
│   ├── dashboard/                    # Dashboard UI
│   ├── api/                          # API routes
│   └── page.tsx                      # Homepage
├── components/
│   ├── ui/                           # Shadcn components
│   ├── VideoAnalyzer.tsx             # Video input & analysis
│   ├── AIContentEditor.tsx           # Content editor
│   ├── ReviewPreview.tsx             # Preview component
│   └── FacebookPoster.tsx            # Facebook posting
├── lib/
│   ├── ai/                           # AI integrations
│   ├── apis/                         # External APIs
│   ├── db/                           # Database client
│   └── utils.ts                      # Utilities
└── types/
    └── index.ts                      # TypeScript types
```

## 🎨 Customization

### Thêm Nền Tảng Affiliate Mới

Edit `components/AIContentEditor.tsx` và thêm options:

```typescript
const platforms = ['Shopee', 'Lazada', 'Tiki', 'Your Platform'];
```

### Tùy Chỉnh AI Prompts

Edit `lib/ai/prompts.ts`:

```typescript
export function generateAnalysisPrompt(videoInfo: VideoInfo): string {
  // Customize prompt here
}
```

### Thay Đổi Theme Colors

Edit `tailwind.config.ts`:

```typescript
colors: {
  primary: "...",
  secondary: "...",
}
```

## 🐛 Troubleshooting

### Error: "YouTube API key not configured"

- Kiểm tra file `.env.local`
- Đảm bảo `YOUTUBE_API_KEY` đã được set
- Restart dev server

### Error: "No AI API key configured"

- Cần set ít nhất một trong hai: `OPENAI_API_KEY` hoặc `ANTHROPIC_API_KEY`

### Video embed không hiển thị

- Kiểm tra video có public không
- Thử đổi sang video khác

### Database errors

- Kiểm tra Supabase connection
- Verify đã chạy migration script
- Check RLS policies

## 📝 TODO / Roadmap

- [ ] Authentication (Supabase Auth)
- [ ] Multiple users support
- [ ] Analytics dashboard with charts
- [ ] Scheduled Facebook posts
- [ ] TikTok API integration (hiện tại chỉ placeholder)
- [ ] Export reviews to PDF
- [ ] Bulk import videos
- [ ] A/B testing for landing pages
- [ ] Email notifications

## 🤝 Contributing

Pull requests are welcome!

## 📄 License

MIT License

## 🙏 Credits

- [Next.js](https://nextjs.org/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/)
- [OpenAI](https://openai.com/)
- [Anthropic](https://anthropic.com/)

## 📧 Support

Nếu có vấn đề, tạo issue trên GitHub hoặc liên hệ qua email.

---

Made with ❤️ by [Your Name]
