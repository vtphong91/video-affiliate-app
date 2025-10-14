import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug DateTimePicker Issue - Starting...');
    
    // Test various date/time scenarios
    const testCases = [
      {
        name: 'Current Date',
        date: new Date(),
        description: 'Current date and time'
      },
      {
        name: 'Tomorrow 9 AM',
        date: (() => {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(9, 0, 0, 0);
          return tomorrow;
        })(),
        description: 'Tomorrow at 9:00 AM'
      },
      {
        name: 'Next Week 14:30',
        date: (() => {
          const nextWeek = new Date();
          nextWeek.setDate(nextWeek.getDate() + 7);
          nextWeek.setHours(14, 30, 0, 0);
          return nextWeek;
        })(),
        description: 'Next week at 2:30 PM'
      },
      {
        name: 'Invalid Date',
        date: new Date('invalid'),
        description: 'Invalid date string'
      }
    ];
    
    const analysis = testCases.map(testCase => {
      const date = testCase.date;
      
      return {
        testName: testCase.name,
        description: testCase.description,
        originalDate: date,
        isValidDate: !isNaN(date.getTime()),
        isoString: date.toISOString(),
        isoDatePart: date.toISOString().split('T')[0],
        timeString: date.toTimeString().slice(0, 5),
        hours: date.getHours(),
        minutes: date.getMinutes(),
        getTimeValue: date.getTime(),
        localeString: date.toLocaleString('vi-VN'),
        // Test input value generation
        dateInputValue: (() => {
          try {
            return date.toISOString().split('T')[0];
          } catch {
            return '2024-01-01';
          }
        })(),
        timeInputValue: (() => {
          try {
            return date.toTimeString().slice(0, 5);
          } catch {
            return '09:00';
          }
        })(),
        // Test parsing scenarios
        parsingTests: {
          fromISOString: (() => {
            try {
              const parsed = new Date(date.toISOString());
              return {
                success: true,
                result: parsed,
                isValid: !isNaN(parsed.getTime())
              };
            } catch (error) {
              return {
                success: false,
                error: error.message
              };
            }
          })(),
          fromDateInput: (() => {
            try {
              const dateStr = date.toISOString().split('T')[0];
              const parsed = new Date(dateStr);
              return {
                success: true,
                result: parsed,
                isValid: !isNaN(parsed.getTime())
              };
            } catch (error) {
              return {
                success: false,
                error: error.message
              };
            }
          })(),
          fromTimeInput: (() => {
            try {
              const timeStr = date.toTimeString().slice(0, 5);
              const [hours, minutes] = timeStr.split(':').map(Number);
              const testDate = new Date();
              testDate.setHours(hours, minutes, 0, 0);
              return {
                success: true,
                result: testDate,
                isValid: !isNaN(testDate.getTime()),
                hours,
                minutes
              };
            } catch (error) {
              return {
                success: false,
                error: error.message
              };
            }
          })()
        }
      };
    });
    
    return NextResponse.json({
      success: true,
      data: {
        testCases: analysis,
        recommendations: {
          issues: [
            'Date and time inputs are not properly synchronized',
            'Complex try-catch blocks make debugging difficult',
            'No proper validation for edge cases',
            'State updates might cause unnecessary re-renders'
          ],
          solutions: [
            'Simplify date/time handling with unified state management',
            'Add proper validation for all date/time operations',
            'Use controlled components with proper onChange handlers',
            'Implement proper error boundaries for date operations'
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug datetimepicker:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
