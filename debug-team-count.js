// Debug team count issue
console.log("🔍 Debugging team count issue...");

async function debugTeamCount() {
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
        console.log("✅ Pelnora login successful!");
        console.log("   User ID:", pelnoraUser.id);
        console.log("   Name:", pelnoraUser.name);
        console.log("   Left Team Count:", pelnoraUser.leftTeamCount);
        console.log("   Right Team Count:", pelnoraUser.rightTeamCount);
        console.log("   Total Team Count:", pelnoraUser.leftTeamCount + pelnoraUser.rightTeamCount);
        
        const sessionCookie = loginResponse.headers.get('set-cookie');
        
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
            directReferrals.forEach(referral => {
                console.log("   -", referral.name, "(ID:", referral.id + ", Email:", referral.email + ")");
            });
        } else {
            console.log("❌ Failed to get direct referrals");
        }
        
        console.log("\n3. Getting all users (admin view)...");
        
        // Login as admin to get all users
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
        
        if (adminLoginResponse.ok) {
            const adminSessionCookie = adminLoginResponse.headers.get('set-cookie');
            
            const allUsersResponse = await fetch('http://localhost:3000/api/admin/users', {
                method: 'GET',
                headers: {
                    'Cookie': adminSessionCookie || ''
                }
            });
            
            if (allUsersResponse.ok) {
                const allUsers = await allUsersResponse.json();
                console.log("✅ All users found:", allUsers.length);
                
                console.log("\n📊 User Analysis:");
                allUsers.forEach(user => {
                    if (user.role !== 'admin') {
                        console.log(`   - ${user.name} (ID: ${user.id})`);
                        console.log(`     Email: ${user.email}`);
                        console.log(`     Referred by: ${user.referredBy || 'None'}`);
                        console.log(`     Left Team: ${user.leftTeamCount}, Right Team: ${user.rightTeamCount}`);
                        console.log(`     Total Team: ${user.leftTeamCount + user.rightTeamCount}`);
                        console.log("");
                    }
                });
                
                // Find who referred Julia
                const julia = allUsers.find(u => u.email === 'test@test.com');
                if (julia) {
                    console.log("🎯 Julia Davis Analysis:");
                    console.log("   ID:", julia.id);
                    console.log("   Referred by:", julia.referredBy);
                    
                    if (julia.referredBy) {
                        const referrer = allUsers.find(u => u.id === julia.referredBy);
                        if (referrer) {
                            console.log("   Referrer:", referrer.name, "(", referrer.email, ")");
                        }
                    }
                }
            }
        }
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

debugTeamCount();