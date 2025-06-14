// Debug unlocked levels issue
console.log("🔓 Debugging unlocked levels...");

async function debugUnlockedLevels() {
    try {
        // Login as Pelnora user
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
        
        const pelnoraUser = await loginResponse.json();
        const sessionCookie = loginResponse.headers.get('set-cookie');
        
        console.log("✅ Pelnora login successful!");
        console.log("   User ID:", pelnoraUser.id);
        console.log("   Name:", pelnoraUser.name);
        console.log("   Current Unlocked Levels:", pelnoraUser.unlockedLevels);
        
        console.log("\n2. Getting direct referrals...");
        
        // Get direct referrals
        const referralsResponse = await fetch('http://localhost:3000/api/referrals/me', {
            method: 'GET',
            headers: {
                'Cookie': sessionCookie || ''
            }
        });
        
        if (referralsResponse.ok) {
            const directReferrals = await referralsResponse.json();
            console.log("✅ Direct referrals found:", directReferrals.length);
            
            // According to the logic: each direct referral unlocks 2 levels
            const expectedUnlockedLevels = directReferrals.length * 2;
            console.log("   Expected unlocked levels (referrals * 2):", expectedUnlockedLevels);
            console.log("   Current unlocked levels:", pelnoraUser.unlockedLevels);
            
            if (expectedUnlockedLevels !== pelnoraUser.unlockedLevels) {
                console.log("   ⚠️ MISMATCH! Should be", expectedUnlockedLevels, "but showing", pelnoraUser.unlockedLevels);
            } else {
                console.log("   ✅ Unlocked levels are correct");
            }
            
            directReferrals.forEach(referral => {
                console.log("   -", referral.name, "(ID:", referral.id + ", Email:", referral.email + ")");
            });
        } else {
            console.log("❌ Failed to get direct referrals");
        }
        
        console.log("\n3. Getting level statistics...");
        
        // Get level statistics
        const levelStatsResponse = await fetch('http://localhost:3000/api/level-statistics/me', {
            method: 'GET',
            headers: {
                'Cookie': sessionCookie || ''
            }
        });
        
        if (levelStatsResponse.ok) {
            const levelStats = await levelStatsResponse.json();
            console.log("✅ Level statistics retrieved:");
            console.log("   Unlocked Levels:", levelStats.unlockedLevels);
            console.log("   Max Levels:", levelStats.maxLevels);
            console.log("   Direct Referral Count:", levelStats.directReferralCount);
            console.log("   Completion Percentage:", levelStats.completionPercentage + "%");
            console.log("   Next Level:", levelStats.nextLevel);
            console.log("   Referrals Needed for Next Level:", levelStats.referralsNeededForNextLevel);
        } else {
            console.log("❌ Failed to get level statistics");
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

debugUnlockedLevels();