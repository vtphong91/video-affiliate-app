import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '8');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'published';

    const offset = (page - 1) * limit;

    // Fetch reviews from database
    const reviews = await db.getReviews({
      status,
      limit,
      offset
    });

    // Filter by category if provided
    let filteredReviews = reviews;
    if (category && category !== 'all') {
      // For now, we'll filter by video platform or title keywords
      // In a real app, you'd have a proper category_id field in reviews table
      filteredReviews = reviews.filter(review => {
        const title = review.video_title.toLowerCase();
        const platform = review.video_platform.toLowerCase();
        
        switch (category.toLowerCase()) {
          case 'cong-nghe':
          case 'technology':
            return title.includes('tech') || title.includes('ai') || title.includes('digital') || title.includes('công nghệ');
          case 'du-lich':
          case 'travel':
            return title.includes('travel') || title.includes('du lịch') || title.includes('đi chơi');
          case 'the-thao':
          case 'sport':
            return title.includes('sport') || title.includes('thể thao') || title.includes('gym');
          case 'kinh-doanh':
          case 'business':
            return title.includes('business') || title.includes('kinh doanh') || title.includes('startup');
          case 'lam-dep':
          case 'beauty':
            return title.includes('beauty') || title.includes('làm đẹp') || title.includes('skincare') || title.includes('makeup') || title.includes('mỹ phẩm');
          case 'suc-khoe':
          case 'health':
            return title.includes('health') || title.includes('sức khỏe') || title.includes('y tế');
          case 'thoi-trang':
          case 'fashion':
            return title.includes('fashion') || title.includes('thời trang') || title.includes('quần áo');
          case 'nha-cua':
          case 'home':
            return title.includes('home') || title.includes('nhà cửa') || title.includes('nội thất') || title.includes('đồ gia dụng');
          case 'dien-gia-dung':
            return title.includes('máy sấy tóc') || title.includes('máy làm sữa') || title.includes('máy hút bụi') || title.includes('nồi nấu') || title.includes('điện gia dụng');
          case 'gia-dung':
            return title.includes('tumbler') || title.includes('bình nước') || title.includes('cốc giữ nhiệt') || title.includes('gia dụng');
          case 'xe-may':
          case 'motorbikes':
            return title.includes('xe máy') || title.includes('motor') || title.includes('yadea') || title.includes('xe điện');
          default:
            return true;
        }
      });
    }

    // Transform reviews to article format
    const articles = filteredReviews.map(review => ({
      id: review.id,
      title: review.custom_title || review.video_title,
      excerpt: review.summary.substring(0, 150) + '...',
      category: getCategoryFromTitle(review.video_title),
      author: review.channel_name || 'AI Content Creator',
      date: new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      imageUrl: review.video_thumbnail,
      backgroundColor: getBackgroundColor(review.video_platform),
      slug: review.slug,
      views: review.views,
      clicks: review.clicks
    }));

    // Get total count for pagination based on filtered results
    const totalFilteredItems = articles.length;
    const totalPages = Math.ceil(totalFilteredItems / limit);

    return NextResponse.json({
      success: true,
      articles,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalFilteredItems,
        hasNext: page < totalPages,
        hasPrev: page > 1
      },
      filter: {
        category: category || 'all',
        applied: category && category !== 'all',
        resultsCount: articles.length
      }
    });

  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch articles',
        articles: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          hasNext: false,
          hasPrev: false
        }
      },
      { status: 500 }
    );
  }
}

function getBackgroundColor(platform: string): string {
  switch (platform) {
    case 'youtube':
      return 'bg-red-100';
    case 'tiktok':
      return 'bg-pink-100';
    default:
      return 'bg-blue-100';
  }
}

function getCategoryFromTitle(title: string): string {
  const titleLower = title.toLowerCase();
  
  // Check for specific product categories first
  if (titleLower.includes('máy sấy tóc') || titleLower.includes('máy làm sữa') || titleLower.includes('máy hút bụi') || titleLower.includes('nồi nấu')) {
    return 'Điện gia dụng';
  }
  if (titleLower.includes('xe máy') || titleLower.includes('motor') || titleLower.includes('yadea') || titleLower.includes('xe điện')) {
    return 'Xe máy';
  }
  if (titleLower.includes('tumbler') || titleLower.includes('bình nước') || titleLower.includes('cốc giữ nhiệt')) {
    return 'Gia dụng';
  }
  if (titleLower.includes('làm đẹp') || titleLower.includes('skincare') || titleLower.includes('makeup') || titleLower.includes('mỹ phẩm')) {
    return 'Làm đẹp';
  }
  if (titleLower.includes('nhà cửa') || titleLower.includes('nội thất') || titleLower.includes('đồ gia dụng')) {
    return 'Nhà cửa';
  }
  if (titleLower.includes('thời trang') || titleLower.includes('quần áo') || titleLower.includes('fashion')) {
    return 'Thời trang';
  }
  if (titleLower.includes('sức khỏe') || titleLower.includes('y tế') || titleLower.includes('health')) {
    return 'Sức khỏe';
  }
  if (titleLower.includes('thể thao') || titleLower.includes('gym') || titleLower.includes('sport')) {
    return 'Thể thao';
  }
  if (titleLower.includes('kinh doanh') || titleLower.includes('startup') || titleLower.includes('business')) {
    return 'Kinh doanh';
  }
  if (titleLower.includes('tech') || titleLower.includes('ai') || titleLower.includes('digital') || titleLower.includes('công nghệ')) {
    return 'Công nghệ';
  }
  
  return 'Công nghệ'; // Default category
}
