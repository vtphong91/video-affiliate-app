import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { db } from '@/lib/db/supabase';
import { ReviewPreview } from '@/components/ReviewPreview';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    const review = await db.getReviewBySlug(params.slug);

    const title = review.custom_title || review.video_title;
    const description = review.summary.substring(0, 160);
    const image = review.video_thumbnail;

    return {
      title: `${title} - Review Chi Tiết`,
      description,
      openGraph: {
        title,
        description,
        images: [image],
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [image],
      },
      keywords: review.seo_keywords,
    };
  } catch {
    return {
      title: 'Review Not Found',
    };
  }
}

export default async function ReviewLandingPage({ params }: PageProps) {
  let review;

  try {
    review = await db.getReviewBySlug(params.slug);

    // Increment view count
    await db.incrementViews(review.id);
  } catch (error) {
    console.error('Error loading review:', error);
    notFound();
  }

  // Convert database format to component props
  const videoInfo = {
    platform: review.video_platform,
    videoId: review.video_id,
    title: review.video_title,
    thumbnail: review.video_thumbnail,
    description: review.video_description || '',
    duration: '0:00', // Not stored in DB
    channelName: review.channel_name || '',
    channelUrl: review.channel_url || '',
  };

  const analysis = {
    summary: review.summary,
    pros: review.pros,
    cons: review.cons,
    keyPoints: review.key_points,
    comparisonTable: review.comparison_table,
    targetAudience: review.target_audience,
    cta: review.cta,
    seoKeywords: review.seo_keywords,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Simple Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 w-fit">
            <Home className="h-5 w-5" />
            <span className="font-bold">VideoAffiliate</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <ReviewPreview
          videoInfo={videoInfo}
          analysis={analysis}
          affiliateLinks={review.affiliate_links}
          customTitle={review.custom_title}
        />

        {/* Custom Content */}
        {review.custom_content && (
          <div className="mt-8 prose max-w-none">
            <div dangerouslySetInnerHTML={{ __html: review.custom_content }} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © 2024 VideoAffiliate. Bài viết được tạo tự động bằng AI.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Mọi thông tin chỉ mang tính chất tham khảo.
          </p>
        </div>
      </footer>
    </div>
  );
}
