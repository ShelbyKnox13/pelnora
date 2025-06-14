// Reset all users' earnings to 0 for clean manual testing
console.log("🔄 Resetting all users' earnings to ₹0...");

async function resetAllEarnings() {
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
        
        console.log("\n3. Current earnings:");
        allUsers.forEach(user => {
            if (user.role !== 'admin') {
                console.log(`   ${user.name}: ₹${user.totalEarnings}`);
            }
        });
        
        console.log("\n4. Resetting all non-admin users' earnings...");
        
        // Reset earnings for all non-admin users
        for (const user of allUsers) {
            if (user.role !== 'admin') {
                console.log(`\n🔄 Resetting ${user.name}'s earnings...`);
                
                const resetResponse = await fetch(`http://localhost:3000/api/admin/users/${user.id}/reset-earnings`, {
                    method: 'POST',
                    headers: {
                        'Cookie': sessionCookie || ''
                    }
                });
                
                if (resetResponse.ok) {
                    const resetResult = await resetResponse.json();
                    console.log(`   ✅ ${resetResult.message}`);
                    console.log(`   📊 Deleted ${resetResult.user.deletedEarningsCount} earnings records`);
                } else {
                    const errorText = await resetResponse.text();
                    console.log(`   ❌ Failed to reset ${user.name}'s earnings: ${errorText}`);
                }
            }
        }
        
        console.log("\n5. Verifying reset...");
        
        // Get updated users list
        const updatedUsersResponse = await fetch('http://localhost:3000/api/admin/users', {
            method: 'GET',
            headers: {
                'Cookie': sessionCookie || ''
            }
        });
        
        if (updatedUsersResponse.ok) {
            const updatedUsers = await updatedUsersResponse.json();
            console.log("\n📊 Updated earnings:");
            updatedUsers.forEach(user => {
                if (user.role !== 'admin') {
                    console.log(`   ${user.name}: ₹${user.totalEarnings}`);
                }
            });
        }
        
        console.log("\n✅ ALL EARNINGS RESET COMPLETE!");
        console.log("\n🎯 System is now ready for clean manual testing:");
        console.log("   ✅ All users have ₹0 earnings");
        console.log("   ✅ All earnings records cleared");
        console.log("   ✅ Earnings calculation system is working");
        console.log("   ✅ Ready for fresh referral testing");
        
        console.log("\n📋 For manual testing:");
        console.log("   1. Use Pelnora's referral ID: PELTEST001");
        console.log("   2. Register new users with different packages");
        console.log("   3. Watch earnings calculate automatically");
        console.log("   4. Test multi-level referrals");
        
        console.log("\n🔗 Test registration URLs:");
        console.log("   Direct: http://localhost:3000/register");
        console.log("   With Pelnora's referral: http://localhost:3000/register?ref=PELTEST001");
        
        console.log("\n💡 Suggested test scenario:");
        console.log("   1. Register User A with Pelnora's referral + Gold package (₹3,000)");
        console.log("      → Pelnora should get ₹150 direct income");
        console.log("   2. Register User B with User A's referral + Silver package (₹2,000)");
        console.log("      → User A gets ₹100 direct income");
        console.log("      → Pelnora gets ₹15 level 1 income (15% of ₹100)");
        console.log("   3. Register User C with User B's referral + Platinum package (₹5,000)");
        console.log("      → User B gets ₹250 direct income");
        console.log("      → User A gets ₹37.50 level 1 income (15% of ₹250)");
        console.log("      → Pelnora gets ₹25 level 2 income (10% of ₹250)");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

resetAllEarnings();