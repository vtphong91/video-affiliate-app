import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple test endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📤 Received data:', body);
    
    return NextResponse.json({
      success: true,
      message: 'Test POST successful',
      receivedData: body
    });

  } catch (error) {
    console.error('Test POST error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Test POST failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
