import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/test-env - Test environment variables
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing environment variables...');
    
    const envVars = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    };

    console.log('🔍 Environment variables:', envVars);

    const isConfigured = envVars.NEXT_PUBLIC_SUPABASE_URL && 
                        envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
                        !envVars.NEXT_PUBLIC_SUPABASE_URL.includes('your_supabase') &&
                        !envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('your_supabase');

    return NextResponse.json({
      success: true,
      isConfigured,
      envVars: {
        ...envVars,
        NEXT_PUBLIC_SUPABASE_ANON_KEY: envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
          `${envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 'Not set',
        SUPABASE_SERVICE_ROLE_KEY: envVars.SUPABASE_SERVICE_ROLE_KEY ? 
          `${envVars.SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...` : 'Not set'
      }
    });

  } catch (error) {
    console.error('❌ Error testing environment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
