# Fix the Pelnora user in PostgreSQL

Write-Host "=== FIXING PELNORA USER IN POSTGRESQL ==="

# Login as admin
$adminLoginData = @{
    email = "admin@pelnora.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "1. Logging in as admin..."

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json" -SessionVariable session
    Write-Host "✅ Admin login successful!"
    
    # Update user name from "Test User" to "Pelnora"
    Write-Host "`n2. Updating user name to 'Pelnora'..."
    
    $updateUserData = @{
        name = "Pelnora"
    } | ConvertTo-Json
    
    try {
        $updateResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/users/2" -Method PATCH -Body $updateUserData -ContentType "application/json" -WebSession $session
        Write-Host "✅ User name updated successfully!"
        Write-Host "New name: $($updateResponse.name)"
    } catch {
        Write-Host "❌ Error updating user name:"
        Write-Host $_.Exception.Message
    }
    
    # Create Diamond package for user ID 2
    Write-Host "`n3. Creating Diamond package..."
    
    # First, login as the test user to create package
    $testUserLoginData = @{
        email = "test@pelnora.com"
        password = "test123"
    } | ConvertTo-Json
    
    try {
        $testLoginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $testUserLoginData -ContentType "application/json" -SessionVariable testSession
        Write-Host "✅ Test user login successful!"
        
        # Create package
        $packageData = @{
            packageType = "diamond"
            monthlyAmount = "10000"
            totalMonths = 11
        } | ConvertTo-Json
        
        try {
            $packageResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/packages" -Method POST -Body $packageData -ContentType "application/json" -WebSession $testSession
            Write-Host "✅ Diamond package created successfully!"
            Write-Host "Package ID: $($packageResponse.id)"
            Write-Host "Package Type: $($packageResponse.packageType)"
            Write-Host "Monthly Amount: ₹$($packageResponse.monthlyAmount)"
        } catch {
            Write-Host "❌ Error creating package:"
            Write-Host $_.Exception.Message
            if ($_.Exception.Response) {
                $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
                $responseBody = $reader.ReadToEnd()
                Write-Host "Response: $responseBody"
            }
        }
        
    } catch {
        Write-Host "❌ Error logging in as test user:"
        Write-Host $_.Exception.Message
    }
    
    Write-Host "`n=== VERIFICATION ==="
    Write-Host "Now try logging in with:"
    Write-Host "Email: test@pelnora.com"
    Write-Host "Password: test123"
    Write-Host "You should see 'Welcome back, Pelnora' and the Diamond package!"
    
} catch {
    Write-Host "❌ Admin login failed:"
    Write-Host $_.Exception.Message
}