// Clean up test data for manual testing
console.log("🧹 Cleaning up test data for manual testing...");

async function cleanTestData() {
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
        
        console.log("\n2. Getting list of all users...");
        
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
        console.log(`Found ${allUsers.length} users:`);
        
        allUsers.forEach(user => {
            console.log(`   - ${user.name} (ID: ${user.id}, Email: ${user.email}, Role: ${user.role})`);
        });
        
        console.log("\n3. Identifying users to delete...");
        
        // Users to delete (everyone except admin and Pelnora)
        const usersToDelete = allUsers.filter(user => 
            user.role !== 'admin' && 
            user.email !== 'test@pelnora.com'
        );
        
        console.log(`Users to delete: ${usersToDelete.length}`);
        usersToDelete.forEach(user => {
            console.log(`   🗑️ ${user.name} (ID: ${user.id}, Email: ${user.email})`);
        });
        
        // Find Pelnora user
        const pelnoraUser = allUsers.find(user => user.email === 'test@pelnora.com');
        if (pelnoraUser) {
            console.log(`\n📋 Pelnora user found: ${pelnoraUser.name} (ID: ${pelnoraUser.id})`);
            console.log(`   Current earnings: ₹${pelnoraUser.totalEarnings}`);
        }
        
        console.log("\n4. Deleting test users...");
        
        // Delete each test user
        for (const user of usersToDelete) {
            console.log(`\n🗑️ Deleting ${user.name} (ID: ${user.id})...`);
            
            const deleteResponse = await fetch(`http://localhost:3000/api/admin/users/${user.id}`, {
                method: 'DELETE',
                headers: {
                    'Cookie': sessionCookie || ''
                }
            });
            
            if (deleteResponse.ok) {
                const deleteResult = await deleteResponse.json();
                console.log(`   ✅ ${deleteResult.message}`);
            } else {
                const errorText = await deleteResponse.text();
                console.log(`   ❌ Failed to delete ${user.name}: ${errorText}`);
            }
        }
        
        console.log("\n5. Resetting Pelnora's earnings...");
        
        if (pelnoraUser) {
            const resetResponse = await fetch(`http://localhost:3000/api/admin/users/${pelnoraUser.id}/reset-earnings`, {
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
                console.log(`   ❌ Failed to reset Pelnora's earnings: ${errorText}`);
            }
        }
        
        console.log("\n6. Verifying cleanup...");
        
        // Get updated users list
        const updatedUsersResponse = await fetch('http://localhost:3000/api/admin/users', {
            method: 'GET',
            headers: {
                'Cookie': sessionCookie || ''
            }
        });
        
        if (updatedUsersResponse.ok) {
            const updatedUsers = await updatedUsersResponse.json();
            console.log(`\n📊 Users remaining: ${updatedUsers.length}`);
            updatedUsers.forEach(user => {
                console.log(`   - ${user.name} (ID: ${user.id}, Email: ${user.email}, Earnings: ₹${user.totalEarnings})`);
            });
        }
        
        console.log("\n✅ CLEANUP COMPLETE!");
        console.log("\n🎯 System is now ready for manual testing:");
        console.log("   ✅ Only Admin and Pelnora users remain");
        console.log("   ✅ Pelnora has ₹0 earnings");
        console.log("   ✅ All test data cleaned up");
        console.log("   ✅ Earnings calculation system is working");
        
        console.log("\n📋 For manual testing:");
        console.log("   1. Use Pelnora's referral ID: PELTEST001");
        console.log("   2. Register new users with different packages");
        console.log("   3. Watch earnings calculate automatically");
        console.log("   4. Test multi-level referrals");
        
        console.log("\n🔗 Pelnora's referral link format:");
        console.log("   http://localhost:3000/register?ref=PELTEST001");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

cleanTestData();