import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// API để sync mock schedules sang real database khi schema được fix
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Syncing mock schedules to real database...');
    
    // Step 1: Get mock schedules
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
    console.log(`📊 Found ${mockSchedules.length} mock schedules to sync`);
    
    if (mockSchedules.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No mock schedules to sync',
        synced: 0
      });
    }
    
    // Step 2: Try different column names
    const columnVariations = [
      'target_type',
      'target_typ', 
      'target',
      'post_type',
      'type'
    ];
    
    let workingColumn = null;
    let workingSchedule = null;
    
    for (const columnName of columnVariations) {
      try {
        console.log(`🧪 Testing column: ${columnName}`);
        
        const testSchedule = {
          user_id: mockSchedules[0].user_id,
          review_id: mockSchedules[0].review_id,
          scheduled_for: mockSchedules[0].scheduled_for,
          timezone: mockSchedules[0].timezone,
          [columnName]: mockSchedules[0].target_type || mockSchedules[0].target_typ || 'page',
          target_id: mockSchedules[0].target_id,
          target_name: mockSchedules[0].target_name,
          post_message: mockSchedules[0].post_message,
          landing_page_url: mockSchedules[0].landing_page_url,
          status: mockSchedules[0].status,
          retry_count: mockSchedules[0].retry_count,
          max_retries: mockSchedules[0].max_retries,
        };
        
        const { data: insertResult, error: insertError } = await supabase
          .from('schedules')
          .insert(testSchedule)
          .select()
          .single();
        
        if (!insertError) {
          console.log(`✅ Column ${columnName} works!`);
          workingColumn = columnName;
          workingSchedule = insertResult;
          
          // Clean up test data
          await supabase
            .from('schedules')
            .delete()
            .eq('id', insertResult.id);
          
          break;
        } else {
          console.log(`❌ Column ${columnName} failed:`, insertError.message);
        }
      } catch (error) {
        console.log(`❌ Column ${columnName} error:`, error);
      }
    }
    
    if (!workingColumn) {
      return NextResponse.json({
        success: false,
        error: 'No working column found',
        details: 'Tried all column variations but none worked',
        testedColumns: columnVariations
      }, { status: 500 });
    }
    
    // Step 3: Sync all mock schedules
    let syncedCount = 0;
    const syncResults = [];
    
    for (const mockSchedule of mockSchedules) {
      try {
        const scheduleData = {
          user_id: mockSchedule.user_id,
          review_id: mockSchedule.review_id,
          scheduled_for: mockSchedule.scheduled_for,
          timezone: mockSchedule.timezone,
          [workingColumn]: mockSchedule.target_type || mockSchedule.target_typ || 'page',
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
          console.error(`Error syncing schedule ${mockSchedule.id}:`, insertError);
          syncResults.push({
            mockId: mockSchedule.id,
            success: false,
            error: insertError.message
          });
        } else {
          console.log(`✅ Synced schedule ${mockSchedule.id} -> ${insertedSchedule.id}`);
          syncedCount++;
          syncResults.push({
            mockId: mockSchedule.id,
            realId: insertedSchedule.id,
            success: true
          });
        }
      } catch (error) {
        console.error(`Error processing schedule ${mockSchedule.id}:`, error);
        syncResults.push({
          mockId: mockSchedule.id,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    console.log(`📊 Sync completed: ${syncedCount}/${mockSchedules.length} schedules synced`);
    
    return NextResponse.json({
      success: true,
      message: `Sync completed: ${syncedCount}/${mockSchedules.length} schedules synced`,
      synced: syncedCount,
      total: mockSchedules.length,
      workingColumn,
      results: syncResults
    });
    
  } catch (error) {
    console.error('❌ Sync error:', error);
    return NextResponse.json({
      success: false,
      error: 'Sync failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET endpoint để check sync status
export async function GET(request: NextRequest) {
  try {
    console.log('📊 Checking sync status...');
    
    // Check mock schedules
    const mockResponse = await fetch('http://localhost:3000/api/schedules-mock-storage');
    const mockData = await mockResponse.json();
    
    const mockCount = mockData.success ? mockData.data.schedules.length : 0;
    
    // Check real database
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
        canSync: mockCount > 0 && !dbError
      }
    });
    
  } catch (error) {
    console.error('❌ Status check error:', error);
    return NextResponse.json({
      success: false,
      error: 'Status check failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
