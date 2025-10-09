# 📡 Webhook Make.com - Cấu Trúc Payload Mới

## 🎯 Tổng Quan

Webhook này được gửi từ Video Affiliate App tới Make.com để tự động đăng bài lên Facebook với các thông tin đầy đủ về review và affiliate links.

## 📋 Cấu Trúc Payload

### **Các Trường Chính (Theo Yêu Cầu)**

```json
{
  "noi_dung_dang": "string",           // Nội dung đăng lên Facebook
  "video_url": "string",               // URL đầy đủ của video YouTube/TikTok
  "affiliate_links": [                 // Danh sách affiliate links
    {
      "platform": "string",            // Tên platform (Shopee, Lazada, Tiki...)
      "url": "string",                 // Link affiliate
      "price": "string",               // Giá sản phẩm (optional)
      "discount": "string"             // Thông tin giảm giá (optional)
    }
  ],
  "url_landing_page": "string",        // URL landing page review
  "video_thumbnail": "string"          // URL thumbnail của video
}
```

### **Metadata Bổ Sung**

```json
{
  "reviewId": "string",                // ID của review trong database
  "timestamp": "string",               // Thời gian gửi webhook (ISO format)
  "source": "video-affiliate-app",     // Nguồn gửi webhook
  "imageUrl": "string",                // URL hình ảnh (optional, thường = video_thumbnail)
  "affiliateComment": "string"         // Comment affiliate (optional)
}
```

## 🔄 Flow Hoạt Động

1. **User tạo review** từ video YouTube/TikTok
2. **AI phân tích** và tạo nội dung
3. **User chỉnh sửa** và thêm affiliate links
4. **User click "Đăng lên Facebook"**
5. **App gửi webhook** tới Make.com với payload trên
6. **Make.com xử lý** và đăng bài lên Facebook
7. **Make.com trả về** post ID và URL (optional)

## 📝 Ví Dụ Payload Thực Tế

```json
{
  "noi_dung_dang": "🎥 Review Chi Tiết iPhone 16 Pro Max\n\n📱 Camera mới với zoom 5x\n⚡ Chip A18 Pro siêu mạnh\n🔋 Pin cả ngày không lo\n\n#iPhone16ProMax #Apple #TechReview",
  "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
  "affiliate_links": [
    {
      "platform": "Shopee",
      "url": "https://shopee.vn/iphone-16-pro-max-i123456789",
      "price": "29,990,000 VNĐ",
      "discount": "Giảm 500K"
    },
    {
      "platform": "Lazada", 
      "url": "https://lazada.vn/iphone-16-pro-max-o987654321",
      "price": "29,990,000 VNĐ",
      "discount": "Tặng kèm AirPods"
    }
  ],
  "url_landing_page": "https://videoaffiliate.com/review/iphone-16-pro-max-review-chi-tiet-123456",
  "video_thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "reviewId": "45e448df-d4ef-4d5d-9303-33109f9d6c30",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "source": "video-affiliate-app",
  "imageUrl": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg",
  "affiliateComment": "🛒 LINK MUA HÀNG:\n\n1. Shopee: https://shopee.vn/iphone-16-pro-max-i123456789 - 29,990,000 VNĐ (Giảm 500K)\n2. Lazada: https://lazada.vn/iphone-16-pro-max-o987654321 - 29,990,000 VNĐ (Tặng kèm AirPods)"
}
```

## ⚙️ Cấu Hình Environment Variables

```env
# Make.com Webhook Configuration
MAKE_WEBHOOK_URL=https://hook.eu2.make.com/your-webhook-id
MAKE_WEBHOOK_SECRET=your-secret-key-optional
```

## 🧪 Test Webhook

Sử dụng endpoint `/api/test-webhook` để test webhook với payload mẫu:

```bash
curl -X POST http://localhost:3000/api/test-webhook
```

## 📊 Response từ Make.com

Make.com có thể trả về (optional):

```json
{
  "success": true,
  "postId": "facebook_post_id_123456",
  "postUrl": "https://facebook.com/posts/123456"
}
```

## 🔧 Troubleshooting

### **Lỗi thường gặp:**

1. **Missing required fields**: Kiểm tra tất cả trường bắt buộc
2. **Invalid webhook URL**: Đảm bảo URL đúng format Make.com
3. **Network timeout**: Kiểm tra kết nối internet
4. **Make.com error**: Kiểm tra scenario trong Make.com

### **Debug:**

- Check console logs trong browser
- Check server logs trong terminal
- Kiểm tra Make.com scenario execution history

## 📈 Monitoring

- **Success rate**: Theo dõi tỷ lệ thành công
- **Response time**: Thời gian phản hồi từ Make.com
- **Error logs**: Log các lỗi để debug

---

**Cập nhật lần cuối:** 15/01/2024  
**Version:** 2.0 (New Payload Structure)
