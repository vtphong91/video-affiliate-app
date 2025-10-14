// Test timezone logic
const testSchedules = [
  { id: 'test1', scheduled_for: '2025-10-14 16:25:00' },
  { id: 'test2', scheduled_for: '2025-10-14 16:30:00' },
  { id: 'test3', scheduled_for: '2025-10-14 16:35:00' },
  { id: 'test4', scheduled_for: '2025-10-14 16:36:00' },
  { id: 'test5', scheduled_for: '2025-10-14 16:38:00' }
];

// Current time logic (same as in getPendingSchedules)
const now = new Date();
const gmt7Offset = 7 * 60 * 60 * 1000; // GMT+7 offset in milliseconds
const currentGMT7 = new Date(now.getTime() + gmt7Offset);

console.log('🔍 Current time debug:');
console.log('Server UTC:', now.toISOString());
console.log('Current GMT+7:', currentGMT7.toISOString());
console.log('Current GMT+7 (formatted):', currentGMT7.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

console.log('\n🔍 Testing each schedule:');

testSchedules.forEach((schedule, index) => {
  const scheduledFor = schedule.scheduled_for;
  
  // Parse the scheduled_for time - handle both formats
  let scheduledDate;

  if (scheduledFor.includes('T') || scheduledFor.includes('Z')) {
    // ISO format - parse directly
    scheduledDate = new Date(scheduledFor);
  } else {
    // PostgreSQL format: "2025-10-14 16:25:00" - treat as GMT+7
    const [datePart, timePart] = scheduledFor.split(' ');
    const [year, month, day] = datePart.split('-').map(Number);
    const [hours, minutes, seconds] = timePart.split(':').map(Number);

    // Create date assuming GMT+7 timezone
    // Convert GMT+7 to UTC by subtracting 7 hours
    scheduledDate = new Date(Date.UTC(year, month - 1, day, hours - 7, minutes, seconds));
  }

  // Convert scheduled time to GMT+7 for comparison
  const scheduledGMT7 = new Date(scheduledDate.getTime() + gmt7Offset);
  const isDue = scheduledGMT7.getTime() <= currentGMT7.getTime();

  console.log(`\n  - Schedule ${index + 1}:`);
  console.log(`    scheduled_for (raw): ${scheduledFor}`);
  console.log(`    scheduled_for (parsed UTC): ${scheduledDate.toISOString()}`);
  console.log(`    scheduled_for (GMT+7): ${scheduledGMT7.toISOString()}`);
  console.log(`    current (GMT+7): ${currentGMT7.toISOString()}`);
  console.log(`    isDue: ${isDue}`);
  console.log(`    timeDiff (minutes): ${Math.round((currentGMT7.getTime() - scheduledGMT7.getTime()) / (1000 * 60))}`);
});

console.log('\n✅ Test completed');
