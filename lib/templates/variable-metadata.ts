/**
 * TEMPLATE VARIABLE LABELS & EXAMPLES
 * Vietnamese labels with clear descriptions and examples for UX
 */

export interface VariableMetadata {
  label: string;              // Tiếng Việt, dễ hiểu
  description?: string;       // Mô tả chi tiết
  placeholder: string;        // Placeholder gợi ý
  example: string;           // Ví dụ cụ thể
  isAutoFill: boolean;       // Có tự động điền không
  type: 'text' | 'textarea' | 'number' | 'url';
}

export const TEMPLATE_VARIABLE_METADATA: Record<string, VariableMetadata> = {
  // ============================================
  // VIDEO-RELATED VARIABLES (Auto-fill)
  // ============================================

  video_title: {
    label: 'Tiêu đề video',
    description: 'Tiêu đề gốc của video trên YouTube/TikTok',
    placeholder: 'Tiêu đề sẽ tự động lấy từ video...',
    example: 'iPhone 15 Pro Max REVIEW - Sau 1 tuần sử dụng!',
    isAutoFill: true,
    type: 'text',
  },

  video_description: {
    label: 'Mô tả video',
    description: 'Phần mô tả chi tiết của video (description box)',
    placeholder: 'Mô tả sẽ tự động lấy từ video...',
    example: 'Video review chi tiết iPhone 15 Pro Max sau 1 tuần trải nghiệm thực tế. Link mua: https://...',
    isAutoFill: true,
    type: 'textarea',
  },

  transcript: {
    label: 'Nội dung video (Transcript)',
    description: 'Phiên âm/nội dung lời nói trong video - đây là nguồn thông tin chính để AI tạo review',
    placeholder: 'Nội dung lời nói sẽ tự động trích xuất từ video...',
    example: 'Xin chào! Hôm nay tôi sẽ review iPhone 15 Pro Max. Thiết kế titanium rất đẹp, chip A17 Pro mạnh mẽ...',
    isAutoFill: true,
    type: 'textarea',
  },

  video_platform: {
    label: 'Nền tảng video',
    description: 'Video đến từ nền tảng nào',
    placeholder: 'YouTube, TikTok...',
    example: 'YouTube',
    isAutoFill: true,
    type: 'text',
  },

  video_duration: {
    label: 'Độ dài video',
    description: 'Thời lượng của video',
    placeholder: 'Tự động lấy...',
    example: '15:30 phút',
    isAutoFill: true,
    type: 'text',
  },

  channel_name: {
    label: 'Tên kênh/Channel',
    description: 'Người đăng video',
    placeholder: 'Tên kênh sẽ tự động lấy...',
    example: 'Lê Anh Review',
    isAutoFill: true,
    type: 'text',
  },

  // ============================================
  // PRODUCT INFORMATION (Manual Input Required)
  // ============================================

  product_name: {
    label: 'Tên sản phẩm',
    description: 'Tên đầy đủ của sản phẩm được review',
    placeholder: 'VD: iPhone 15 Pro Max 256GB',
    example: 'iPhone 15 Pro Max 256GB Natural Titanium',
    isAutoFill: false,
    type: 'text',
  },

  brand: {
    label: 'Thương hiệu',
    description: 'Nhà sản xuất/thương hiệu của sản phẩm',
    placeholder: 'VD: Apple, Samsung, Xiaomi...',
    example: 'Apple',
    isAutoFill: false,
    type: 'text',
  },

  price: {
    label: 'Giá bán',
    description: 'Giá niêm yết hoặc giá thực tế của sản phẩm',
    placeholder: 'VD: 29,990,000 VNĐ hoặc $999',
    example: '29,990,000 VNĐ',
    isAutoFill: false,
    type: 'text',
  },

  category: {
    label: 'Danh mục sản phẩm',
    description: 'Loại sản phẩm (smartphone, laptop, headphones...)',
    placeholder: 'VD: Smartphone, Laptop, Tai nghe...',
    example: 'Smartphone cao cấp',
    isAutoFill: false,
    type: 'text',
  },

  key_features: {
    label: 'Tính năng nổi bật',
    description: 'Các tính năng chính của sản phẩm (ngăn cách bởi dấu phẩy)',
    placeholder: 'VD: Chip A17 Pro, Camera 48MP, Titanium design, USB-C',
    example: 'Chip A17 Pro 3nm, Camera 48MP zoom 5x, Khung viền Titanium, Pin 4422mAh',
    isAutoFill: false,
    type: 'textarea',
  },

  competitors: {
    label: 'Đối thủ cạnh tranh',
    description: 'Các sản phẩm tương tự để so sánh (ngăn cách bởi dấu phẩy)',
    placeholder: 'VD: Samsung Galaxy S23 Ultra, Xiaomi 13 Pro',
    example: 'Samsung Galaxy S23 Ultra, Google Pixel 8 Pro, Xiaomi 13 Pro',
    isAutoFill: false,
    type: 'text',
  },

  // ============================================
  // CAMPAIGN & CONTEXT (Optional)
  // ============================================

  campaign_type: {
    label: 'Loại chiến dịch',
    description: 'Mục đích của bài review này',
    placeholder: 'VD: Ra mắt sản phẩm mới, So sánh, Đánh giá lâu dài...',
    example: 'Ra mắt sản phẩm mới (New product launch)',
    isAutoFill: false,
    type: 'text',
  },

  target_audience: {
    label: 'Đối tượng mục tiêu',
    description: 'Bài viết hướng đến nhóm người dùng nào',
    placeholder: 'VD: Gen Z yêu công nghệ, Dân văn phòng, Game thủ...',
    example: 'Gen Z và Millennials (18-35 tuổi) yêu công nghệ, có ngân sách trung bình-khá',
    isAutoFill: false,
    type: 'text',
  },

  affiliate_link: {
    label: 'Link affiliate/mua hàng',
    description: 'Đường link để người đọc mua sản phẩm (có thể có mã giới thiệu)',
    placeholder: 'VD: https://shopee.vn/product/123456?affiliate_id=xxx',
    example: 'https://tiki.vn/iphone-15-pro-max-p123456.html?spid=xxx',
    isAutoFill: false,
    type: 'url',
  },

  promotion: {
    label: 'Khuyến mãi (nếu có)',
    description: 'Thông tin về giảm giá, sale, voucher hiện tại',
    placeholder: 'VD: Giảm 20% đến 31/12, Tặng kèm AirPods...',
    example: 'Flash sale 11/11: Giảm 3 triệu + Tặng sạc nhanh 35W',
    isAutoFill: false,
    type: 'text',
  },

  // ============================================
  // SPECIALIZED VARIABLES
  // ============================================

  // For Beauty Reviews
  skin_type: {
    label: 'Loại da phù hợp',
    description: 'Sản phẩm làm đẹp này phù hợp với loại da nào',
    placeholder: 'VD: Da dầu, Da khô, Da hỗn hợp, Mọi loại da...',
    example: 'Da dầu, da hỗn hợp thiên dầu',
    isAutoFill: false,
    type: 'text',
  },

  // For Food Reviews
  restaurant_name: {
    label: 'Tên quán/Nhà hàng',
    description: 'Tên địa điểm ăn uống',
    placeholder: 'VD: Phở Hà Nội 24, Bún chả Đắc Kim...',
    example: 'Bún chả Hàng Mành - Chi nhánh Hoàn Kiếm',
    isAutoFill: false,
    type: 'text',
  },

  location: {
    label: 'Địa chỉ/Khu vực',
    description: 'Vị trí của quán ăn',
    placeholder: 'VD: 123 Phố Huế, Hoàn Kiếm, Hà Nội',
    example: '45 Hàng Mành, Hoàn Kiếm, Hà Nội (gần Hồ Gươm)',
    isAutoFill: false,
    type: 'text',
  },

  dish_name: {
    label: 'Tên món ăn',
    description: 'Món ăn chính được review',
    placeholder: 'VD: Bún chả Hà Nội, Phở bò tái...',
    example: 'Bún chả Hà Nội truyền thống (1 suất)',
    isAutoFill: false,
    type: 'text',
  },

  // For Comparison Reviews
  product1: {
    label: 'Sản phẩm 1',
    description: 'Tên sản phẩm đầu tiên để so sánh',
    placeholder: 'VD: iPhone 15 Pro Max',
    example: 'iPhone 15 Pro Max 256GB',
    isAutoFill: false,
    type: 'text',
  },

  product2: {
    label: 'Sản phẩm 2',
    description: 'Tên sản phẩm thứ hai để so sánh',
    placeholder: 'VD: Samsung Galaxy S23 Ultra',
    example: 'Samsung Galaxy S23 Ultra 256GB',
    isAutoFill: false,
    type: 'text',
  },

  product3: {
    label: 'Sản phẩm 3 (tùy chọn)',
    description: 'Tên sản phẩm thứ ba để so sánh (không bắt buộc)',
    placeholder: 'VD: Google Pixel 8 Pro',
    example: 'Google Pixel 8 Pro 256GB',
    isAutoFill: false,
    type: 'text',
  },

  price1: {
    label: 'Giá sản phẩm 1',
    description: 'Giá của sản phẩm đầu tiên',
    placeholder: 'VD: 29,990,000 VNĐ',
    example: '29,990,000 VNĐ',
    isAutoFill: false,
    type: 'text',
  },

  price2: {
    label: 'Giá sản phẩm 2',
    description: 'Giá của sản phẩm thứ hai',
    placeholder: 'VD: 27,990,000 VNĐ',
    example: '27,990,000 VNĐ',
    isAutoFill: false,
    type: 'text',
  },

  price3: {
    label: 'Giá sản phẩm 3',
    description: 'Giá của sản phẩm thứ ba',
    placeholder: 'VD: 21,990,000 VNĐ',
    example: '21,990,000 VNĐ',
    isAutoFill: false,
    type: 'text',
  },

  // For Tutorial
  topic: {
    label: 'Chủ đề hướng dẫn',
    description: 'Nội dung chính của tutorial',
    placeholder: 'VD: Cách cài đặt Windows 11, Cách nấu phở...',
    example: 'Cách cài đặt và tối ưu Windows 11 cho gaming',
    isAutoFill: false,
    type: 'text',
  },

  difficulty: {
    label: 'Độ khó',
    description: 'Mức độ phù hợp với người dùng',
    placeholder: 'VD: Dễ, Trung bình, Nâng cao...',
    example: 'Trung bình (phù hợp người đã biết cơ bản)',
    isAutoFill: false,
    type: 'text',
  },
};

/**
 * Get metadata for a variable key
 */
export function getVariableMetadata(key: string): VariableMetadata {
  return TEMPLATE_VARIABLE_METADATA[key] || {
    label: key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    description: `Nhập thông tin ${key}`,
    placeholder: `Nhập ${key}...`,
    example: '',
    isAutoFill: false,
    type: 'text',
  };
}

/**
 * Check if a variable should be auto-filled
 */
export function isAutoFillVariable(key: string): boolean {
  const metadata = TEMPLATE_VARIABLE_METADATA[key];
  return metadata?.isAutoFill || false;
}

/**
 * Get field type for a variable
 */
export function getFieldType(key: string): 'text' | 'textarea' | 'number' | 'url' {
  const metadata = TEMPLATE_VARIABLE_METADATA[key];
  return metadata?.type || 'text';
}
