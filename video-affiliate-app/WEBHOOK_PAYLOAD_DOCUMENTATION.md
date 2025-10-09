# 📡 WEBHOOK PAYLOAD DOCUMENTATION

## 🎯 **Webhook URL**
```
POST https://hook.us2.make.com/iyw5fzbiwydzockg9qik74vxp9mzdel1
```

## 📋 **Payload Structure**

### **Headers**
```json
{
  "Content-Type": "application/json",
  "User-Agent": "VideoAffiliateApp/1.0"
}
```

### **Body Payload**
```json
{
  // === CÁC TRƯỜNG CHÍNH THEO YÊU CẦU ===
  "noi_dung_dang": "🔥 MÁY SẤY TẠO KIỂU TÓC ENA426GRY - NÂNG TẦM PHONG CÁCH TÓC CHUẨN SALON!\n\n✨ Động cơ BLDC 100.000 vòng/phút giúp sấy tóc nhanh chóng và mượt mà\n✨ Công nghệ Ion âm giảm tĩnh điện, tóc bóng mượt tự nhiên\n✨ Thiết kế nhỏ gọn, tiện lợi mang theo khi di chuyển\n\n📺 Xem video review chi tiết: https://www.youtube.com/watch?v=Z9tyRH23fgU\n\n🔗 Đọc review đầy đủ: https://yourdomain.com/review/may-say-tao-kieu-toc-ena426gry-nang-tam-phong-cach-toc-dep-chuan-salon-123456",
  "video_url": "https://www.youtube.com/watch?v=Z9tyRH23fgU",
  "affiliate_links": [
    {
      "platform": "Shopee",
      "url": "https://shorten.asia/Xdt9g47b",
      "price": "1.501.000đ",
      "discount": "-20%"
    }
  ],
  "url_landing_page": "https://yourdomain.com/review/may-say-tao-kieu-toc-ena426gry-nang-tam-phong-cach-toc-dep-chuan-salon-123456",
  "video_thumbnail": "https://i.ytimg.com/vi/Z9tyRH23fgU/maxresdefault.jpg",
  
  // === THÔNG TIN VIDEO BỔ SUNG ===
  "video_title": "[MÁY SẤY TẠO KIỂU TÓC ENA426GRY] NÂNG TẦM PHONG CÁCH TÓC CHUẨN SALON",
  "video_description": "Video giới thiệu máy sấy tạo kiểu tóc LocknLock ENA426GRY...",
  "video_platform": "youtube",
  "video_duration": "15:30",
  "channel_name": "LocknLock Vietnam",
  "channel_url": "https://www.youtube.com/channel/UCZNyjLXfmUPk12y6bdVgn8A",
  
  // === THÔNG TIN REVIEW ===
  "review_title": "[MÁY SẤY TẠO KIỂU TÓC ENA426GRY] NÂNG TẦM PHONG CÁCH TÓC CHUẨN SALON",
  "review_summary": "Video giới thiệu máy sấy tạo kiểu tóc LocknLock ENA426GRY...",
  "review_pros": [
    "Động cơ BLDC 100.000 vòng/phút giúp sấy tóc nhanh chóng và mượt mà",
    "Công nghệ Ion âm giảm tĩnh điện, tóc bóng mượt tự nhiên",
    "Thiết kế nhỏ gọn, tiện lợi mang theo khi di chuyển"
  ],
  "review_cons": [
    "Giá thành có thể cao hơn so với các loại máy sấy thông thường"
  ],
  "review_key_points": [
    {
      "time": "00:10",
      "content": "Giới thiệu về tầm quan trọng của máy sấy tóc trong việc tạo kiểu"
    }
  ],
  "target_audience": [
    "Phụ nữ trẻ tuổi, quan tâm đến làm đẹp và chăm sóc tóc",
    "Người có nhu cầu tạo nhiều kiểu tóc khác nhau tại nhà",
    "Người thường xuyên di chuyển, cần một máy sấy nhỏ gọn, tiện lợi"
  ],
  "cta": "Nâng tầm phong cách tóc chuẩn salon ngay tại nhà với máy sấy tạo kiểu LocknLock ENA426GRY! Đặt hàng ngay hôm nay để nhận ưu đãi hấp dẫn!",
  "seo_keywords": [
    "máy sấy tóc",
    "máy sấy tạo kiểu",
    "LocknLock",
    "ENA426GRY",
    "máy sấy ion âm",
    "máy sấy tóc chuyên nghiệp",
    "máy sấy tóc giá tốt",
    "review máy sấy tóc"
  ],
  
  // === METADATA ===
  "review_id": "1660f68c-bd9c-467e-9837-afebf4952dbd",
  "review_slug": "may-say-tao-kieu-toc-ena426gry-nang-tam-phong-cach-toc-dep-chuan-salon-123456",
  "timestamp": "2025-01-08T12:49:25.401Z",
  "source": "video-affiliate-app",
  "webhook_url": "https://hook.us2.make.com/iyw5fzbiwydzockg9qik74vxp9mzdel1",
  
  // === OPTIONAL FIELDS ===
  "imageUrl": "https://i.ytimg.com/vi/Z9tyRH23fgU/maxresdefault.jpg",
  "affiliateComment": "🛒 LINK MUA HÀNG:\n\n1. Shopee: https://shorten.asia/Xdt9g47b - 1.501.000đ (-20%)",
  "secret": "your-webhook-secret-here"
}
```

