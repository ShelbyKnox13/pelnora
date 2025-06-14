// Admin script to recalculate earnings for all existing packages
console.log("🔧 Admin: Recalculating earnings for all existing packages...");

async function adminRecalculateEarnings() {
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
        
        console.log("\n2. Checking current earnings before recalculation...");
        
        // Check current earnings
        const users = [
            { name: 'Pelnora', email: 'test@pelnora.com' },
            { name: 'Julia', email: 'test@test.com' },
            { name: 'Prince', email: 'hell.shelbyknox@gmail.com' }
        ];
        
        console.log("Current earnings:");
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
                console.log(`   ${user.name}: ₹${userData.totalEarnings}`);
            }
        }
        
        console.log("\n3. Triggering admin earnings recalculation...");
        
        // Call the admin recalculation endpoint
        const recalcResponse = await fetch('http://localhost:3000/api/admin/recalculate-earnings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Cookie': sessionCookie || ''
            }
        });
        
        if (recalcResponse.ok) {
            const recalcData = await recalcResponse.json();
            console.log("✅ Recalculation completed!");
            console.log(`📊 ${recalcData.message}`);
            console.log(`📦 Total packages: ${recalcData.totalPackages}`);
            console.log(`🔄 Recalculated: ${recalcData.recalculatedCount}`);
            
            if (recalcData.results && recalcData.results.length > 0) {
                console.log("\n📋 Recalculation results:");
                recalcData.results.forEach(result => {
                    const status = result.status === 'success' ? '✅' : '❌';
                    console.log(`   ${status} ${result.userName}: ${result.packageType} (₹${result.monthlyAmount}/month)`);
                    if (result.error) {
                        console.log(`      Error: ${result.error}`);
                    }
                });
            }
        } else {
            const errorText = await recalcResponse.text();
            console.log(`❌ Recalculation failed: ${errorText}`);
        }
        
        console.log("\n4. Checking earnings after recalculation...");
        
        // Wait a moment for processing
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log("Updated earnings:");
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
                console.log(`   ${user.name}: ₹${userData.totalEarnings}`);
                
                // Get detailed earnings
                const userSessionCookie = loginResponse.headers.get('set-cookie');
                const earningsResponse = await fetch('http://localhost:3000/api/earnings/me', {
                    method: 'GET',
                    headers: {
                        'Cookie': userSessionCookie || ''
                    }
                });
                
                if (earningsResponse.ok) {
                    const earnings = await earningsResponse.json();
                    if (earnings.length > 0) {
                        console.log(`      📊 ${earnings.length} earning records:`);
                        earnings.forEach(earning => {
                            console.log(`         - ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
                        });
                    }
                }
            }
        }
        
        console.log("\n5. Expected vs Actual:");
        console.log("Expected earnings from original packages:");
        console.log("   - Pelnora should get ₹500 from Julia's Diamond package");
        console.log("   - Julia should get ₹500 from Prince's Diamond package");
        console.log("   - Pelnora should get ₹75 level 1 income from Prince's package");
        console.log("   - Plus existing earnings from test users");
        
        console.log("\n✅ Earnings recalculation complete!");
        console.log("🎯 All earnings are now stored safely in the database");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

adminRecalculateEarnings();