// Test timezone handling fix
// Run: node test-timezone-fix.js

import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const TARGET_TIMEZONE = 'Asia/Ho_Chi_Minh'; // GMT+7

console.log('🧪 Testing Timezone Handling Fix\n');
console.log('='.repeat(60));

// Test 1: createTimestampFromDatePicker simulation
console.log('\n📅 Test 1: Create timestamp from DatePicker');
console.log('-'.repeat(60));

const testDate = new Date('2025-10-15'); // User selects this date
const testTime = '14:30'; // User selects this time (GMT+7)

const [hours, minutes] = testTime.split(':').map(Number);
const year = testDate.getFullYear();
const month = testDate.getMonth();
const day = testDate.getDate();

const gmt7DateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`;

console.log('User input:');
console.log('  Date:', testDate.toDateString());
console.log('  Time:', testTime, 'GMT+7');
console.log('\nGMT+7 Date String:', gmt7DateString);

const gmt7Date = toZonedTime(new Date(gmt7DateString), TARGET_TIMEZONE);
const utcDate = fromZonedTime(gmt7Date, TARGET_TIMEZONE);
const utcISOString = utcDate.toISOString();

console.log('GMT+7 Date Object:', gmt7Date);
console.log('UTC Date Object:', utcDate);
console.log('✅ UTC ISO String (to save in DB):', utcISOString);

// Test 2: Parse timestamp from database
console.log('\n\n📥 Test 2: Parse timestamp from database');
console.log('-'.repeat(60));

const dbTimestamp = utcISOString; // Simulate reading from DB
console.log('Database UTC timestamp:', dbTimestamp);

const parsedUTC = new Date(dbTimestamp);
const parsedGMT7 = toZonedTime(parsedUTC, TARGET_TIMEZONE);

console.log('Parsed UTC Date:', parsedUTC.toISOString());
console.log('✅ Parsed GMT+7 Date (for display):', parsedGMT7.toLocaleString('en-US', { timeZone: TARGET_TIMEZONE }));

// Test 3: Compare timestamps for getPendingSchedules
console.log('\n\n🔍 Test 3: Check if schedule is due (getPendingSchedules logic)');
console.log('-'.repeat(60));

const nowUTC = new Date();
const nowUTCString = nowUTC.toISOString();
const scheduledForUTC = utcISOString; // From Test 1

console.log('Current UTC:', nowUTCString);
console.log('Scheduled UTC:', scheduledForUTC);

const isDue = new Date(scheduledForUTC) <= new Date(nowUTCString);
console.log('✅ Is Due:', isDue);
console.log('   Reason:', isDue ? 'Scheduled time <= Current time' : 'Scheduled time > Current time');

// Test 4: Simulate different scenarios
console.log('\n\n🎯 Test 4: Different Scenarios');
console.log('-'.repeat(60));

const scenarios = [
  { label: 'Schedule for 5 minutes ago', offset: -5 },
  { label: 'Schedule for now', offset: 0 },
  { label: 'Schedule for 5 minutes later', offset: 5 },
  { label: 'Schedule for 1 hour later', offset: 60 },
];

scenarios.forEach(scenario => {
  const scheduledTime = new Date(Date.now() + scenario.offset * 60 * 1000);
  const scheduledUTC = scheduledTime.toISOString();
  const scheduledGMT7 = toZonedTime(scheduledTime, TARGET_TIMEZONE);
  const isDue = scheduledTime <= new Date();

  console.log(`\n${scenario.label}:`);
  console.log('  Scheduled UTC:', scheduledUTC);
  console.log('  Scheduled GMT+7:', scheduledGMT7.toLocaleString('en-US', { timeZone: TARGET_TIMEZONE }));
  console.log('  Is Due:', isDue ? '✅ YES' : '❌ NO');
});

// Test 5: Verify timezone conversion is correct
console.log('\n\n🔬 Test 5: Verify GMT+7 ↔ UTC Conversion');
console.log('-'.repeat(60));

const testCases = [
  { gmt7: '2025-10-15 09:00:00', expectedUTC: '2025-10-15T02:00:00.000Z' },
  { gmt7: '2025-10-15 16:30:00', expectedUTC: '2025-10-15T09:30:00.000Z' },
  { gmt7: '2025-10-15 23:59:59', expectedUTC: '2025-10-15T16:59:59.000Z' },
];

testCases.forEach((testCase, index) => {
  const [datePart, timePart] = testCase.gmt7.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hours, minutes, seconds] = timePart.split(':').map(Number);

  const gmt7String = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const gmt7Date = toZonedTime(new Date(gmt7String), TARGET_TIMEZONE);
  const utcDate = fromZonedTime(gmt7Date, TARGET_TIMEZONE);
  const actualUTC = utcDate.toISOString();

  const matches = actualUTC === testCase.expectedUTC;

  console.log(`\nTest Case ${index + 1}:`);
  console.log('  GMT+7 Input:', testCase.gmt7);
  console.log('  Expected UTC:', testCase.expectedUTC);
  console.log('  Actual UTC:', actualUTC);
  console.log('  Result:', matches ? '✅ PASS' : '❌ FAIL');
});

console.log('\n' + '='.repeat(60));
console.log('✅ All tests completed!\n');
