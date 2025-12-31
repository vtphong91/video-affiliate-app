import { NextRequest, NextResponse } from 'next/server';
import { getVideoInfoFromUrl, extractVideoId, detectVideoPlatform } from '@/lib/utils';
import { analyzeVideo } from '@/lib/ai';
import { getCachedAnalysis, setCachedAnalysis } from '@/lib/cache/ai-cache';
import type { AnalyzeVideoRequest, AnalyzeVideoResponse } from '@/types';

// Enable MOCK mode for testing without API keys
const MOCK_MODE = false; // ✅ Đã tắt - dùng AI thật (Google Gemini)

export async function POST(request: NextRequest) {
  try {
    const body: AnalyzeVideoRequest = await request.json();
    const { videoUrl } = body;

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // MOCK MODE: Return fake data for testing UI
    if (MOCK_MODE) {
      const platform = detectVideoPlatform(videoUrl);
      const videoId = extractVideoId(videoUrl);

      if (!platform || !videoId) {
        return NextResponse.json(
          { success: false, error: 'Invalid video URL' },
          { status: 400 }
        );
      }

      const mockVideoInfo = {
        platform,
        videoId,
        title: 'Review Chi Tiết iPhone 16 Pro Max - Đáng Mua Hay Không?',
        thumbnail: 'https://i.ytimg.com/vi/' + videoId + '/maxresdefault.jpg',
        duration: '15:30',
        description: 'Đánh giá chi tiết iPhone 16 Pro Max với camera mới, chip A18 Pro và nhiều tính năng đột phá',
        channelName: 'Tech Review Vietnam',
        channelUrl: 'https://www.youtube.com/channel/test',
        viewCount: 125000,
      };

      const mockAnalysis = {
        summary: 'iPhone 16 Pro Max là flagship mới nhất của Apple với nhiều cải tiến đáng chú ý. Máy được trang bị chip A18 Pro mạnh mẽ, camera 48MP với khả năng zoom quang học 5x, màn hình ProMotion 120Hz và pin lớn hơn 10% so với thế hệ trước. Thiết kế titanium cao cấp, viền bezel mỏng hơn tạo cảm giác sang trọng.',
        pros: [
          'Hiệu năng cực mạnh với chip A18 Pro, xử lý mọi tác vụ mượt mà',
          'Camera chất lượng tuyệt vời, chụp đêm và zoom xa rất tốt',
          'Pin trâu, dùng cả ngày không lo hết pin',
          'Màn hình ProMotion 120Hz siêu mượt, màu sắc chuẩn xác',
          'Thiết kế titanium cao cấp, nhẹ hơn nhưng bền hơn'
        ],
        cons: [
          'Giá khá cao, từ 30 triệu trở lên',
          'Sạc nhanh chỉ 27W, chậm hơn đối thủ Android',
          'Không có nhiều thay đổi về thiết kế so với đời trước'
        ],
        keyPoints: [
          { time: '02:15', content: 'Giới thiệu thiết kế titanium mới, nhẹ hơn 10g so với đời trước' },
          { time: '05:30', content: 'Demo camera 48MP với zoom quang 5x, chụp đêm cực tốt' },
          { time: '08:45', content: 'Test hiệu năng chip A18 Pro, điểm Geekbench cao nhất phân khúc' },
          { time: '11:20', content: 'Đánh giá pin, dùng liên tục 8-9 tiếng màn hình' },
          { time: '13:50', content: 'So sánh với Galaxy S24 Ultra và các đối thủ Android' }
        ],
        comparisonTable: {
          headers: ['Tính năng', 'iPhone 16 Pro Max', 'Galaxy S24 Ultra', 'Pixel 9 Pro XL'],
          rows: [
            ['Chip', 'A18 Pro', 'Snapdragon 8 Gen 3', 'Tensor G4'],
            ['RAM', '8GB', '12GB', '12GB'],
            ['Camera chính', '48MP', '200MP', '50MP'],
            ['Pin', '4685 mAh', '5000 mAh', '5060 mAh'],
            ['Giá', '30-35 triệu', '28-33 triệu', '25-30 triệu'],
            ['Điểm mạnh', 'Hệ sinh thái iOS', 'S Pen, camera zoom', 'AI features']
          ]
        },
        targetAudience: [
          'Người dùng Apple muốn nâng cấp từ iPhone 13/14',
          'Người làm content creator cần camera tốt',
          'Người thích hệ sinh thái Apple (Mac, iPad, Watch)'
        ],
        cta: 'iPhone 16 Pro Max là lựa chọn tuyệt vời nếu bạn muốn một chiếc flagship mạnh mẽ với camera đỉnh cao. Mua ngay hôm nay để nhận ưu đãi tốt nhất!',
        seoKeywords: [
          'iPhone 16 Pro Max',
          'review iPhone 16',
          'giá iPhone 16 Pro Max',
          'mua iPhone 16',
          'so sánh iPhone 16',
          'đánh giá iPhone',
          'điện thoại flagship',
          'Apple 2024',
          'chip A18 Pro',
          'camera iPhone 16'
        ]
      };

      const response: AnalyzeVideoResponse = {
        videoInfo: mockVideoInfo,
        analysis: mockAnalysis,
      };

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      return NextResponse.json(response);
    }

    // REAL MODE: Use actual APIs with caching
    console.log('🔍 API Route - Starting video analysis for URL:', videoUrl);

    // Step 1: Get video info from URL
    console.log('🔍 API Route - Step 1: Fetching video info...');
    const videoInfo = await getVideoInfoFromUrl(videoUrl);
    console.log('🔍 API Route - Step 1 COMPLETED - Video info:', {
      title: videoInfo.title?.substring(0, 50),
      platform: videoInfo.platform,
      videoId: videoInfo.videoId,
      hasTranscript: !!videoInfo.transcript
    });

    // Step 2: Check cache first
    console.log('🔍 API Route - Step 2: Checking AI cache...');
    let analysis = await getCachedAnalysis(videoInfo.videoId, videoInfo.platform);

    if (analysis) {
      console.log('✅ API Route - Step 2 CACHE HIT - Using cached analysis');
    } else {
      console.log('❌ API Route - Step 2 CACHE MISS - Analyzing with AI...');

      // Call AI to analyze
      analysis = await analyzeVideo(videoInfo);
      console.log('✅ API Route - Step 2 AI COMPLETED - Analysis received');

      // 🔍 DEBUG: Log analysis details for UI testing
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔍 ANALYSIS DEBUG - Field Details:');
      console.log('   - summary:', analysis.summary ? `✅ ${analysis.summary.length} chars` : '❌ MISSING');
      console.log('   - pros:', `${analysis.pros.length} items`);
      console.log('   - cons:', `${analysis.cons.length} items`);
      console.log('   - keyPoints:', `${analysis.keyPoints.length} items`);
      console.log('   - comparisonTable:', analysis.comparisonTable ? '✅ Present' : '❌ MISSING');
      console.log('   - 🎯 targetAudience:', `${analysis.targetAudience.length} items`);
      console.log('   - 🔍 seoKeywords:', `${analysis.seoKeywords.length} items`);
      console.log('   - cta:', analysis.cta ? '✅ Present' : '❌ MISSING');
      console.log('\n🎯 TARGET AUDIENCE CONTENT:');
      if (analysis.targetAudience.length === 0) {
        console.log('   ❌ EMPTY ARRAY - THIS IS THE BUG!');
      } else {
        analysis.targetAudience.forEach((audience, i) => {
          console.log(`   ${i + 1}. ${audience}`);
        });
      }
      console.log('\n🔍 SEO KEYWORDS CONTENT:');
      if (analysis.seoKeywords.length === 0) {
        console.log('   ❌ EMPTY ARRAY - THIS IS THE BUG!');
      } else {
        analysis.seoKeywords.forEach((keyword, i) => {
          console.log(`   ${i + 1}. ${keyword}`);
        });
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Cache the result
      console.log('💾 API Route - Step 3: Caching analysis result...');
      await setCachedAnalysis(videoInfo.videoId, analysis, videoInfo.platform);
      console.log('✅ API Route - Step 3 COMPLETED - Analysis cached');
    }

    // Step 3: Return combined response
    const response = {
      success: true,
      data: {
        videoInfo,
        analysis,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('❌ Error analyzing video:', error);

    // Log detailed error information
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    const errorMessage =
      error instanceof Error ? error.message : 'Failed to analyze video';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
