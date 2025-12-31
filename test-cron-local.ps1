# Test Cron Locally - PowerShell Script
# Run with: .\test-cron-local.ps1

$CRON_SECRET = "dev-secret"  # Change this to match your .env.local CRON_SECRET
$API_URL = "http://localhost:3000"

Write-Host "================================" -ForegroundColor Cyan
Write-Host "TESTING CRON JOB LOCALLY" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

Write-Host "🔐 Using CRON_SECRET: $($CRON_SECRET.Substring(0, 10))..." -ForegroundColor Yellow
Write-Host "🔗 API URL: $API_URL`n" -ForegroundColor Yellow

# Test /api/manual-cron endpoint (used by GitHub Actions)
Write-Host "--- TEST 1: /api/manual-cron (GitHub Actions endpoint) ---" -ForegroundColor Green

try {
    $headers = @{
        "Authorization" = "Bearer $CRON_SECRET"
        "Content-Type" = "application/json"
    }

    $response = Invoke-WebRequest -Uri "$API_URL/api/manual-cron" -Method POST -Headers $headers -UseBasicParsing

    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📥 Response:" -ForegroundColor Cyan
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response)" -ForegroundColor Red
}

Write-Host "`n--- TEST 2: /api/cron/check-schedules (Vercel cron endpoint) ---" -ForegroundColor Green

try {
    $headers2 = @{
        "x-cron-secret" = $CRON_SECRET
        "Content-Type" = "application/json"
    }

    $response2 = Invoke-WebRequest -Uri "$API_URL/api/cron/check-schedules" -Method GET -Headers $headers2 -UseBasicParsing

    Write-Host "✅ Status: $($response2.StatusCode)" -ForegroundColor Green
    Write-Host "📥 Response:" -ForegroundColor Cyan
    $response2.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10 | Write-Host
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n================================" -ForegroundColor Cyan
Write-Host "TEST COMPLETED" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
