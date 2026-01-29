'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Loader2, Video, Play } from 'lucide-react';
import { detectVideoPlatform, getVideoEmbedUrl } from '@/lib/utils';
import type { VideoInfo, AIAnalysis } from '@/types';

interface VideoAnalyzerProps {
  onAnalysisComplete: (videoInfo: VideoInfo, analysis: AIAnalysis) => void;
}

export function VideoAnalyzer({ onAnalysisComplete }: VideoAnalyzerProps) {
  const [videoUrl, setVideoUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [progress, setProgress] = useState('');

  const handleAnalyze = async () => {
    setError('');
    setProgress('');

    // Validate URL
    const platform = detectVideoPlatform(videoUrl);
    if (!platform) {
      setError('Link không hợp lệ. Chỉ hỗ trợ YouTube và TikTok.');
      return;
    }

    setIsAnalyzing(true);

    try {
      setProgress('Đang lấy thông tin video...');

      const response = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await response.json();

      // Check for API errors
      if (!response.ok || data.success === false) {
        throw new Error(data.error || 'Có lỗi xảy ra khi phân tích video');
      }

      setProgress('Đang phân tích nội dung với AI...');

      // Handle both response formats:
      // - MOCK_MODE: { videoInfo, analysis }
      // - REAL_MODE: { success, data: { videoInfo, analysis } }
      const videoInfoResult = data.data?.videoInfo || data.videoInfo;
      const analysisResult = data.data?.analysis || data.analysis;

      if (!videoInfoResult) {
        throw new Error('Không thể lấy thông tin video. Vui lòng thử lại.');
      }

      if (!analysisResult) {
        throw new Error('Không thể phân tích video. Vui lòng thử lại.');
      }

      setVideoInfo(videoInfoResult);

      setProgress('Hoàn thành!');

      // Notify parent
      onAnalysisComplete(videoInfoResult, analysisResult);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err instanceof Error ? err.message : 'Không thể phân tích video');
    } finally {
      setIsAnalyzing(false);
      setProgress('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isAnalyzing) {
      handleAnalyze();
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Nhập Link Video
          </CardTitle>
          <CardDescription>
            Hỗ trợ YouTube và TikTok. AI sẽ tự động phân tích và tạo nội dung review.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="video-url">Link Video</Label>
            <div className="flex gap-2">
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=... hoặc https://www.tiktok.com/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isAnalyzing}
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !videoUrl}
                className="min-w-[120px]"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang xử lý
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Phân tích
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {progress && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              {progress}
            </div>
          )}
        </CardContent>
      </Card>

      {videoInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Video</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Video Embed */}
              <div className="aspect-video rounded-lg overflow-hidden bg-black">
                <iframe
                  src={getVideoEmbedUrl(videoInfo.platform, videoInfo.videoId)}
                  className="w-full h-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              </div>

              {/* Video Info */}
              <div className="space-y-2">
                <h3 className="font-bold text-lg">{videoInfo.title}</h3>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {videoInfo.channelName && (
                    <span>📺 {videoInfo.channelName}</span>
                  )}
                  {videoInfo.viewCount && (
                    <span>👁️ {videoInfo.viewCount.toLocaleString('vi-VN')} lượt xem</span>
                  )}
                  {videoInfo.duration && <span>⏱️ {videoInfo.duration}</span>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
