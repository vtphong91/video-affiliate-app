import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug Environment Variables - Starting...');
    
    // Check critical environment variables
    const envCheck = {
      CRON_SECRET: process.env.CRON_SECRET ? '✅ Set' : '❌ Missing',
      MAKECOM_WEBHOOK_URL: process.env.MAKECOM_WEBHOOK_URL ? '✅ Set' : '❌ Missing',
      MAKECOM_WEBHOOK_SECRET: process.env.MAKECOM_WEBHOOK_SECRET ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing',
    };
    
    // Check webhook URL format
    const webhookUrl = process.env.MAKECOM_WEBHOOK_URL;
    const webhookUrlValid = webhookUrl && 
      (webhookUrl.startsWith('https://hook.') || webhookUrl.includes('make.com'));
    
    // Check cron secret
    const cronSecret = process.env.CRON_SECRET;
    const cronSecretValid = cronSecret && cronSecret.length > 10;
    
    return NextResponse.json({
      success: true,
      data: {
        environmentVariables: envCheck,
        webhookUrl: {
          value: webhookUrl ? `${webhookUrl.substring(0, 20)}...` : 'Not set',
          isValid: webhookUrlValid,
          format: webhookUrlValid ? '✅ Valid Make.com webhook format' : '❌ Invalid format'
        },
        cronSecret: {
          isSet: !!cronSecret,
          isValid: cronSecretValid,
          length: cronSecret ? cronSecret.length : 0
        },
        recommendations: {
          issues: [
            ...(webhookUrlValid ? [] : ['MAKECOM_WEBHOOK_URL is missing or invalid']),
            ...(cronSecretValid ? [] : ['CRON_SECRET is missing or too short']),
            ...(envCheck.MAKECOM_WEBHOOK_SECRET.includes('❌') ? ['MAKECOM_WEBHOOK_SECRET is missing'] : [])
          ],
          actions: [
            'Check .env.local file exists and has correct values',
            'Verify Make.com webhook URL is correct',
            'Ensure CRON_SECRET is set and secure',
            'Restart development server after env changes'
          ]
        }
      }
    });
    
  } catch (error) {
    console.error('❌ Error in debug environment:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack
    }, { status: 500 });
  }
}
