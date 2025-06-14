// Debug binary tree structure
console.log("🌳 Debugging binary tree structure...");

async function debugBinaryTree() {
    try {
        // Login as admin to get all users
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
        console.log(`\n2. Found ${allUsers.length} users`);
        
        // Find Pelnora
        const pelnora = allUsers.find(u => u.email === 'test@pelnora.com');
        if (!pelnora) {
            console.log("❌ Pelnora user not found");
            return;
        }
        
        console.log(`\n3. Analyzing Pelnora's structure:`);
        console.log(`   Pelnora ID: ${pelnora.id}`);
        console.log(`   Current Left Team Count: ${pelnora.leftTeamCount}`);
        console.log(`   Current Right Team Count: ${pelnora.rightTeamCount}`);
        console.log(`   Total Team Count: ${pelnora.leftTeamCount + pelnora.rightTeamCount}`);
        
        // Find direct referrals
        const directReferrals = allUsers.filter(u => u.referredBy === pelnora.id);
        console.log(`\n4. Direct Referrals (${directReferrals.length}):`);
        directReferrals.forEach(user => {
            console.log(`   - ${user.name} (ID: ${user.id}, Email: ${user.email})`);
        });
        
        // Find all users in the system and their referral relationships
        console.log(`\n5. Complete User Structure:`);
        allUsers.forEach(user => {
            if (user.role !== 'admin') {
                const referrer = user.referredBy ? allUsers.find(u => u.id === user.referredBy) : null;
                console.log(`   - ${user.name} (ID: ${user.id})`);
                console.log(`     Email: ${user.email}`);
                console.log(`     Referred by: ${referrer ? referrer.name + ' (ID: ' + referrer.id + ')' : 'None'}`);
                console.log(`     Team Count: Left=${user.leftTeamCount}, Right=${user.rightTeamCount}`);
                console.log('');
            }
        });
        
        // Check if Prince exists
        const prince = allUsers.find(u => u.name.toLowerCase().includes('prince'));
        if (prince) {
            console.log(`\n6. Prince found:`);
            console.log(`   Name: ${prince.name}`);
            console.log(`   ID: ${prince.id}`);
            console.log(`   Email: ${prince.email}`);
            console.log(`   Referred by: ${prince.referredBy}`);
            
            // Check if Julia is under Prince
            const juliaUnderPrince = allUsers.filter(u => u.referredBy === prince.id);
            if (juliaUnderPrince.length > 0) {
                console.log(`   Prince's referrals:`);
                juliaUnderPrince.forEach(user => {
                    console.log(`     - ${user.name} (ID: ${user.id})`);
                });
            }
        } else {
            console.log(`\n6. Prince not found in current users`);
        }
        
        // Check for multiple Julias
        const julias = allUsers.filter(u => u.name.toLowerCase().includes('julia'));
        console.log(`\n7. Julia users found (${julias.length}):`);
        julias.forEach(julia => {
            const referrer = julia.referredBy ? allUsers.find(u => u.id === julia.referredBy) : null;
            console.log(`   - ${julia.name} (ID: ${julia.id})`);
            console.log(`     Email: ${julia.email}`);
            console.log(`     Referred by: ${referrer ? referrer.name + ' (ID: ' + referrer.id + ')' : 'None'}`);
        });
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

debugBinaryTree();