## 🔧 **Make.com Scenario Setup**

### **1. Webhook Trigger**
- **Module**: Webhooks > Custom webhook
- **Method**: POST
- **URL**: `https://hook.us2.make.com/iyw5fzbiwydzockg9qik74vxp9mzdel1`

### **2. Data Mapping**
Sử dụng các trường sau trong Make.com:

#### **📝 Nội dung bài đăng**
- `noi_dung_dang` → Facebook Post Message
- `cta` → Call to Action text

#### **🎥 Video Information**
- `video_url` → Video URL
- `video_thumbnail` → Video thumbnail image
- `video_title` → Video title
- `video_description` → Video description
- `channel_name` → Channel name

#### **🔗 Affiliate Links**
- `affiliate_links` → Array of affiliate links
- `affiliateComment` → Comment with affiliate links
- `url_landing_page` → Landing page URL

#### **📊 Review Data**
- `review_title` → Review title
- `review_summary` → Review summary
- `review_pros` → Pros array
- `review_cons` → Cons array
- `target_audience` → Target audience array
- `seo_keywords` → SEO keywords array

#### **🔍 Metadata**
- `review_id` → Review ID
- `review_slug` → Review slug
- `timestamp` → Timestamp
- `source` → Source identifier

### **3. Facebook Post Module**
```json
{
  "message": "{{noi_dung_dang}}",
  "link": "{{video_url}}",
  "picture": "{{video_thumbnail}}",
  "name": "{{video_title}}",
  "description": "{{video_description}}",
  "caption": "{{channel_name}}"
}
```

### **4. Facebook Comment Module**
```json
{
  "post_id": "{{facebook_post_id}}",
  "message": "{{affiliateComment}}"
}
```

## 🎯 **Use Cases**

### **1. Facebook Page Post**
- Sử dụng `noi_dung_dang` làm nội dung chính
- `video_url` làm link video
- `video_thumbnail` làm hình ảnh
- `video_title` làm tiêu đề

### **2. Facebook Comment với Affiliate Links**
- Sử dụng `affiliateComment` để comment affiliate links
- Hoặc tự tạo comment từ `affiliate_links` array

### **3. Multiple Platform Posting**
- Sử dụng cùng data để post lên Instagram, TikTok, Twitter
- Customize message cho từng platform

### **4. Email Marketing**
- Sử dụng `review_summary`, `pros`, `cons` để tạo email content
- `target_audience` để segment email list

## 🔒 **Security**

### **Webhook Secret**
```json
{
  "secret": "your-webhook-secret-here"
}
```

### **Validation**
- Kiểm tra `source` field = "video-affiliate-app"
- Validate `timestamp` để tránh replay attacks
- Sử dụng `secret` để verify webhook authenticity

## 📈 **Analytics & Tracking**

### **Tracking Fields**
- `review_id`: Để track performance của từng review
- `review_slug`: Để track landing page visits
- `timestamp`: Để track posting time
- `source`: Để track traffic source

### **Conversion Tracking**
- Track clicks từ `affiliate_links`
- Track conversions từ `url_landing_page`
- Track engagement từ Facebook posts

## 🚀 **Testing**

### **Test Payload**
```bash
curl -X POST https://hook.us2.make.com/iyw5fzbiwydzockg9qik74vxp9mzdel1 \
  -H "Content-Type: application/json" \
  -d '{
    "noi_dung_dang": "Test message",
    "video_url": "https://www.youtube.com/watch?v=test",
    "affiliate_links": [{"platform": "Shopee", "url": "https://shopee.vn/test"}],
    "url_landing_page": "https://example.com/review/test",
    "video_thumbnail": "https://example.com/thumb.jpg",
    "review_id": "test-id",
    "timestamp": "2025-01-08T12:00:00.000Z",
    "source": "video-affiliate-app"
  }'
```

## ✅ **Success Response**
```json
{
  "success": true,
  "postId": "posted",
  "postUrl": "https://yourdomain.com/review/slug",
  "message": "Successfully sent to Make.com for posting"
}
```

## ❌ **Error Response**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```