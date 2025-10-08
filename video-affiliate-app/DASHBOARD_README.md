# 📊 Dashboard Overview - Video Affiliate App

## 🎯 Tổng quan

Dashboard tổng quan cung cấp cái nhìn toàn diện về hệ thống Video Affiliate App với các thống kê, biểu đồ và thông tin trạng thái hệ thống.

## 🏗️ Cấu trúc Components

### 1. **StatsCard** (`components/dashboard/StatsCard.tsx`)
- Hiển thị các thống kê chính với icon và màu sắc
- Hỗ trợ hiển thị thay đổi phần trăm
- Responsive design

**Props:**
```typescript
interface StatsCardProps {
  title: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease' | 'neutral';
  };
  icon: LucideIcon;
  description?: string;
  className?: string;
}
```

### 2. **Chart** (`components/dashboard/Chart.tsx`)
- Hỗ trợ 3 loại biểu đồ: Bar, Line, Doughnut
- Tự động tính toán tỷ lệ và màu sắc
- Responsive và interactive

**Props:**
```typescript
interface ChartProps {
  title: string;
  data: ChartData[];
  type?: 'bar' | 'line' | 'doughnut';
  className?: string;
  height?: number;
}
```

### 3. **RecentActivity** (`components/dashboard/RecentActivity.tsx`)
- Hiển thị hoạt động gần đây của hệ thống
- Hỗ trợ nhiều loại activity với icon và status
- Timestamp relative (phút/giờ/ngày trước)

### 4. **QuickActions** (`components/dashboard/QuickActions.tsx`)
- Các thao tác nhanh với icon và màu sắc
- Links đến các trang chức năng chính
- Stats nhanh ở cuối component

### 5. **SystemStatus** (`components/dashboard/SystemStatus.tsx`)
- Trạng thái các dịch vụ hệ thống
- Response time và last checked
- Overall status indicator

## 📈 Dữ liệu Dashboard

### API Endpoint: `/api/dashboard/stats`

**Response Structure:**
```typescript
{
  success: boolean;
  data: {
    stats: {
      totalReviews: number;
      totalSchedules: number;
      publishedPosts: number;
      pendingSchedules: number;
      failedPosts: number;
      reviewsToday: number;
      postsToday: number;
      averageResponseTime: number;
    };
    charts: {
      reviewsByDay: ChartData[];
      postsByDay: ChartData[];
      platformStats: ChartData[];
      statusStats: ChartData[];
    };
    activities: ActivityItem[];
  };
}
```

### Các loại Chart Data:

1. **Reviews by Day**: Thống kê reviews theo ngày (7 ngày qua)
2. **Posts by Day**: Thống kê bài đăng theo ngày (7 ngày qua)
3. **Platform Stats**: Phân bố theo platform (YouTube, TikTok, Facebook, Khác)
4. **Status Stats**: Trạng thái đăng bài (Đã đăng, Chờ lịch, Thất bại, Đang xử lý)

## 🎨 Design System

### Colors:
- **Primary**: Blue (#3B82F6)
- **Success**: Green (#10B981)
- **Warning**: Yellow (#F59E0B)
- **Error**: Red (#EF4444)
- **Neutral**: Gray scale

### Typography:
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Monospace**: Fira Code

### Spacing:
- **Card padding**: p-6
- **Section margin**: mb-8
- **Gap between items**: gap-4

## 📱 Responsive Design

### Breakpoints:
- **Mobile**: < 768px (1 column)
- **Tablet**: 768px - 1024px (2 columns)
- **Desktop**: > 1024px (3-4 columns)

### Grid Layout:
```css
/* Stats Cards */
grid-cols-1 md:grid-cols-2 lg:grid-cols-4

/* Charts */
grid-cols-1 lg:grid-cols-2

/* Bottom Row */
grid-cols-1 lg:grid-cols-3
```

## 🔄 Real-time Updates

Dashboard tự động refresh dữ liệu khi:
- Component mount
- User click refresh button
- Error occurs và user retry

### Loading States:
- Skeleton loaders cho stats cards
- Spinner cho charts
- Error states với retry button

## 🧪 Testing

### Manual Testing Checklist:
```
[ ] Dashboard loads successfully
[ ] All stats cards display correct data
[ ] Charts render properly (bar, line, doughnut)
[ ] Recent activities show correct information
[ ] Quick actions navigate to correct pages
[ ] System status shows current state
[ ] Mobile responsive works
[ ] Loading states work
[ ] Error handling works
[ ] Refresh functionality works
```

### API Testing:
```bash
# Test stats API
curl http://localhost:3000/api/dashboard/stats

# Expected response: 200 OK with JSON data
```

## 🚀 Performance

### Optimizations:
- **Lazy loading**: Components load on demand
- **Memoization**: React.memo for expensive components
- **Debouncing**: User input debounced
- **Caching**: API responses cached

### Bundle Size:
- Components: ~15KB gzipped
- Charts: ~8KB gzipped
- Total: ~23KB gzipped

## 🔧 Customization

### Adding New Stats:
1. Update `DashboardStats` interface
2. Modify API endpoint `/api/dashboard/stats`
3. Add new `StatsCard` component
4. Update dashboard layout

### Adding New Charts:
1. Update `ChartData` interface
2. Add data to API response
3. Add new `Chart` component
4. Update dashboard layout

### Adding New Activities:
1. Update `ActivityItem` interface
2. Add new activity types
3. Update `RecentActivity` component
4. Add mock data to API

## 📝 Future Enhancements

### Planned Features:
- [ ] Real-time WebSocket updates
- [ ] Export dashboard data to PDF
- [ ] Custom date range selection
- [ ] Advanced filtering options
- [ ] Dark mode support
- [ ] Dashboard customization
- [ ] Alert notifications
- [ ] Performance metrics

### Technical Improvements:
- [ ] Server-side rendering (SSR)
- [ ] Progressive Web App (PWA)
- [ ] Offline support
- [ ] Advanced caching
- [ ] Analytics integration
- [ ] A/B testing framework

## 🐛 Troubleshooting

### Common Issues:

1. **Charts not rendering**:
   - Check if data is properly formatted
   - Verify Chart component props
   - Check console for errors

2. **Stats showing incorrect data**:
   - Verify API endpoint response
   - Check database queries
   - Validate data types

3. **Mobile layout issues**:
   - Check responsive classes
   - Verify viewport meta tag
   - Test on actual devices

4. **Performance issues**:
   - Check bundle size
   - Monitor API response times
   - Use React DevTools Profiler

## 📞 Support

Nếu gặp vấn đề với Dashboard:
1. Check console logs
2. Verify API endpoints
3. Test with sample data
4. Contact development team

---

**Dashboard Overview v1.0** - Video Affiliate App
