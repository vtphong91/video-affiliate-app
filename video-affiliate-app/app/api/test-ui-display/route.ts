import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

// API test UI display
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing UI display...');
    
    // Get latest schedule
    const { data: schedules, error } = await supabase
      .from('schedules')
      .select(`
        *,
        reviews (
          id,
          video_title,
          video_thumbnail,
          slug
        )
      `)
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules',
        details: error.message
      }, { status: 500 });
    }
    
    if (!schedules || schedules.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No schedules found'
      }, { status: 404 });
    }
    
    const schedule = schedules[0];
    const scheduledFor = new Date(schedule.scheduled_for);
    const now = new Date();
    
    // Test different display methods
    const displayTests = {
      // Method 1: Direct toLocaleString with timezone
      method1: scheduledFor.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'Asia/Ho_Chi_Minh',
      }),
      
      // Method 2: toLocaleString without timezone
      method2: scheduledFor.toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      
      // Method 3: Manual format
      method3: (() => {
        const localDate = new Date(scheduledFor.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
        return localDate.toLocaleString('vi-VN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      })(),
    };
    
    // Time difference calculation
    const diffMs = scheduledFor.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    const timeDifference = {
      diffMs,
      diffMinutes,
      diffHours,
      diffDays,
      isOverdue: diffMs < 0,
      statusText: diffMs < 0 ? 'Đã quá hạn' : 
                  diffMinutes < 60 ? `${diffMinutes} phút nữa` :
                  diffHours < 24 ? `${diffHours} giờ nữa` :
                  `${diffDays} ngày nữa`,
    };
    
    return NextResponse.json({
      success: true,
      message: 'UI display test completed',
      data: {
        schedule: {
          id: schedule.id,
          reviewTitle: schedule.reviews?.video_title || 'N/A',
          status: schedule.status,
        },
        database: {
          scheduled_for: schedule.scheduled_for,
          timezone: schedule.timezone,
        },
        parsed: {
          scheduledForISO: scheduledFor.toISOString(),
          scheduledForLocal: scheduledFor.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          scheduledForUTC: scheduledFor.toLocaleString('vi-VN', { timeZone: 'UTC' }),
        },
        displayTests,
        timeDifference,
        currentTime: {
          iso: now.toISOString(),
          local: now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          utc: now.toLocaleString('vi-VN', { timeZone: 'UTC' }),
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test UI display',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
