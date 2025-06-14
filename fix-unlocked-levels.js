// Fix unlocked levels by recalculating from actual direct referrals
console.log("🔓 Fixing unlocked levels...");

async function fixUnlockedLevels() {
    try {
        // Login as admin
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
        
        console.log("✅ Admin login successful!");
        const sessionCookie = adminLoginResponse.headers.get('set-cookie');
        
        console.log("\n2. Getting all users...");
        
        // Get all users
        const usersResponse = await fetch('http://localhost:3000/api/admin/users', {
            method: 'GET',
            headers: {
                'Cookie': sessionCookie || ''
            }
        });
        
        if (!usersResponse.ok) {
            console.log("❌ Failed to get users list");
            return;
        }
        
        const allUsers = await usersResponse.json();
        console.log(`Found ${allUsers.length} users`);
        
        console.log("\n3. Analyzing unlocked levels...");
        
        // For each user, calculate their actual unlocked levels based on direct referrals
        for (const user of allUsers) {
            if (user.role === 'admin') continue;
            
            // Count actual direct referrals
            const directReferrals = allUsers.filter(u => u.referredBy === user.id);
            const actualDirectCount = directReferrals.length;
            
            // Calculate correct unlocked levels: each direct referral unlocks 2 levels
            const correctUnlockedLevels = Math.min(actualDirectCount * 2, 20); // Max 20 levels
            
            // Current unlocked levels from database
            const currentUnlockedLevels = user.unlockedLevels;
            
            console.log(`\n👤 ${user.name} (ID: ${user.id})`);
            console.log(`   Current unlocked levels: ${currentUnlockedLevels}`);
            console.log(`   Actual direct referrals: ${actualDirectCount}`);
            console.log(`   Expected unlocked levels (referrals × 2): ${correctUnlockedLevels}`);
            
            if (correctUnlockedLevels !== currentUnlockedLevels) {
                console.log(`   ⚠️ MISMATCH! Should be ${correctUnlockedLevels}, but showing ${currentUnlockedLevels}`);
                
                console.log(`   🔧 Fixing: Setting unlockedLevels to ${correctUnlockedLevels}`);
                
                // Update the user's unlocked levels
                const updateResponse = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': sessionCookie || ''
                    },
                    body: JSON.stringify({
                        unlockedLevels: correctUnlockedLevels
                    })
                });
                
                if (updateResponse.ok) {
                    console.log(`   ✅ Successfully updated unlocked levels`);
                } else {
                    console.log(`   ❌ Failed to update unlocked levels`);
                    const errorText = await updateResponse.text();
                    console.log(`   Error:`, errorText);
                }
            } else {
                console.log(`   ✅ Unlocked levels are correct`);
            }
            
            // List direct referrals
            if (directReferrals.length > 0) {
                console.log(`   Direct referrals:`);
                directReferrals.forEach(ref => {
                    console.log(`     - ${ref.name} (ID: ${ref.id}, Email: ${ref.email})`);
                });
            }
        }
        
        console.log("\n4. Verification - Getting updated user data...");
        
        // Get updated users list
        const updatedUsersResponse = await fetch('http://localhost:3000/api/admin/users', {
            method: 'GET',
            headers: {
                'Cookie': sessionCookie || ''
            }
        });
        
        if (updatedUsersResponse.ok) {
            const updatedUsers = await updatedUsersResponse.json();
            
            console.log("\n📊 Updated Unlocked Levels:");
            updatedUsers.forEach(user => {
                if (user.role !== 'admin') {
                    const directReferrals = updatedUsers.filter(u => u.referredBy === user.id);
                    console.log(`   - ${user.name}: ${user.unlockedLevels}/20 levels (${directReferrals.length} referrals)`);
                }
            });
        }
        
        console.log("\n✅ Unlocked levels fix completed!");
        console.log("🎯 You can now check your dashboard - it should show the correct unlocked levels.");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

fixUnlockedLevels();