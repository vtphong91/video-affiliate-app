import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET /api/test-simple - Simple test without any dependencies
export async function GET() {
  try {
    console.log('🔍 Simple Test API called');
    
    return NextResponse.json({
      success: true,
      message: 'Simple API works!',
      timestamp: new Date().toISOString(),
      data: {
        test: 'This API has no authentication or database dependencies'
      }
    });

  } catch (error) {
    console.error('❌ Error in simple test:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Simple test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
