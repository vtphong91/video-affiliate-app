import { NextRequest, NextResponse } from 'next/server';
import { CronService } from '@/lib/services/cron-service';

export async function POST(request: NextRequest) {
  try {
    // Check for secret token to prevent unauthorized access
    const authHeader = request.headers.get('authorization');
    const secret = process.env.CRON_SECRET;
    
    if (!secret) {
      return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
    }
    
    if (authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    console.log('🔄 Manual cron trigger started');
    
    // Process schedules using static method
    const result = await CronService.processSchedules([]);
    
    console.log('✅ Manual cron trigger completed:', result);
    
    return NextResponse.json({
      success: true,
      message: 'Manual cron trigger completed',
      result
    });
    
  } catch (error) {
    console.error('❌ Manual cron trigger error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Manual cron trigger endpoint',
    usage: 'POST with Authorization: Bearer <CRON_SECRET>',
    example: 'curl -X POST -H "Authorization: Bearer your_secret" https://your-app.vercel.app/api/manual-cron'
  });
}
