# Test login with Pelnora user

$loginData = @{
    email = "test@pelnora.com"
    password = "test123"
} | ConvertTo-Json

Write-Host "Attempting to login as Pelnora user..."

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -SessionVariable session
    Write-Host "✅ Login successful!"
    Write-Host "User ID: $($response.id)"
    Write-Host "Name: $($response.name)"
    Write-Host "Email: $($response.email)"
    Write-Host "Role: $($response.role)"
    
    # Now check for user's package
    Write-Host ""
    Write-Host "Checking user's package..."
    
    $packageResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/packages/me" -Method GET -WebSession $session
    Write-Host "✅ Package found!"
    Write-Host "Package Type: $($packageResponse.packageType)"
    Write-Host "Monthly Amount: ₹$($packageResponse.monthlyAmount)"
    Write-Host "Total Months: $($packageResponse.totalMonths)"
    
} catch {
    Write-Host "❌ Error:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}