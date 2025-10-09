import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Check environment variables
export async function GET(request: NextRequest) {
  try {
    const envCheck = {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    };
    
    const missing = Object.entries(envCheck)
      .filter(([key, value]) => !value)
      .map(([key]) => key);
    
    if (missing.length > 0) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        missing,
        envCheck
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'All required environment variables are set',
      envCheck
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Environment check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
