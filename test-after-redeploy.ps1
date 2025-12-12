# Test all endpoints after redeploy
Write-Host "Testing endpoints after redeploy..."
Write-Host "Waiting 30 seconds for deployment to complete..."
Start-Sleep -Seconds 30

$baseUrl = "https://videoaffiliateapp.vercel.app"

# Test 1: Check files endpoint
Write-Host "`n1. Testing /api/check-files..."
try {
    $response1 = Invoke-RestMethod -Uri "$baseUrl/api/check-files" -Method GET
    Write-Host "✅ Success! File structure check:"
    Write-Host "API Directory exists: $($response1.data.apiDirectory.exists)"
    Write-Host "Test-DB Directory exists: $($response1.data.testDbDirectory.exists)"
    Write-Host "API Contents count: $($response1.data.apiDirectory.contents.Count)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
}

# Test 2: Test database endpoint
Write-Host "`n2. Testing /api/test-db..."
try {
    $response2 = Invoke-RestMethod -Uri "$baseUrl/api/test-db" -Method GET
    Write-Host "✅ Success! Database test:"
    Write-Host "All pending schedules: $($response2.data.allPendingSchedules.count)"
    Write-Host "Due schedules: $($response2.data.dueSchedules.count)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
}

# Test 3: Manual cron GET
Write-Host "`n3. Testing /api/manual-cron (GET)..."
try {
    $response3 = Invoke-RestMethod -Uri "$baseUrl/api/manual-cron" -Method GET
    Write-Host "✅ Success! Manual cron info:"
    Write-Host "Message: $($response3.message)"
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)"
}

Write-Host "`n🎯 All tests completed!"


