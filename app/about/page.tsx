import { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About Us - Video Affiliate App',
  description: 'Learn more about Video Affiliate App and our mission to help content creators monetize their videos.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-700 mb-6">
            Video Affiliate App is a powerful platform designed to help content creators and marketers 
            analyze videos, generate AI-powered content, and automate social media posting.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Our Mission</h2>
          <p className="text-gray-700 mb-4">
            We aim to simplify the process of video content analysis and affiliate marketing by 
            leveraging artificial intelligence to create engaging reviews and automate social media distribution.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Features</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 mb-6">
            <li>AI-powered video analysis and content generation</li>
            <li>Automated Facebook posting with scheduling</li>
            <li>Support for YouTube and TikTok videos</li>
            <li>Affiliate link management</li>
            <li>Comprehensive analytics and reporting</li>
          </ul>

          <div className="mt-8">
            <Link href="/dashboard">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

