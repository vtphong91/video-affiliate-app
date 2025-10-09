# PowerShell script to start auto cron job
Write-Host "=== STARTING AUTO CRON JOB ===" -ForegroundColor Green
Write-Host "This will run cron job every 30 seconds to process scheduled posts" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host ""

# Start the auto cron job
node auto-cron.js
