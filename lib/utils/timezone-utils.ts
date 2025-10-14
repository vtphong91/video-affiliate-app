// lib/utils/timezone-utils.ts

import { format, parseISO, differenceInMinutes, addMinutes } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TARGET_TIMEZONE = 'Asia/Ho_Chi_Minh'; // GMT+7

/**
 * Tạo timestamp GMT+7 từ DateTimePicker để lưu database
 * Input: Date object từ DateTimePicker (GMT+7)
 * Output: GMT+7 ISO string để lưu database (không convert UTC)
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
  
  // Tạo Date object với thời gian GMT+7 từ DateTimePicker
  const gmt7Date = new Date(date);
  gmt7Date.setHours(hours, minutes, 0, 0);
  
  console.log('🔍 GMT+7 Date from picker:', gmt7Date);
  
  // Tạo GMT+7 ISO string với timezone offset để lưu database
  // Format: YYYY-MM-DDTHH:mm:ss.sss+07:00
  const year = gmt7Date.getFullYear();
  const month = (gmt7Date.getMonth() + 1).toString().padStart(2, '0');
  const day = gmt7Date.getDate().toString().padStart(2, '0');
  const hour = gmt7Date.getHours().toString().padStart(2, '0');
  const minute = gmt7Date.getMinutes().toString().padStart(2, '0');
  const second = gmt7Date.getSeconds().toString().padStart(2, '0');
  
  const gmt7ISOString = `${year}-${month}-${day}T${hour}:${minute}:${second}.000+07:00`;
  
  console.log('🔍 GMT+7 ISO string for database:', gmt7ISOString);

  return gmt7ISOString; // Store as GMT+7 ISO string
}

/**
 * Tạo timestamp GMT+7 từ datetime-local input string
 * Input: datetime-local string (YYYY-MM-DDTHH:MM)
 * Output: GMT+7 ISO string để lưu database
 */
export function createTimestampFromDateTimeLocal(dateTimeString: string): string {
  console.log('🔍 createTimestampFromDateTimeLocal - Input:', dateTimeString);
  
  if (!dateTimeString || typeof dateTimeString !== 'string') {
    console.error('❌ Invalid datetime-local parameter:', dateTimeString);
    throw new Error('DateTime parameter is required and must be a string');
  }
  
  // Parse datetime-local string (YYYY-MM-DDTHH:MM)
  const date = new Date(dateTimeString);
  
  if (isNaN(date.getTime())) {
    console.error('❌ Invalid datetime format:', dateTimeString);
    throw new Error('Invalid datetime format');
  }
  
  console.log('🔍 Parsed Date:', date);
  
  // Tạo GMT+7 ISO string với timezone offset để lưu database
  // Format: YYYY-MM-DDTHH:mm:ss.sss+07:00
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hour = date.getHours().toString().padStart(2, '0');
  const minute = date.getMinutes().toString().padStart(2, '0');
  const second = date.getSeconds().toString().padStart(2, '0');
  
  const gmt7ISOString = `${year}-${month}-${day}T${hour}:${minute}:${second}.000+07:00`;
  
  console.log('🔍 GMT+7 ISO string for database:', gmt7ISOString);

  return gmt7ISOString; // Store as GMT+7 ISO string
}

/**
 * Parse timestamp GMT+7 từ database cho display
 * Input: GMT+7 ISO string từ database
 * Output: Date object GMT+7 để hiển thị UI (không cần conversion)
 */
export function parseTimestampFromDatabase(isoString: string): Date {
  console.log('🔍 parseTimestampFromDatabase - Input GMT+7 ISO:', isoString);
  
  // Parse GMT+7 string từ database trực tiếp
  const gmt7Date = parseISO(isoString);
  console.log('🔍 GMT+7 Date from database:', gmt7Date);
  
  return gmt7Date;
}

export function formatTimestampForDisplay(isoString: string | Date | null | undefined, formatStr: string = 'dd/MM/yyyy HH:mm'): string {
  if (!isoString) return 'N/A';
  const date = typeof isoString === 'string' ? parseISO(isoString) : isoString;
  if (isNaN(date.getTime())) return 'Invalid Date';

  // Convert UTC date to target timezone for display
  const zonedDate = toZonedTime(date, TARGET_TIMEZONE);
  return format(zonedDate, formatStr, { timeZone: TARGET_TIMEZONE });
}

/**
 * Tính thời gian còn lại từ GMT+7 timestamp trong database
 * Input: GMT+7 ISO string từ database
 * Output: Object với days, hours, minutes, isOverdue
 */
export function calculateTimeRemaining(scheduledForIso: string): { days: number; hours: number; minutes: number; isOverdue: boolean } {
  console.log('🔍 calculateTimeRemaining - Input GMT+7 ISO:', scheduledForIso);
  
  // Parse GMT+7 string từ database trực tiếp
  const scheduledGmt7Date = parseISO(scheduledForIso);
  console.log('🔍 Scheduled GMT+7 Date:', scheduledGmt7Date);
  
  // Current time GMT+7
  const nowGmt7 = new Date();
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
  const now = new Date();
  
  // Tạo GMT+7 timestamp để so sánh với database
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const hour = now.getHours().toString().padStart(2, '0');
  const minute = now.getMinutes().toString().padStart(2, '0');
  const second = now.getSeconds().toString().padStart(2, '0');
  
  const gmt7Timestamp = `${year}-${month}-${day}T${hour}:${minute}:${second}.000+07:00`;
  
  console.log('🔍 getCurrentTimestamp - GMT+7:', gmt7Timestamp);
  
  return gmt7Timestamp;
}

// Helper to format date/time for display in GMT+7
export function formatDateTime(isoString: string | Date | null | undefined): string {
  return formatTimestampForDisplay(isoString, 'dd/MM/yyyy HH:mm');
}

// Helper to format scheduled time for display in GMT+7
export function formatScheduledTime(isoString: string | Date | null | undefined): string {
  return formatTimestampForDisplay(isoString, 'HH:mm');
}