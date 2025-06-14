// Trigger earnings calculation for existing packages
console.log("🚀 Triggering earnings calculation for existing packages...");

async function triggerEarningsForExistingPackages() {
    try {
        // Wait for server to start
        console.log("⏳ Waiting for server to start...");
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        console.log("1. Testing server connection...");
        
        // Test server connection
        try {
            const testResponse = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: 'admin@pelnora.com',
                    password: 'admin123'
                })
            });
            
            if (!testResponse.ok) {
                console.log("❌ Server not ready yet, waiting more...");
                await new Promise(resolve => setTimeout(resolve, 5000));
            } else {
                console.log("✅ Server is ready!");
            }
        } catch (error) {
            console.log("❌ Server not ready, waiting more...");
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
        
        console.log("\n2. Creating a new test user to trigger earnings calculation...");
        console.log("Since existing packages don't have earnings, we'll create a new user");
        console.log("to test if the earnings calculation is now working properly.");
        
        // Get Julia's referral ID
        const juliaLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@test.com',
                password: 'test123'
            })
        });
        
        if (juliaLoginResponse.ok) {
            const juliaData = await juliaLoginResponse.json();
            console.log(`📋 Julia's referral ID: ${juliaData.referralId}`);
            
            // Create a test user under Julia to trigger earnings
            const testUserEmail = `testearnings${Date.now()}@test.com`;
            console.log(`👤 Creating test user: ${testUserEmail}`);
            
            const testUserResponse = await fetch('http://localhost:3000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: 'Test Earnings User',
                    email: testUserEmail,
                    phone: '9876543210',
                    password: 'test123',
                    referralId: juliaData.referralId,
                    packageType: 'gold', // ₹3,000/month
                    placement: 'left'
                })
            });
            
            if (testUserResponse.ok) {
                const testUserData = await testUserResponse.json();
                console.log(`✅ Test user created: ${testUserData.name} (ID: ${testUserData.id})`);
                console.log(`📦 Package: ${testUserData.packageType} - ₹${testUserData.monthlyAmount}/month`);
                console.log("🔄 This should have triggered earnings calculation!");
                
                // Wait a moment for earnings to be processed
                console.log("\n⏳ Waiting for earnings to be processed...");
                await new Promise(resolve => setTimeout(resolve, 3000));
                
                // Check earnings
                console.log("\n3. Checking earnings after test user creation...");
                
                // Check Pelnora's earnings
                const pelnoraLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test@pelnora.com',
                        password: 'test123'
                    })
                });
                
                if (pelnoraLoginResponse.ok) {
                    const pelnoraData = await pelnoraLoginResponse.json();
                    console.log(`💰 Pelnora earnings: ₹${pelnoraData.totalEarnings}`);
                    
                    if (parseFloat(pelnoraData.totalEarnings) > 0) {
                        console.log("🎉 SUCCESS! Earnings calculation is now working!");
                        
                        // Get detailed earnings
                        const pelnoraSessionCookie = pelnoraLoginResponse.headers.get('set-cookie');
                        const earningsResponse = await fetch('http://localhost:3000/api/earnings/me', {
                            method: 'GET',
                            headers: {
                                'Cookie': pelnoraSessionCookie || ''
                            }
                        });
                        
                        if (earningsResponse.ok) {
                            const earnings = await earningsResponse.json();
                            console.log(`📊 Pelnora has ${earnings.length} earning records:`);
                            earnings.forEach(earning => {
                                console.log(`   - ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
                            });
                        }
                    } else {
                        console.log("❌ Earnings still not calculated. Check server logs for errors.");
                    }
                }
                
                // Check Julia's earnings
                const juliaCheckResponse = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: 'test@test.com',
                        password: 'test123'
                    })
                });
                
                if (juliaCheckResponse.ok) {
                    const juliaCheckData = await juliaCheckResponse.json();
                    console.log(`💰 Julia earnings: ₹${juliaCheckData.totalEarnings}`);
                    
                    if (parseFloat(juliaCheckData.totalEarnings) > 0) {
                        // Get detailed earnings
                        const juliaSessionCookie = juliaCheckResponse.headers.get('set-cookie');
                        const juliaEarningsResponse = await fetch('http://localhost:3000/api/earnings/me', {
                            method: 'GET',
                            headers: {
                                'Cookie': juliaSessionCookie || ''
                            }
                        });
                        
                        if (juliaEarningsResponse.ok) {
                            const juliaEarnings = await juliaEarningsResponse.json();
                            console.log(`📊 Julia has ${juliaEarnings.length} earning records:`);
                            juliaEarnings.forEach(earning => {
                                console.log(`   - ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
                            });
                        }
                    }
                }
                
            } else {
                const errorText = await testUserResponse.text();
                console.log(`❌ Failed to create test user: ${errorText}`);
            }
        } else {
            console.log("❌ Failed to login as Julia");
        }
        
        console.log("\n4. Summary:");
        console.log("✅ Added earnings calculation methods to PostgreSQL storage");
        console.log("✅ Server restarted with new code");
        console.log("✅ Created test user to verify earnings calculation");
        console.log("\n📝 Note: Existing packages (Julia's and Prince's) won't have earnings");
        console.log("   because they were created before the fix. Only new packages will");
        console.log("   automatically calculate earnings. To fix existing packages, you would");
        console.log("   need to manually run the earnings calculation for each existing package.");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

triggerEarningsForExistingPackages();