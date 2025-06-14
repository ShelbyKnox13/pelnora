// Check Prince user and manually trigger earnings calculation
console.log("Checking Prince and fixing earnings...");

async function checkPrinceAndFixEarnings() {
    try {
        // Check Prince user
        console.log("1. Checking Prince user...");
        const princeLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: 'hell.shelbyknox@gmail.com',
                password: 'test123'
            })
        });
        
        if (princeLoginResponse.ok) {
            const princeData = await princeLoginResponse.json();
            console.log(`✅ Prince found: ${princeData.name} (ID: ${princeData.id})`);
            console.log(`Email: ${princeData.email}`);
            console.log(`Total earnings: ₹${princeData.totalEarnings}`);
            console.log(`Referred by: ${princeData.referredBy || 'None'}`);
            
            // Get Prince's package
            const princeSessionCookie = princeLoginResponse.headers.get('set-cookie');
            const packageResponse = await fetch('http://localhost:3000/api/packages/me', {
                method: 'GET',
                headers: {
                    'Cookie': princeSessionCookie || ''
                }
            });
            
            if (packageResponse.ok) {
                const packageData = await packageResponse.json();
                console.log(`Prince's package: ${packageData.packageType} - ₹${packageData.monthlyAmount}/month`);
            } else {
                console.log("❌ No package found for Prince");
            }
        } else {
            console.log("❌ Prince login failed");
        }
        
        console.log("\n2. Current situation analysis:");
        console.log("- Pelnora (ID: 2) referred Julia (ID: 3) with Diamond package (₹10,000/month)");
        console.log("- Julia (ID: 3) referred Prince (ID: 4)");
        console.log("- Expected earnings:");
        console.log("  * Pelnora should get ₹500 direct income from Julia (5% of ₹10,000)");
        console.log("  * If Prince has a package, Pelnora should get level 1 income");
        
        console.log("\n3. The problem:");
        console.log("The earnings calculation is not being triggered when packages are created.");
        console.log("This suggests the calculateRealEarnings function is not being called properly.");
        
        console.log("\n4. Solution:");
        console.log("We need to manually trigger the earnings calculation for existing packages.");
        console.log("This should be done by calling the earnings calculation API or fixing the package creation process.");
        
        // Let's try to create a test package to see if earnings calculation works
        console.log("\n5. Testing earnings calculation by creating a test scenario...");
        console.log("We should check the server logs to see if calculateRealEarnings is being called.");
        
    } catch (error) {
        console.error("Error:", error.message);
    }
}

checkPrinceAndFixEarnings();