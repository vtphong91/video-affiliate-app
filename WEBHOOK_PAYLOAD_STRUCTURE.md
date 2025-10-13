# WEBHOOK PAYLOAD STRUCTURE - STANDARDIZED

## Complete Webhook Payload Fields (Chuẩn hóa cho cả Cron Auto và Facebook Post)

```typescript
interface WebhookPayload {
  // Core schedule data
  scheduleId: string;
  reviewId: string;
  targetType: string;
  targetId: string;
  targetName: string;
  message: string;            // post_message from schedule
  link: string;               // landing_page_url (legacy field)
  landing_page_url: string;   // landing_page_url (new explicit field)
  imageUrl: string;           // video_thumbnail
  videoUrl: string;           // video_url
  videoTitle: string;        // video_title
  channelName: string;        // channel_name
  
  // Review content (for Make.com processing)
  affiliateLinksText: string;        // Formatted text: "ĐẶT MUA SẢN PHẨM VỚI GIÁ TỐT TẠI:\n- platform url - price"
  reviewSummary: string;
  reviewPros: string[];
  reviewCons: string[];
  reviewKeyPoints: string[];
  reviewTargetAudience: string[];
  reviewCta: string;
  review_seo_keywords: string[];      // single field for SEO keywords
  
  // Metadata
  scheduledFor: string;       // Original scheduled time
  triggeredAt: string;        // When cron processed it
  retryAttempt: number;       // Current retry count
}
```

## Field Mapping Summary

| **Schedule Field** | **Webhook Field** | **Purpose** |
|-------------------|-------------------|-------------|
| `id` | `scheduleId` | Unique identifier |
| `review_id` | `reviewId` | Review reference |
| `target_type` | `targetType` | Target type |
| `target_id` | `targetId` | Target ID |
| `target_name` | `targetName` | Target name |
| `post_message` | `message` | Full post content |
| `landing_page_url` | `landing_page_url` | Landing URL |
| `video_thumbnail` | `imageUrl` | Post image |
| `video_url` | `videoUrl` | Video link |
| `video_title` | `videoTitle` | Post title |
| `channel_name` | `channelName` | Copyright |
| `affiliate_links` | `affiliateLinks` | Affiliate data |
| `review_summary` | `reviewSummary` | Content data |
| `review_pros` | `reviewPros` | Content data |
| `review_cons` | `reviewCons` | Content data |
| `review_key_points` | `reviewKeyPoints` | Content data |
| `review_target_audience` | `reviewTargetAudience` | Content data |
| `review_cta` | `reviewCta` | Content data |
| `review_seo_keywords` | `review_seo_keywords` | Content data |
| `scheduled_for` | `scheduledFor` | Original time |
| `retry_count` | `retryAttempt` | Retry count |

## Notes

- **`landing_page_url`** là trường duy nhất cho landing URL
- **`review_seo_keywords`** là trường duy nhất cho SEO keywords
- **`affiliateLinksText`** là formatted text: "ĐẶT MUA SẢN PHẨM VỚI GIÁ TỐT TẠI:\n- platform url - price"
- **Cron Auto** và **Facebook Post** đều sử dụng cùng cấu trúc webhook payload
- Make.com sẽ nhận được dữ liệu không trùng lặp và rõ ràng
- Tương thích với cả scheduled posts và manual posts
- **Affiliate Links được lưu dạng TEXT trong schedules table** - dễ xử lý webhook
- **Affiliate Links KHÔNG hiển thị trong UI schedules** - chỉ gửi qua webhook
- **Post message KHÔNG chứa video URL** - chỉ có title, summary, pros, cons, target audience, hashtags
- **Copyright format:** "⚖️Nội dung Video thuộc về kênh {channelName} - Mọi thông tin về sản phẩm được tham khảo từ video. Bản quyền thuộc về kênh gốc."
