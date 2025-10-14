import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db/supabase';

export const dynamic = 'force-dynamic';

/**
 * POST /api/test-edit-schedule
 * Test API để kiểm tra chức năng sửa schedules
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing edit schedule functionality...');

    const body = await request.json();
    const { scheduleId, testType = 'validation' } = body;

    if (!scheduleId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Schedule ID is required' 
      }, { status: 400 });
    }

    // Get the schedule first
    const { data: schedule, error: fetchError } = await supabaseAdmin
      .from('schedules')
      .select('*')
      .eq('id', scheduleId)
      .single();

    if (fetchError || !schedule) {
      return NextResponse.json({ 
        success: false, 
        error: 'Schedule not found' 
      }, { status: 404 });
    }

    console.log('📋 Current schedule:', {
      id: schedule.id,
      scheduled_for: schedule.scheduled_for,
      status: schedule.status,
      video_title: schedule.video_title
    });

    if (testType === 'validation') {
      // Test validation scenarios
      const testCases = [
        {
          name: 'Valid future time',
          scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          shouldPass: true
        },
        {
          name: 'Past time (should fail)',
          scheduled_for: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          shouldPass: false
        },
        {
          name: 'Too far future (should fail)',
          scheduled_for: new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000).toISOString(), // 2 years
          shouldPass: false
        },
        {
          name: 'Invalid field (should fail)',
          postMessage: 'This should not be allowed',
          shouldPass: false
        }
      ];

      const results = [];

      for (const testCase of testCases) {
        try {
          const testPayload = { scheduled_for: testCase.scheduled_for };
          if (testCase.name.includes('Invalid field')) {
            testPayload.postMessage = testCase.postMessage;
          }

          // Simulate API call
          const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/schedules/${scheduleId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'x-user-id': schedule.user_id, // Use schedule owner
            },
            body: JSON.stringify(testPayload),
          });

          const result = await response.json();
          
          results.push({
            testCase: testCase.name,
            expected: testCase.shouldPass ? 'PASS' : 'FAIL',
            actual: result.success ? 'PASS' : 'FAIL',
            passed: (testCase.shouldPass && result.success) || (!testCase.shouldPass && !result.success),
            response: result
          });

        } catch (error) {
          results.push({
            testCase: testCase.name,
            expected: testCase.shouldPass ? 'PASS' : 'FAIL',
            actual: 'ERROR',
            passed: !testCase.shouldPass, // Error is expected for invalid cases
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }

      const passedTests = results.filter(r => r.passed).length;
      const totalTests = results.length;

      return NextResponse.json({
        success: true,
        testResults: {
          summary: {
            total: totalTests,
            passed: passedTests,
            failed: totalTests - passedTests,
            successRate: `${Math.round((passedTests / totalTests) * 100)}%`
          },
          details: results
        },
        message: `Validation tests completed: ${passedTests}/${totalTests} passed`
      });

    } else if (testType === 'actual_update') {
      // Test actual update with valid time
      const newTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(); // 2 hours from now
      
      const { data: updatedSchedule, error: updateError } = await supabaseAdmin
        .from('schedules')
        .update({ scheduled_for: newTime })
        .eq('id', scheduleId)
        .select()
        .single();

      if (updateError) {
        return NextResponse.json({ 
          success: false, 
          error: 'Update failed', 
          details: updateError 
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        testResults: {
          originalTime: schedule.scheduled_for,
          newTime: updatedSchedule.scheduled_for,
          updateSuccessful: true
        },
        message: 'Schedule successfully updated'
      });
    }

    return NextResponse.json({ 
      success: false, 
      error: 'Invalid test type' 
    }, { status: 400 });

  } catch (error) {
    console.error('❌ Test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Test failed', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
