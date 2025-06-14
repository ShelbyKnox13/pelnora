// Test the binary structure API
console.log("🧪 Testing binary structure API...");

async function testBinaryAPI() {
    try {
        // Login as Pelnora user first (from the fix script output, we know this user exists)
        console.log("1. Logging in as Pelnora user...");
        
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
        
        if (!loginResponse.ok) {
            console.log("❌ Pelnora login failed");
            return;
        }
        
        console.log("✅ Pelnora login successful!");
        const sessionCookie = loginResponse.headers.get('set-cookie');
        
        // Test binary structure API
        console.log("\n2. Testing binary structure API...");
        const binaryResponse = await fetch('http://localhost:3000/api/binary-structure/me', {
            method: 'GET',
            headers: {
                'Cookie': sessionCookie || ''
            }
        });
        
        if (!binaryResponse.ok) {
            console.log("❌ Binary structure API failed");
            console.log("Status:", binaryResponse.status);
            console.log("Response:", await binaryResponse.text());
            return;
        }
        
        const binaryData = await binaryResponse.json();
        console.log("✅ Binary structure API successful!");
        console.log("\n📊 Binary Structure Data:");
        console.log(`   User: ${binaryData.user?.name} (ID: ${binaryData.user?.id})`);
        console.log(`   Left Team Count: ${binaryData.leftTeamCount}`);
        console.log(`   Right Team Count: ${binaryData.rightTeamCount}`);
        console.log(`   Total Team Size: ${binaryData.totalTeamSize}`);
        console.log(`   Left Team Business: ₹${binaryData.leftTeamBusiness}`);
        console.log(`   Right Team Business: ₹${binaryData.rightTeamBusiness}`);
        console.log(`   Left Carry Forward: ₹${binaryData.leftCarryForward}`);
        console.log(`   Right Carry Forward: ₹${binaryData.rightCarryForward}`);
        
        if (binaryData.downline && binaryData.downline.length > 0) {
            console.log(`\n   Downline Members (${binaryData.downline.length}):`);
            binaryData.downline.forEach(member => {
                console.log(`     - ${member.name} (ID: ${member.id}) - Position: ${member.position}, Level: ${member.level}`);
            });
        } else {
            console.log(`\n   No downline members found`);
        }
        
        // Test level statistics API
        console.log("\n3. Testing level statistics API...");
        const levelResponse = await fetch('http://localhost:3000/api/level-statistics/me', {
            method: 'GET',
            headers: {
                'Cookie': sessionCookie || ''
            }
        });
        
        if (!levelResponse.ok) {
            console.log("❌ Level statistics API failed");
            console.log("Status:", levelResponse.status);
            console.log("Response:", await levelResponse.text());
            return;
        }
        
        const levelData = await levelResponse.json();
        console.log("✅ Level statistics API successful!");
        console.log("\n📈 Level Statistics Data:");
        console.log(`   Unlocked Levels: ${levelData.unlockedLevels}/${levelData.maxLevels}`);
        console.log(`   Completion: ${levelData.completionPercentage}%`);
        console.log(`   Direct Referrals: ${levelData.directReferralCount}`);
        console.log(`   Next Level: ${levelData.nextLevel || 'All unlocked'}`);
        console.log(`   Referrals Needed: ${levelData.referralsNeededForNextLevel}`);
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

testBinaryAPI();