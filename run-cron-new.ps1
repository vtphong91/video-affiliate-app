# PowerShell script to run cron job for processing scheduled posts
# This script calls the new separated cron API endpoint

param(
    [string]$Secret = "dev-secret"
)

# Use the correct secret
$Secret = "4c32057816828f973d578326de17767caac3e8befa4167f4bbbf01b1a46bad46"

Write-Host "=== CRON JOB - PROCESS SCHEDULED POSTS ===" -ForegroundColor Green
Write-Host "Secret: $Secret" -ForegroundColor Yellow
Write-Host "Timestamp: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor White
Write-Host ""

try {
    # Call the new cron API endpoint
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/cron/process-schedules" -Method GET -Headers @{
        "x-cron-secret" = $Secret
        "Content-Type" = "application/json"
    } -TimeoutSec 30

    Write-Host "✅ Cron job completed successfully!" -ForegroundColor Green
    Write-Host "Processed: $($response.processed)" -ForegroundColor White
    Write-Host "Posted: $($response.posted)" -ForegroundColor Green
    Write-Host "Failed: $($response.failed)" -ForegroundColor Red
    Write-Host "Posted without webhook: $($response.postedWithoutWebhook)" -ForegroundColor Yellow
    Write-Host "Duration: $($response.duration)" -ForegroundColor White
    Write-Host "Message: $($response.message)" -ForegroundColor Cyan
    
    if ($response.results -and $response.results.Count -gt 0) {
        Write-Host ""
        Write-Host "=== DETAILED RESULTS ===" -ForegroundColor Cyan
        foreach ($result in $response.results) {
            $statusColor = switch ($result.status) {
                "posted" { "Green" }
                "failed" { "Red" }
                "posted_without_webhook" { "Yellow" }
                default { "White" }
            }
            Write-Host "Schedule $($result.scheduleId): $($result.status) - $($result.message)" -ForegroundColor $statusColor
        }
    }

} catch {
    Write-Host "❌ Cron job failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Status Code: $statusCode" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== CRON JOB COMPLETED ===" -ForegroundColor Green
