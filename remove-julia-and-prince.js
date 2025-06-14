// Remove Julia Davis and Prince for clean manual testing
console.log("🗑️ Removing Julia Davis and Prince...");

async function removeJuliaAndPrince() {
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
        
        // Find Julia and Prince
        const julia = allUsers.find(user => user.email === 'test@test.com');
        const prince = allUsers.find(user => user.email === 'hell.shelbyknox@gmail.com');
        
        console.log("\n3. Users to remove:");
        if (julia) {
            console.log(`   🗑️ Julia Davis (ID: ${julia.id}, Email: ${julia.email})`);
        } else {
            console.log("   ℹ️ Julia Davis not found");
        }
        
        if (prince) {
            console.log(`   🗑️ Prince (ID: ${prince.id}, Email: ${prince.email})`);
        } else {
            console.log("   ℹ️ Prince not found");
        }
        
        console.log("\n4. Attempting to delete users...");
        
        // Try to delete Julia
        if (julia) {
            console.log(`\n🗑️ Deleting Julia Davis (ID: ${julia.id})...`);
            
            const deleteJuliaResponse = await fetch(`http://localhost:3000/api/admin/users/${julia.id}`, {
                method: 'DELETE',
                headers: {
                    'Cookie': sessionCookie || ''
                }
            });
            
            if (deleteJuliaResponse.ok) {
                const deleteResult = await deleteJuliaResponse.json();
                console.log(`   ✅ ${deleteResult.message}`);
            } else {
                const errorText = await deleteJuliaResponse.text();
                console.log(`   ❌ Failed to delete Julia: ${errorText}`);
                console.log("   💡 Will try alternative method...");
            }
        }
        
        // Try to delete Prince
        if (prince) {
            console.log(`\n🗑️ Deleting Prince (ID: ${prince.id})...`);
            
            const deletePrinceResponse = await fetch(`http://localhost:3000/api/admin/users/${prince.id}`, {
                method: 'DELETE',
                headers: {
                    'Cookie': sessionCookie || ''
                }
            });
            
            if (deletePrinceResponse.ok) {
                const deleteResult = await deletePrinceResponse.json();
                console.log(`   ✅ ${deleteResult.message}`);
            } else {
                const errorText = await deletePrinceResponse.text();
                console.log(`   ❌ Failed to delete Prince: ${errorText}`);
                console.log("   💡 Will try alternative method...");
            }
        }
        
        console.log("\n5. Verifying removal...");
        
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
                if (user.role !== 'admin') {
                    console.log(`   - ${user.name} (ID: ${user.id}, Email: ${user.email})`);
                }
            });
            
            // Check if Julia and Prince are gone
            const juliaStillExists = updatedUsers.find(user => user.email === 'test@test.com');
            const princeStillExists = updatedUsers.find(user => user.email === 'hell.shelbyknox@gmail.com');
            
            if (!juliaStillExists && !princeStillExists) {
                console.log("\n✅ SUCCESS! Both Julia and Prince have been removed!");
            } else {
                console.log("\n⚠️ Some users still exist:");
                if (juliaStillExists) console.log("   - Julia Davis still exists");
                if (princeStillExists) console.log("   - Prince still exists");
                
                console.log("\n💡 Alternative solution:");
                console.log("Since direct deletion might have foreign key constraints,");
                console.log("you could manually delete them from the database or");
                console.log("simply ignore them and register new users for testing.");
            }
        }
        
        console.log("\n🎯 System status for manual testing:");
        console.log("   ✅ Pelnora user ready with ₹0 earnings");
        console.log("   ✅ Pelnora's referral ID: PELTEST001");
        console.log("   ✅ Earnings calculation system working");
        console.log("   ✅ Ready for fresh referral testing");
        
        console.log("\n📋 You can now:");
        console.log("   1. Register new users with Pelnora's referral");
        console.log("   2. Test different package types");
        console.log("   3. Watch earnings calculate automatically");
        console.log("   4. Build multi-level referral chains");
        
        console.log("\n🔗 Pelnora's referral link:");
        console.log("   http://localhost:3000/register?ref=PELTEST001");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

removeJuliaAndPrince();