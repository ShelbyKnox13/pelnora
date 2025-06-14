// Check all users via API calls
console.log("Checking all users via API...");

async function checkAllUsers() {
    try {
        // Login as admin first
        console.log("1. Logging in as admin...");
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
        
        const adminData = await adminLoginResponse.json();
        console.log("✅ Admin login successful!");
        
        // Get session cookie
        const sessionCookie = adminLoginResponse.headers.get('set-cookie');
        
        // Get all users (we'll need to make individual API calls since there's no admin endpoint to list all users)
        console.log("\n2. Checking individual users...");
        
        // Check Pelnora user
        console.log("\n--- PELNORA USER ---");
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
            console.log(`Name: ${pelnoraData.name} (ID: ${pelnoraData.id})`);
            console.log(`Email: ${pelnoraData.email}`);
            console.log(`Total earnings: ₹${pelnoraData.totalEarnings}`);
            console.log(`Referral ID: ${pelnoraData.referralId}`);
            console.log(`Referred by: ${pelnoraData.referredBy || 'None'}`);
        }
        
        // Check Julia user
        console.log("\n--- JULIA USER ---");
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
            console.log(`Name: ${juliaData.name} (ID: ${juliaData.id})`);
            console.log(`Email: ${juliaData.email}`);
            console.log(`Total earnings: ₹${juliaData.totalEarnings}`);
            console.log(`Referral ID: ${juliaData.referralId}`);
            console.log(`Referred by: ${juliaData.referredBy || 'None'}`);
            
            // Get Julia's package
            const juliaSessionCookie = juliaLoginResponse.headers.get('set-cookie');
            const packageResponse = await fetch('http://localhost:3000/api/packages/me', {
                method: 'GET',
                headers: {
                    'Cookie': juliaSessionCookie || ''
                }
            });
            
            if (packageResponse.ok) {
                const packageData = await packageResponse.json();
                console.log(`Package: ${packageData.packageType} - ₹${packageData.monthlyAmount}/month`);
            } else {
                console.log("No package found for Julia");
            }
            
            // Get Julia's referrals
            const juliaReferralsResponse = await fetch('http://localhost:3000/api/referrals/me', {
                method: 'GET',
                headers: {
                    'Cookie': juliaSessionCookie || ''
                }
            });
            
            if (juliaReferralsResponse.ok) {
                const juliaReferrals = await juliaReferralsResponse.json();
                console.log(`Julia's referrals: ${juliaReferrals.length}`);
                juliaReferrals.forEach(ref => {
                    console.log(`  - ${ref.name} (ID: ${ref.id}, Email: ${ref.email})`);
                });
            }
        } else {
            console.log("❌ Julia login failed - checking if user exists");
        }
        
        // Try to find Prince user
        console.log("\n--- LOOKING FOR PRINCE USER ---");
        // We'll try common email patterns
        const possiblePrinceEmails = [
            'prince@test.com',
            'prince@pelnora.com',
            'test2@test.com',
            'prince@example.com'
        ];
        
        for (const email of possiblePrinceEmails) {
            try {
                const princeLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: 'test123'
                    })
                });
                
                if (princeLoginResponse.ok) {
                    const princeData = await princeLoginResponse.json();
                    console.log(`Found Prince with email: ${email}`);
                    console.log(`Name: ${princeData.name} (ID: ${princeData.id})`);
                    console.log(`Total earnings: ₹${princeData.totalEarnings}`);
                    console.log(`Referred by: ${princeData.referredBy || 'None'}`);
                    break;
                }
            } catch (e) {
                // Continue to next email
            }
        }
        
    } catch (error) {
        console.error("Error checking users:", error.message);
    }
}

checkAllUsers();