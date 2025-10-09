import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const dynamic = 'force-dynamic';

// API debug chi tiết để xem dữ liệu thực tế
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debugging actual database data...');
    
    // Get all schedules with detailed info
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
      .order('created_at', { ascending: false });
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch schedules',
        details: error.message
      }, { status: 500 });
    }
    
    const now = new Date();
    
    const debugData = schedules.map(schedule => {
      const scheduledFor = new Date(schedule.scheduled_for);
      
      return {
        scheduleId: schedule.id,
        reviewId: schedule.review_id,
        reviewTitle: schedule.reviews?.video_title || 'N/A',
        
        // Database values
        database: {
          scheduled_for: schedule.scheduled_for,
          timezone: schedule.timezone,
          created_at: schedule.created_at,
          updated_at: schedule.updated_at,
        },
        
        // Parsed values
        parsed: {
          scheduledForISO: scheduledFor.toISOString(),
          scheduledForLocal: scheduledFor.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          scheduledForUTC: scheduledFor.toLocaleString('vi-VN', { timeZone: 'UTC' }),
        },
        
        // Current time comparison
        currentTime: {
          nowISO: now.toISOString(),
          nowLocal: now.toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          nowUTC: now.toLocaleString('vi-VN', { timeZone: 'UTC' }),
        },
        
        // Time difference calculation
        timeDifference: {
          diffMs: scheduledFor.getTime() - now.getTime(),
          diffMinutes: Math.floor((scheduledFor.getTime() - now.getTime()) / 60000),
          diffHours: Math.floor((scheduledFor.getTime() - now.getTime()) / 3600000),
          diffDays: Math.floor((scheduledFor.getTime() - now.getTime()) / 86400000),
          isOverdue: scheduledFor.getTime() < now.getTime(),
        },
        
        // Status
        status: schedule.status,
      };
    });
    
    return NextResponse.json({
      success: true,
      message: 'Debug data retrieved successfully',
      data: {
        schedules: debugData,
        totalCount: schedules.length,
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
      error: 'Failed to debug database data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
