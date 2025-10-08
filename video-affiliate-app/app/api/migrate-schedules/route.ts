import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// API endpoint để migrate mock schedules sang real database
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Migrating mock schedules to real database...');
    
    // Step 1: Get mock schedules from mock storage
    const mockResponse = await fetch('http://localhost:3000/api/schedules-mock-storage');
    const mockData = await mockResponse.json();
    
    if (!mockData.success) {
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch mock schedules',
        details: mockData.error
      }, { status: 500 });
    }
    
    const mockSchedules = mockData.data.schedules;
    console.log(`📊 Found ${mockSchedules.length} mock schedules to migrate`);
    
    if (mockSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No mock schedules to migrate',
        migrated: 0
      });
    }
    
    // Step 2: Try to create schedules table if it doesn't exist
    try {
      const createTableSQL = `
        CREATE TABLE IF NOT EXISTS schedules (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id TEXT NOT NULL DEFAULT 'default-user',
          review_id UUID NOT NULL,
          scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
          timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
          target_type TEXT NOT NULL DEFAULT 'page',
          target_id TEXT NOT NULL DEFAULT 'make-com-handled',
          target_name TEXT DEFAULT 'Make.com Auto',
          post_message TEXT NOT NULL DEFAULT 'Auto-generated from review',
          landing_page_url TEXT NOT NULL DEFAULT 'https://example.com/review/auto',
          status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'posted', 'failed', 'cancelled')),
          posted_at TIMESTAMP WITH TIME ZONE,
          facebook_post_id TEXT,
          facebook_post_url TEXT,
          error_message TEXT,
          retry_count INTEGER DEFAULT 0,
          max_retries INTEGER DEFAULT 3,
          next_retry_at TIMESTAMP WITH TIME ZONE,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `;
      
      const { error: createError } = await supabase.rpc('exec_sql', {
        sql: createTableSQL
      });
      
      if (createError) {
        console.error('Error creating schedules table:', createError);
        return NextResponse.json({
          success: false,
          error: 'Failed to create schedules table',
          details: createError.message
        }, { status: 500 });
      }
      
      console.log('✅ Schedules table created successfully');
      
    } catch (error) {
      console.error('Error with table creation:', error);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 });
    }
    
    // Step 3: Migrate each mock schedule
    let migratedCount = 0;
    const migrationResults = [];
    
    for (const mockSchedule of mockSchedules) {
      try {
        const scheduleData = {
          user_id: mockSchedule.user_id,
          review_id: mockSchedule.review_id,
          scheduled_for: mockSchedule.scheduled_for,
          timezone: mockSchedule.timezone,
          target_type: mockSchedule.target_type,
          target_id: mockSchedule.target_id,
          target_name: mockSchedule.target_name,
          post_message: mockSchedule.post_message,
          landing_page_url: mockSchedule.landing_page_url,
          status: mockSchedule.status,
          retry_count: mockSchedule.retry_count,
          max_retries: mockSchedule.max_retries,
        };
        
        const { data: insertedSchedule, error: insertError } = await supabase
          .from('schedules')
          .insert(scheduleData)
          .select()
          .single();
        
        if (insertError) {
          console.error(`Error migrating schedule ${mockSchedule.id}:`, insertError);
          migrationResults.push({
            mockId: mockSchedule.id,
            success: false,
            error: insertError.message
          });
        } else {
          console.log(`✅ Migrated schedule ${mockSchedule.id} -> ${insertedSchedule.id}`);
          migratedCount++;
          migrationResults.push({
            mockId: mockSchedule.id,
            realId: insertedSchedule.id,
            success: true
          });
        }
        
      } catch (error) {
        console.error(`Error processing schedule ${mockSchedule.id}:`, error);
        migrationResults.push({
          mockId: mockSchedule.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`📊 Migration completed: ${migratedCount}/${mockSchedules.length} schedules migrated`);
    
    return NextResponse.json({
      success: true,
      message: `Migration completed: ${migratedCount}/${mockSchedules.length} schedules migrated`,
      migrated: migratedCount,
      total: mockSchedules.length,
      results: migrationResults
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint để check migration status
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Checking migration status...');
    
    // Check mock schedules
    const mockResponse = await fetch('http://localhost:3000/api/schedules-mock-storage');
    const mockData = await mockResponse.json();
    
    const mockCount = mockData.success ? mockData.data.schedules.length : 0;
    
    // Try to check real database
    let realCount = 0;
    let dbError = null;
    
    try {
      const { data: realSchedules, error: realError } = await supabase
        .from('schedules')
        .select('id')
        .limit(1000);
      
      if (realError) {
        dbError = realError.message;
      } else {
        realCount = realSchedules?.length || 0;
      }
    } catch (error) {
      dbError = error instanceof Error ? error.message : 'Unknown error';
    }
    
    return NextResponse.json({
      success: true,
      status: {
        mockSchedules: mockCount,
        realSchedules: realCount,
        databaseError: dbError,
        canMigrate: mockCount > 0 && !dbError
      }
    });
    
  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
