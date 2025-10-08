import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// API test timezone conversion đơn giản
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing timezone conversion...');
    
    const body = await request.json();
    const { dateStr, timeStr } = body;
    
    if (!dateStr || !timeStr) {
      return NextResponse.json({
        success: false,
        error: 'dateStr and timeStr are required'
      }, { status: 400 });
    }
    
    console.log('📅 Input:', { dateStr, timeStr });
    
    // Test different ways of creating Date objects
    const methods = {
      // Method 1: Combine date and time strings
      method1: new Date(`${dateStr}T${timeStr}:00`),
      
      // Method 2: Create from date string and set time
      method2: (() => {
        const date = new Date(dateStr);
        const [hours, minutes] = timeStr.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
        return date;
      })(),
      
      // Method 3: Create from date string and set time with timezone
      method3: (() => {
        const date = new Date(dateStr + 'T00:00:00');
        const [hours, minutes] = timeStr.split(':').map(Number);
        date.setHours(hours, minutes, 0, 0);
        return date;
      })(),
    };
    
    const results = Object.entries(methods).map(([methodName, date]) => {
      return {
        method: methodName,
        date: date.toISOString(),
        local: date.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
        utc: date.toLocaleString('vi-VN', { timeZone: 'UTC' }),
        isValid: !isNaN(date.getTime()),
      };
    });
    
    return NextResponse.json({
      success: true,
      message: 'Timezone conversion test completed',
      data: {
        input: { dateStr, timeStr },
        results,
        currentTime: {
          iso: new Date().toISOString(),
          local: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          utc: new Date().toLocaleString('vi-VN', { timeZone: 'UTC' }),
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test timezone conversion',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
