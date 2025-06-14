# Check PostgreSQL data through API endpoints

Write-Host "=== CHECKING POSTGRESQL DATA VIA API ==="

# First, login as admin to access diagnostic endpoints
$adminLoginData = @{
    email = "admin@pelnora.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "1. Logging in as admin..."

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $adminLoginData -ContentType "application/json" -SessionVariable session
    Write-Host "✅ Admin login successful!"
    
    # Check diagnostic packages endpoint
    Write-Host "`n2. Checking packages in PostgreSQL..."
    try {
        $packagesResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/diagnostic/packages" -Method GET -WebSession $session
        Write-Host "✅ Packages diagnostic successful!"
        Write-Host "Total packages in PostgreSQL: $($packagesResponse.totalPackages)"
        
        if ($packagesResponse.packages.Count -gt 0) {
            Write-Host "`nPackage details:"
            foreach ($pkg in $packagesResponse.packages) {
                Write-Host "  - Package ID: $($pkg.packageId) | User: $($pkg.userName) | Type: $($pkg.packageType) | Amount: ₹$($pkg.monthlyAmount)/month"
            }
        } else {
            Write-Host "❌ NO PACKAGES FOUND IN POSTGRESQL!"
        }
    } catch {
        Write-Host "❌ Error accessing packages diagnostic:"
        Write-Host $_.Exception.Message
    }
    
    # Check all users
    Write-Host "`n3. Checking all users in PostgreSQL..."
    try {
        $usersResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/users" -Method GET -WebSession $session
        Write-Host "✅ Users query successful!"
        Write-Host "Total users in PostgreSQL: $($usersResponse.Count)"
        
        if ($usersResponse.Count -gt 0) {
            Write-Host "`nUser details:"
            foreach ($user in $usersResponse) {
                Write-Host "  - ID: $($user.id) | Name: '$($user.name)' | Email: $($user.email) | Role: $($user.role)"
            }
        } else {
            Write-Host "❌ NO USERS FOUND IN POSTGRESQL!"
        }
    } catch {
        Write-Host "❌ Error accessing users:"
        Write-Host $_.Exception.Message
    }
    
    Write-Host "`n=== ANALYSIS ==="
    Write-Host "If you see 'NO PACKAGES FOUND' or 'NO USERS FOUND', it means:"
    Write-Host "1. ❌ Data is NOT properly migrated to PostgreSQL"
    Write-Host "2. ❌ The system is using PostgreSQL but it's empty"
    Write-Host "3. ❌ Your changes to storage.ts (memory storage) won't affect the running system"
    Write-Host "`nSOLUTION: We need to create users and packages directly in PostgreSQL"
    
} catch {
    Write-Host "❌ Admin login failed:"
    Write-Host $_.Exception.Message
    Write-Host "`nThis might mean the admin user doesn't exist in PostgreSQL either!"
}