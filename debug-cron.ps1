# PowerShell script to debug cron job and schedules
# This script calls the debug API to get detailed information

param(
    [string]$Secret = "dev-secret"
)

# Use the correct secret
$Secret = "4c32057816828f973d578326de17767caac3e8befa4167f4bbbf01b1a46bad46"

Write-Host "=== DEBUG CRON JOB ===" -ForegroundColor Green
Write-Host "Secret: $Secret" -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""

try {
    # Call the debug API endpoint
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/cron/debug-schedules" -Method GET -Headers @{
        "x-cron-secret" = $Secret
        "Content-Type" = "application/json"
    } -TimeoutSec 30

    Write-Host "✅ Debug information retrieved successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Display current time
    Write-Host "=== CURRENT TIME ===" -ForegroundColor Cyan
    Write-Host "UTC: $($response.data.currentTime.utc)" -ForegroundColor White
    Write-Host "GMT+7: $($response.data.currentTime.gmt7)" -ForegroundColor White
    Write-Host "GMT+7 Formatted: $($response.data.currentTime.gmt7Formatted)" -ForegroundColor White
    Write-Host ""
    
    # Display pending schedules
    Write-Host "=== PENDING SCHEDULES ===" -ForegroundColor Cyan
    Write-Host "Count: $($response.data.pendingSchedules.count)" -ForegroundColor White
    if ($response.data.pendingSchedules.count -gt 0) {
        foreach ($schedule in $response.data.pendingSchedules.schedules) {
            $overdueColor = if ($schedule.isOverdue) { "Red" } else { "Green" }
            $overdueText = if ($schedule.isOverdue) { "OVERDUE" } else { "OK" }
            Write-Host "  ID: $($schedule.id)" -ForegroundColor White
            Write-Host "  Scheduled: $($schedule.scheduledFor)" -ForegroundColor White
            Write-Host "  Status: $($schedule.status)" -ForegroundColor White
            Write-Host "  Review: $($schedule.reviewTitle)" -ForegroundColor White
            Write-Host "  Overdue: $overdueText" -ForegroundColor $overdueColor
            Write-Host "  Time until due: $($schedule.timeUntilDue) ms" -ForegroundColor White
            Write-Host ""
        }
    }
    
    # Display failed schedules
    Write-Host "=== FAILED SCHEDULES ===" -ForegroundColor Cyan
    Write-Host "Count: $($response.data.failedSchedules.count)" -ForegroundColor White
    if ($response.data.failedSchedules.count -gt 0) {
        foreach ($schedule in $response.data.failedSchedules.schedules) {
            Write-Host "  ID: $($schedule.id)" -ForegroundColor White
            Write-Host "  Scheduled: $($schedule.scheduledFor)" -ForegroundColor White
            Write-Host "  Status: $($schedule.status)" -ForegroundColor White
            Write-Host "  Retry Count: $($schedule.retryCount)/$($schedule.maxRetries)" -ForegroundColor White
            Write-Host "  Next Retry: $($schedule.nextRetryAt)" -ForegroundColor White
            Write-Host "  Error: $($schedule.errorMessage)" -ForegroundColor Red
            Write-Host "  Review: $($schedule.reviewTitle)" -ForegroundColor White
            Write-Host ""
        }
    }
    
    # Display webhook configuration
    Write-Host "=== WEBHOOK CONFIGURATION ===" -ForegroundColor Cyan
    Write-Host "Webhook URL: $($response.data.webhookConfig.webhookUrl)" -ForegroundColor White
    Write-Host "Cron Secret: $($response.data.webhookConfig.cronSecret)" -ForegroundColor White
    Write-Host ""

} catch {
    Write-Host "❌ Debug API failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host "=== DEBUG COMPLETED ===" -ForegroundColor Green
