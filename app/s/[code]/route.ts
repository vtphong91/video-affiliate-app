/**
 * Short URL Redirect Endpoint
 * GET /s/[code]
 *
 * Public endpoint that redirects short URLs to their original destinations
 * Tracks clicks before redirecting
 *
 * Example: /s/abc123 → https://go.isclix.com/deep_link/...
 */

import { NextRequest, NextResponse } from 'next/server';
import { urlShortenerService } from '@/lib/shortener/services/url-shortener-service';

export const dynamic = 'force-dynamic';

/**
 * GET - Redirect short URL to original URL
 * Public endpoint - no authentication required
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { code: string } }
) {
  try {
    const { code } = params;

    console.log('🔗 Redirecting short URL:', code);

    // Validate short code format
    if (!code || code.length < 4 || code.length > 10) {
      return new NextResponse(
        renderNotFoundPage('Invalid short URL format'),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    // Get short URL from database
    const shortUrl = await urlShortenerService.getByCode(code);

    if (!shortUrl) {
      console.log('❌ Short URL not found or expired:', code);
      return new NextResponse(
        renderNotFoundPage('This short URL does not exist or has expired.'),
        {
          status: 404,
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }

    // Extract metadata for tracking
    const userAgent = request.headers.get('user-agent') || undefined;
    const ipAddress = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     undefined;
    const referrer = request.headers.get('referer') || undefined;

    // Track click (async, don't wait - don't block redirect)
    urlShortenerService.trackClick(shortUrl.id, {
      userAgent,
      ipAddress,
      referrer
    }).catch(err => {
      // Swallow error - tracking failure shouldn't break redirect
      console.error('Click tracking failed:', err);
    });

    console.log('✅ Redirecting to:', shortUrl.original_url.substring(0, 100) + '...');

    // Redirect to original URL
    // Use 302 (temporary) instead of 301 (permanent) to allow tracking on each visit
    return NextResponse.redirect(shortUrl.original_url, { status: 302 });

  } catch (error) {
    console.error('Short URL redirect error:', error);

    return new NextResponse(
      renderErrorPage('An error occurred while processing this short URL.'),
      {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
  }
}

/**
 * Render a simple 404 page
 */
function renderNotFoundPage(message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Short URL Not Found</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #333;
    }
    .container {
      background: white;
      padding: 3rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 500px;
    }
    h1 {
      font-size: 4rem;
      margin: 0 0 1rem 0;
      color: #667eea;
    }
    p {
      font-size: 1.2rem;
      margin: 1rem 0;
      color: #666;
    }
    a {
      display: inline-block;
      margin-top: 2rem;
      padding: 0.75rem 2rem;
      background: #667eea;
      color: white;
      text-decoration: none;
      border-radius: 0.5rem;
      transition: background 0.3s;
    }
    a:hover {
      background: #764ba2;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>404</h1>
    <p>${message}</p>
    <a href="/">Go to Home</a>
  </div>
</body>
</html>
  `;
}

/**
 * Render a simple error page
 */
function renderErrorPage(message: string): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: #333;
    }
    .container {
      background: white;
      padding: 3rem;
      border-radius: 1rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      text-align: center;
      max-width: 500px;
    }
    h1 {
      font-size: 4rem;
      margin: 0 0 1rem 0;
      color: #f5576c;
    }
    p {
      font-size: 1.2rem;
      margin: 1rem 0;
      color: #666;
    }
    a {
      display: inline-block;
      margin-top: 2rem;
      padding: 0.75rem 2rem;
      background: #f5576c;
      color: white;
      text-decoration: none;
      border-radius: 0.5rem;
      transition: background 0.3s;
    }
    a:hover {
      background: #f093fb;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Error</h1>
    <p>${message}</p>
    <a href="/">Go to Home</a>
  </div>
</body>
</html>
  `;
}
