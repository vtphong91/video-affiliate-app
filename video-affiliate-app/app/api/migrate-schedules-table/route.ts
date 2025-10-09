import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

// API để chạy migration cho schedules table
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Running schedules table migration...');
    
    // Migration SQL
    const migrationSQL = `
      -- Drop table nếu tồn tại
      DROP TABLE IF EXISTS schedules CASCADE;
      
      -- Tạo schedules table với schema đúng
      CREATE TABLE schedules (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL DEFAULT 'default-user',
        review_id UUID NOT NULL,
        scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
        timezone TEXT DEFAULT 'Asia/Ho_Chi_Minh',
        target_type TEXT NOT NULL DEFAULT 'page' CHECK (target_type IN ('page', 'group')),
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
      
      -- Tạo indexes
      CREATE INDEX idx_schedules_user_id ON schedules(user_id);
      CREATE INDEX idx_schedules_review_id ON schedules(review_id);
      CREATE INDEX idx_schedules_status ON schedules(status);
      CREATE INDEX idx_schedules_scheduled_for ON schedules(scheduled_for);
      CREATE INDEX idx_schedules_created_at ON schedules(created_at);
      
      -- Tạo function để update updated_at
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql';
      
      -- Tạo trigger để auto-update updated_at
      CREATE TRIGGER update_schedules_updated_at
          BEFORE UPDATE ON schedules
          FOR EACH ROW
          EXECUTE FUNCTION update_updated_at_column();
    `;
    
    console.log('📤 Executing migration SQL...');
    
    // Execute migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.log('❌ Migration failed:', error);
      return NextResponse.json({
        success: false,
        error: 'Migration failed',
        details: error.message,
        code: error.code
      }, { status: 500 });
    }
    
    console.log('✅ Migration completed successfully');
    
    // Test insert
    console.log('🧪 Testing insert after migration...');
    const testData = {
      user_id: 'test-user',
      review_id: '45e448df-d4ef-4d5d-9303-33109f9d6c30',
      scheduled_for: '2025-01-08T11:20:00.000Z',
      timezone: 'Asia/Ho_Chi_Minh',
      target_type: 'page',
      target_id: 'test-target',
      target_name: 'Test Target',
      post_message: 'Test message',
      landing_page_url: 'https://test.com',
      status: 'pending',
      retry_count: 0,
      max_retries: 3,
    };
    
    const { data: insertResult, error: insertError } = await supabase
      .from('schedules')
      .insert(testData)
      .select()
      .single();
    
    if (insertError) {
      console.log('❌ Test insert failed:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Migration completed but test insert failed',
        details: insertError.message,
        code: insertError.code
      }, { status: 500 });
    }
    
    console.log('✅ Test insert successful:', insertResult);
    
    // Clean up test data
    await supabase
      .from('schedules')
      .delete()
      .eq('id', insertResult.id);
    
    return NextResponse.json({
      success: true,
      message: 'Migration completed successfully',
      testInsert: {
        success: true,
        insertedId: insertResult.id
      }
    });
    
  } catch (error) {
    console.error('❌ Migration error:', error);
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
    
    // Check if schedules table exists
    const { data: tableInfo, error: tableError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_name', 'schedules')
      .eq('table_schema', 'public');
    
    if (tableError) {
      console.log('❌ Error checking table:', tableError);
      return NextResponse.json({
        success: false,
        error: 'Failed to check table',
        details: tableError.message
      }, { status: 500 });
    }
    
    if (!tableInfo || tableInfo.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'Schedules table does not exist',
        needsMigration: true,
        tableInfo: []
      });
    }
    
    // Check if we can query the table
    const { data: schedules, error: queryError } = await supabase
      .from('schedules')
      .select('id')
      .limit(1);
    
    if (queryError) {
      console.log('❌ Query error:', queryError);
      return NextResponse.json({
        success: false,
        error: 'Table exists but query failed',
        details: queryError.message,
        tableInfo
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Schedules table exists and is queryable',
      needsMigration: false,
      tableInfo,
      canQuery: true
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
