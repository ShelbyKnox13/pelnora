// Reset system for manual testing - Delete Julia, Prince and reset Pelnora's earnings
console.log("🧹 Resetting system for manual testing...");

async function resetForManualTesting() {
    try {
        console.log("1. Logging in as admin...");
        
        // Login as admin
        const adminLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'admin@pelnora.com',
                password: 'admin123'
            })
        });
        
        if (!adminLoginResponse.ok) {
            console.log("❌ Admin login failed");
            return;
        }
        
        console.log("✅ Admin login successful!");
        const sessionCookie = adminLoginResponse.headers.get('set-cookie');
        
        console.log("\n2. Current system status before reset:");
        
        // Check current users and earnings
        const users = [
            { name: 'Pelnora', email: 'test@pelnora.com', id: 2 },
            { name: 'Julia', email: 'test@test.com', id: 3 },
            { name: 'Prince', email: 'hell.shelbyknox@gmail.com', id: 4 }
        ];
        
        for (const user of users) {
            const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: user.email,
                    password: 'test123'
                })
            });
            
            if (loginResponse.ok) {
                const userData = await loginResponse.json();
                console.log(`   ${user.name} (ID: ${userData.id}): ₹${userData.totalEarnings}`);
                
                // Get earnings count
                const userSessionCookie = loginResponse.headers.get('set-cookie');
                const earningsResponse = await fetch('http://localhost:3000/api/earnings/me', {
                    method: 'GET',
                    headers: {
                        'Cookie': userSessionCookie || ''
                    }
                });
                
                if (earningsResponse.ok) {
                    const earnings = await earningsResponse.json();
                    console.log(`      📊 ${earnings.length} earning records`);
                }
            } else {
                console.log(`   ${user.name}: Not found or login failed`);
            }
        }
        
        console.log("\n3. What we need to do:");
        console.log("   ❌ Delete Julia Davis (ID: 3) and her package");
        console.log("   ❌ Delete Prince (ID: 4) and his package");
        console.log("   ❌ Delete all test users created during testing");
        console.log("   🔄 Reset Pelnora's earnings to ₹0");
        console.log("   🧹 Clear all earnings records");
        console.log("   🧹 Clear all packages except Pelnora's (if any)");
        
        console.log("\n4. Note:");
        console.log("Since we don't have direct delete APIs, we need to create them or");
        console.log("manually reset the database. For now, let me show you what needs to be done:");
        
        console.log("\n5. Manual steps to reset:");
        console.log("   1. Stop the server");
        console.log("   2. Delete the database file or reset tables");
        console.log("   3. Restart the server (this will recreate admin and test users)");
        console.log("   4. Only Pelnora and Admin should remain");
        console.log("   5. Pelnora should have ₹0 earnings");
        console.log("   6. Then you can manually test referrals");
        
        console.log("\n6. Alternative - Create admin delete endpoints:");
        console.log("We could add admin endpoints to delete users and reset earnings.");
        console.log("This would be safer than database manipulation.");
        
        console.log("\n🎯 After reset, you'll have:");
        console.log("   ✅ Clean Pelnora user with ₹0 earnings");
        console.log("   ✅ Pelnora's referral ID: PELTEST001");
        console.log("   ✅ Working earnings calculation system");
        console.log("   ✅ Ready for manual referral testing");
        
        console.log("\n📋 For manual testing, you can:");
        console.log("   1. Register new users with Pelnora's referral ID");
        console.log("   2. Watch earnings calculate automatically");
        console.log("   3. Test different package types");
        console.log("   4. Test multi-level referrals");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

resetForManualTesting();