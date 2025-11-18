# Test manual-cron POST with correct headers
Write-Host "Testing manual-cron POST..."

$uri = "https://videoaffiliateapp.vercel.app/api/manual-cron"
$headers = @{
    "x-cron-secret" = "dev-secret"
}

try {
    Write-Host "Testing /api/manual-cron (POST)..."
    $response = Invoke-RestMethod -Uri $uri -Method POST -Headers $headers
    Write-Host "Success! Response:"
    $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}

