// lib/utils/timezone-utils.ts

import { format, parseISO, differenceInMinutes, addMinutes } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TARGET_TIMEZONE = 'Asia/Ho_Chi_Minh'; // GMT+7

/**
 * Tạo timestamp GMT+7 từ DateTimePicker để lưu database
 * Input: Date object từ DateTimePicker (user's local time - GMT+7)
 * Output: GMT+7 timestamp string cho PostgreSQL
 */
export function createTimestampFromDatePicker(date: Date, time: string): string {
  console.log('🔍 createTimestampFromDatePicker - Input Date:', date, 'Time:', time);

  // Handle case where time is undefined or invalid
  if (!time || typeof time !== 'string') {
    console.error('❌ Invalid time parameter:', time);
    throw new Error('Time parameter is required and must be a string');
  }

  const [hours, minutes] = time.split(':').map(Number);

  // Validate hours and minutes
  if (isNaN(hours) || isNaN(minutes)) {
    console.error('❌ Invalid time format:', time);
    throw new Error('Time must be in HH:MM format');
  }

  // Create timestamp in GMT+7 (user's timezone)
  const localDate = new Date(date);
  localDate.setHours(hours, minutes, 0, 0);

  console.log('🔍 Local Date:', localDate);

  // Format as PostgreSQL timestamp: YYYY-MM-DD HH:MM:SS
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const hour = String(localDate.getHours()).padStart(2, '0');
  const minute = String(localDate.getMinutes()).padStart(2, '0');
  const second = String(localDate.getSeconds()).padStart(2, '0');

  const timestampString = `${year}-${month}-${day} ${hour}:${minute}:${second}`;

  console.log('🔍 Timestamp string for database:', timestampString);

  return timestampString; // Store as GMT+7 timestamp
}

/**
 * Tạo timestamp UTC từ datetime-local input string
 * Input: datetime-local string (YYYY-MM-DDTHH:MM) - assumed to be GMT+7
 * Output: UTC ISO string để lưu database
 */
export function createTimestampFromDateTimeLocal(dateTimeString: string): string {
  console.log('🔍 createTimestampFromDateTimeLocal - Input:', dateTimeString);

  if (!dateTimeString || typeof dateTimeString !== 'string') {
    console.error('❌ Invalid datetime-local parameter:', dateTimeString);
    throw new Error('DateTime parameter is required and must be a string');
  }

  // Parse datetime-local string as GMT+7
  const gmt7Date = toZonedTime(new Date(dateTimeString), TARGET_TIMEZONE);

  if (isNaN(gmt7Date.getTime())) {
    console.error('❌ Invalid datetime format:', dateTimeString);
    throw new Error('Invalid datetime format');
  }

  console.log('🔍 Parsed GMT+7 Date:', gmt7Date);

  // Convert GMT+7 to UTC for database storage
  const utcDate = fromZonedTime(gmt7Date, TARGET_TIMEZONE);
  const utcISOString = utcDate.toISOString();

  console.log('🔍 UTC ISO string for database:', utcISOString);

  return utcISOString; // Store as UTC ISO string
}

/**
 * Parse timestamp UTC từ database và convert sang GMT+7 cho display
 * Input: UTC ISO string từ database
 * Output: Date object đã convert sang GMT+7 để hiển thị UI
 */
export function parseTimestampFromDatabase(isoString: string): Date {
  console.log('🔍 parseTimestampFromDatabase - Input UTC ISO:', isoString);

  // Parse UTC string từ database
  const utcDate = parseISO(isoString);

  // Convert UTC to GMT+7 for display
  const gmt7Date = toZonedTime(utcDate, TARGET_TIMEZONE);

  console.log('🔍 UTC Date from database:', utcDate);
  console.log('🔍 GMT+7 Date for display:', gmt7Date);

  return gmt7Date;
}

export function formatTimestampForDisplay(isoString: string | Date | null | undefined, formatStr: string = 'dd/MM/yyyy HH:mm'): string {
  if (!isoString) return 'N/A';
  const date = typeof isoString === 'string' ? parseISO(isoString) : isoString;
  if (isNaN(date.getTime())) return 'Invalid Date';

  // Convert UTC date to target timezone for display
  const zonedDate = toZonedTime(date, TARGET_TIMEZONE);
  return format(zonedDate, formatStr);
}

/**
 * Tính thời gian còn lại từ UTC timestamp trong database
 * Input: UTC ISO string từ database
 * Output: Object với days, hours, minutes, isOverdue
 */
export function calculateTimeRemaining(scheduledForIso: string): { days: number; hours: number; minutes: number; isOverdue: boolean } {
  console.log('🔍 calculateTimeRemaining - Input UTC ISO:', scheduledForIso);

  // Parse UTC string từ database
  const scheduledUtcDate = parseISO(scheduledForIso);

  // Convert scheduled time to GMT+7
  const scheduledGmt7Date = toZonedTime(scheduledUtcDate, TARGET_TIMEZONE);
  console.log('🔍 Scheduled GMT+7 Date:', scheduledGmt7Date);

  // Current time in GMT+7
  const nowUtc = new Date();
  const nowGmt7 = toZonedTime(nowUtc, TARGET_TIMEZONE);
  console.log('🔍 Current GMT+7 Date:', nowGmt7);

  const diffMinutes = differenceInMinutes(scheduledGmt7Date, nowGmt7);

  const isOverdue = diffMinutes < 0;
  const absDiffMinutes = Math.abs(diffMinutes);

  const days = Math.floor(absDiffMinutes / (60 * 24));
  const hours = Math.floor((absDiffMinutes % (60 * 24)) / 60);
  const minutes = absDiffMinutes % 60;

  console.log('🔍 Time remaining:', { days, hours, minutes, isOverdue });

  return { days, hours, minutes, isOverdue };
}

export function debugTimezone(label: string, date: Date) {
  console.log(`[${label}] Local: ${date.toLocaleString()}`);
  console.log(`[${label}] UTC: ${date.toUTCString()}`);
  try {
    const zoned = toZonedTime(date, TARGET_TIMEZONE);
    console.log(`[${label}] Zoned (${TARGET_TIMEZONE}): ${zoned.toLocaleString('en-US', { timeZone: TARGET_TIMEZONE })}`);
  } catch (e) {
    console.error(`Error zoning date for ${label}:`, e);
  }
}

export function getCurrentTimestamp(): string {
  // Simply return current UTC time
  const now = new Date();
  const utcTimestamp = now.toISOString();

  console.log('🔍 getCurrentTimestamp - UTC:', utcTimestamp);

  return utcTimestamp;
}

// Helper to format date/time for display in GMT+7
export function formatDateTime(isoString: string | Date | null | undefined): string {
  return formatTimestampForDisplay(isoString, 'dd/MM/yyyy HH:mm');
}

// Helper to format scheduled time for display in GMT+7
export function formatScheduledTime(isoString: string | Date | null | undefined): string {
  return formatTimestampForDisplay(isoString, 'HH:mm');
}