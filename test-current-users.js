// Simple test to check current users and earnings
console.log("Testing current users and earnings...");

// Make API calls to check the current state
async function testCurrentState() {
    try {
        // Test login with Pelnora user
        console.log("1. Testing Pelnora login...");
        const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'test@pelnora.com',
                password: 'test123'
            })
        });
        
        if (loginResponse.ok) {
            const loginData = await loginResponse.json();
            console.log("✅ Pelnora login successful!");
            console.log(`User: ${loginData.name} (ID: ${loginData.id})`);
            console.log(`Total earnings: ₹${loginData.totalEarnings}`);
            console.log(`Referral ID: ${loginData.referralId}`);
            
            // Get user's earnings
            console.log("\n2. Getting Pelnora's earnings...");
            const earningsResponse = await fetch('http://localhost:3000/api/earnings/me', {
                method: 'GET',
                headers: {
                    'Cookie': loginResponse.headers.get('set-cookie') || ''
                }
            });
            
            if (earningsResponse.ok) {
                const earnings = await earningsResponse.json();
                console.log(`Found ${earnings.length} earning records:`);
                earnings.forEach(earning => {
                    console.log(`- ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
                });
            } else {
                console.log("❌ Failed to get earnings");
            }
            
            // Get referrals
            console.log("\n3. Getting Pelnora's referrals...");
            const referralsResponse = await fetch('http://localhost:3000/api/referrals/me', {
                method: 'GET',
                headers: {
                    'Cookie': loginResponse.headers.get('set-cookie') || ''
                }
            });
            
            if (referralsResponse.ok) {
                const referrals = await referralsResponse.json();
                console.log(`Found ${referrals.length} direct referrals:`);
                referrals.forEach(ref => {
                    console.log(`- ${ref.name} (ID: ${ref.id}, Email: ${ref.email})`);
                });
            } else {
                console.log("❌ Failed to get referrals");
            }
            
        } else {
            console.log("❌ Pelnora login failed");
            const errorData = await loginResponse.text();
            console.log("Error:", errorData);
        }
        
    } catch (error) {
        console.error("Error testing current state:", error.message);
        console.log("Make sure the server is running on http://localhost:3000");
    }
}

testCurrentState();