import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth/helpers/auth-helpers';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Testing schedules auth...');
    
    // Check headers
    const headers = Object.fromEntries(request.headers.entries());
    console.log('📋 All headers:', headers);
    
    // Test auth helper
    const userId = await getUserIdFromRequest(request);
    console.log('👤 User ID from auth helper:', userId);
    
    return NextResponse.json({
      success: true,
      message: 'Auth test successful',
      data: {
        userId,
        headers: {
          'x-user-id': request.headers.get('x-user-id'),
          'x-user-role': request.headers.get('x-user-role'),
          'authorization': request.headers.get('authorization'),
          'cookie': request.headers.get('cookie') ? 'present' : 'missing'
        }
      }
    });
  } catch (error) {
    console.error('❌ Auth test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }, { status: 500 });
  }
}
