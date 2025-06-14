# Login as admin and check all users

$adminLoginData = @{
    email = "admin@pelnora.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Logging in as admin..."

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json" -SessionVariable session
    Write-Host "✅ Admin login successful!"
    
    # Get all users
    Write-Host ""
    Write-Host "Fetching all users..."
    
    $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET -WebSession $session
    
    Write-Host "=== ALL USERS ==="
    foreach ($user in $usersResponse) {
        Write-Host "ID: $($user.id) | Name: '$($user.name)' | Email: $($user.email) | Role: $($user.role)"
    }
    
    # Get all packages
    Write-Host ""
    Write-Host "Fetching all packages..."
    
    $packagesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/packages" -Method GET -WebSession $session
    
    Write-Host "=== ALL PACKAGES ==="
    foreach ($package in $packagesResponse) {
        Write-Host "Package ID: $($package.id) | User ID: $($package.userId) | Type: $($package.packageType) | Amount: ₹$($package.monthlyAmount)/month"
    }
    
} catch {
    Write-Host "❌ Error:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}