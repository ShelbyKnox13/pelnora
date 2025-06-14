# Check if email exists

$checkData = @{
    email = "test@pelnora.com"
} | ConvertTo-Json

Write-Host "Checking if test@pelnora.com exists..."

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/check-email" -Method POST -Body $checkData -ContentType "application/json"
    Write-Host "Email exists: $($response.exists)"
} catch {
    Write-Host "❌ Error checking email:"
    Write-Host $_.Exception.Message
}