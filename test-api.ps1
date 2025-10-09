# Simple API test script
Write-Host "Testing API..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/cron/debug-schedules" -Headers @{"x-cron-secret"="dev-secret"} -Method GET
    Write-Host "✅ API Response: $($response.StatusCode)" -ForegroundColor Green
    
    $json = $response.Content | ConvertFrom-Json
    Write-Host "Pending schedules: $($json.data.pendingSchedules.count)" -ForegroundColor White
    Write-Host "Failed schedules: $($json.data.failedSchedules.count)" -ForegroundColor White
    Write-Host "Current time: $($json.data.currentTime.gmt7Formatted)" -ForegroundColor White
    
} catch {
    Write-Host "❌ API Error: $($_.Exception.Message)" -ForegroundColor Red
}
