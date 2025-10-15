/**
 * Schedule Monitor Utility
 * Monitors schedule health and detects overdue issues
 */

import { supabaseAdmin } from '@/lib/db/supabase';

export interface ScheduleHealthReport {
  healthy: boolean;
  totalPending: number;
  overdueCount: number;
  overdueSeverity: 'none' | 'minor' | 'major' | 'critical';
  overdueSchedules: Array<{
    id: string;
    video_title: string;
    scheduled_for: string;
    hoursOverdue: number;
    created_at: string;
  }>;
  recommendations: string[];
}

/**
 * Check for overdue schedules and return health report
 */
export async function checkScheduleHealth(
  thresholdMinutes = 30
): Promise<ScheduleHealthReport> {
  try {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() - thresholdMinutes * 60 * 1000);

    // Get all pending schedules
    const { data: pendingSchedules, error } = await supabaseAdmin
      .from('schedules')
      .select('id, video_title, scheduled_for, created_at')
      .eq('status', 'pending')
      .order('scheduled_for', { ascending: true });

    if (error) {
      console.error('❌ Error checking schedule health:', error);
      throw error;
    }

    const totalPending = pendingSchedules?.length || 0;

    // Find overdue schedules
    const overdueSchedules = (pendingSchedules || [])
      .filter(schedule => {
        const scheduledTime = new Date(schedule.scheduled_for);
        return scheduledTime < thresholdDate;
      })
      .map(schedule => {
        const scheduledTime = new Date(schedule.scheduled_for);
        const hoursOverdue = (now.getTime() - scheduledTime.getTime()) / (1000 * 60 * 60);
        return {
          id: schedule.id,
          video_title: schedule.video_title,
          scheduled_for: schedule.scheduled_for,
          hoursOverdue: Math.round(hoursOverdue * 10) / 10,
          created_at: schedule.created_at,
        };
      });

    const overdueCount = overdueSchedules.length;

    // Determine severity
    let overdueSeverity: ScheduleHealthReport['overdueSeverity'] = 'none';
    if (overdueCount > 0) {
      const maxOverdueHours = Math.max(...overdueSchedules.map(s => s.hoursOverdue));
      if (maxOverdueHours >= 24) {
        overdueSeverity = 'critical'; // 24+ hours overdue
      } else if (maxOverdueHours >= 6) {
        overdueSeverity = 'major'; // 6-24 hours overdue
      } else if (maxOverdueHours >= 1) {
        overdueSeverity = 'minor'; // 1-6 hours overdue
      }
    }

    // Generate recommendations
    const recommendations: string[] = [];
    if (overdueCount > 0) {
      recommendations.push(
        `Found ${overdueCount} schedules overdue by more than ${thresholdMinutes} minutes`
      );

      if (overdueSeverity === 'critical') {
        recommendations.push('🔴 CRITICAL: Schedules are 24+ hours overdue - check GitHub Actions cron');
        recommendations.push('Action: Verify cron is running, check Make.com webhook');
      } else if (overdueSeverity === 'major') {
        recommendations.push('🟠 MAJOR: Schedules are 6+ hours overdue - investigate delays');
        recommendations.push('Action: Check Vercel logs, GitHub Actions status');
      } else {
        recommendations.push('🟡 MINOR: Some recent schedules overdue - may be normal delay');
        recommendations.push('Action: Monitor, GitHub Actions runs every 5 minutes');
      }

      // Check if these are old schedules (created before timezone fix)
      const oldSchedules = overdueSchedules.filter(
        s => new Date(s.created_at) < new Date('2025-10-15T00:00:00Z')
      );
      if (oldSchedules.length > 0) {
        recommendations.push(
          `⚠️ ${oldSchedules.length} overdue schedules were created before timezone fix (2025-10-15)`
        );
        recommendations.push('Action: Run cleanup script in sql/cleanup-old-schedules-*.sql');
      }
    } else {
      recommendations.push('✅ All schedules are on time');
    }

    const healthy = overdueCount === 0 || overdueSeverity === 'none';

    return {
      healthy,
      totalPending,
      overdueCount,
      overdueSeverity,
      overdueSchedules,
      recommendations,
    };
  } catch (error) {
    console.error('❌ Exception in checkScheduleHealth:', error);
    throw error;
  }
}

/**
 * Log schedule health to console with formatting
 */
export function logScheduleHealth(report: ScheduleHealthReport): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 SCHEDULE HEALTH REPORT');
  console.log('='.repeat(60));
  console.log(`Status: ${report.healthy ? '🟢 HEALTHY' : '🔴 UNHEALTHY'}`);
  console.log(`Total Pending: ${report.totalPending}`);
  console.log(`Overdue Count: ${report.overdueCount}`);
  console.log(`Severity: ${report.overdueSeverity.toUpperCase()}`);

  if (report.overdueSchedules.length > 0) {
    console.log('\n📋 Overdue Schedules:');
    report.overdueSchedules.slice(0, 5).forEach((schedule, index) => {
      console.log(`  ${index + 1}. ${schedule.video_title}`);
      console.log(`     Scheduled: ${schedule.scheduled_for}`);
      console.log(`     Overdue by: ${schedule.hoursOverdue} hours`);
    });
    if (report.overdueSchedules.length > 5) {
      console.log(`  ... and ${report.overdueSchedules.length - 5} more`);
    }
  }

  if (report.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    report.recommendations.forEach(rec => {
      console.log(`  • ${rec}`);
    });
  }

  console.log('='.repeat(60) + '\n');
}

/**
 * Monitor and alert on schedule health
 * Call this from cron or API endpoint
 */
export async function monitorScheduleHealth(
  alertThresholdMinutes = 30
): Promise<ScheduleHealthReport> {
  const report = await checkScheduleHealth(alertThresholdMinutes);

  logScheduleHealth(report);

  // TODO: Add alerting here (email, Slack, etc.)
  if (!report.healthy && report.overdueSeverity !== 'none') {
    console.warn('⚠️ Schedule health check failed - consider sending alert');
    // Example: await sendAlert(report);
  }

  return report;
}
