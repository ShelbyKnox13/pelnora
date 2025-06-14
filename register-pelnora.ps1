# PowerShell script to register Pelnora user via API

$registerData = @{
    name = "Pelnora"
    email = "test@pelnora.com"
    phone = "9876543210"
    password = "test123"
    role = "user"
    isActive = $true
    packageType = "diamond"
} | ConvertTo-Json

Write-Host "Registering Pelnora user..."

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/register" -Method POST -Body $registerData -ContentType "application/json"
    Write-Host "✅ User registered successfully!"
    Write-Host "User ID: $($response.id)"
    Write-Host "Name: $($response.name)"
    Write-Host "Email: $($response.email)"
    Write-Host "Package: $($response.packageType)"
    Write-Host "Monthly Amount: ₹$($response.monthlyAmount)"
    Write-Host ""
    Write-Host "Login credentials:"
    Write-Host "Email: test@pelnora.com"
    Write-Host "Password: test123"
} catch {
    Write-Host "❌ Error registering user:"
    Write-Host $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody"
    }
}