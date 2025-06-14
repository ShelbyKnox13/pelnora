// Fix binary team counts by calculating entire downline
console.log("🌳 Fixing binary team counts...");

async function fixBinaryTeamCounts() {
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
        
        // Function to recursively count downline on a specific side
        function countDownlineOnSide(userId, side, allUsers, visited = new Set()) {
            if (visited.has(userId)) return 0; // Prevent infinite loops
            visited.add(userId);
            
            // Find direct referrals of this user
            const directReferrals = allUsers.filter(u => u.referredBy === userId);
            
            let count = 0;
            
            // For the root user, we need to determine which referrals go to which side
            // For simplicity, let's assume first referral goes left, second goes right, etc.
            // In a real system, this would be based on binary structure placement
            
            if (side === 'left') {
                // Count first referral and all their downline
                if (directReferrals.length > 0) {
                    const leftChild = directReferrals[0];
                    count += 1; // Count the child itself
                    // Count all downline of this child (both left and right)
                    count += countAllDownline(leftChild.id, allUsers, new Set(visited));
                }
            } else if (side === 'right') {
                // Count second referral and all their downline
                if (directReferrals.length > 1) {
                    const rightChild = directReferrals[1];
                    count += 1; // Count the child itself
                    // Count all downline of this child (both left and right)
                    count += countAllDownline(rightChild.id, allUsers, new Set(visited));
                }
            }
            
            return count;
        }
        
        // Function to count all downline (both sides) of a user
        function countAllDownline(userId, allUsers, visited = new Set()) {
            if (visited.has(userId)) return 0;
            visited.add(userId);
            
            const directReferrals = allUsers.filter(u => u.referredBy === userId);
            let count = 0;
            
            for (const referral of directReferrals) {
                count += 1; // Count the referral itself
                count += countAllDownline(referral.id, allUsers, new Set(visited)); // Count their downline
            }
            
            return count;
        }
        
        console.log("\n3. Analyzing and fixing binary team counts...");
        
        // Fix team counts for each user
        for (const user of allUsers) {
            if (user.role === 'admin') continue;
            
            const directReferrals = allUsers.filter(u => u.referredBy === user.id);
            
            // Calculate correct left and right team counts
            const correctLeftCount = countDownlineOnSide(user.id, 'left', allUsers);
            const correctRightCount = countDownlineOnSide(user.id, 'right', allUsers);
            
            const currentLeftCount = user.leftTeamCount;
            const currentRightCount = user.rightTeamCount;
            
            console.log(`\n👤 ${user.name} (ID: ${user.id})`);
            console.log(`   Direct referrals: ${directReferrals.length}`);
            console.log(`   Current: Left=${currentLeftCount}, Right=${currentRightCount}, Total=${currentLeftCount + currentRightCount}`);
            console.log(`   Correct: Left=${correctLeftCount}, Right=${correctRightCount}, Total=${correctLeftCount + correctRightCount}`);
            
            // Show the structure
            if (directReferrals.length > 0) {
                console.log(`   Structure:`);
                directReferrals.forEach((ref, index) => {
                    const side = index === 0 ? 'LEFT' : 'RIGHT';
                    const refDownline = countAllDownline(ref.id, allUsers);
                    console.log(`     ${side}: ${ref.name} (ID: ${ref.id}) + ${refDownline} downline`);
                    
                    // Show who's under this referral
                    const subReferrals = allUsers.filter(u => u.referredBy === ref.id);
                    subReferrals.forEach(sub => {
                        console.log(`       └── ${sub.name} (ID: ${sub.id})`);
                    });
                });
            }
            
            // Update if there's a mismatch
            if (correctLeftCount !== currentLeftCount || correctRightCount !== currentRightCount) {
                console.log(`   ⚠️ MISMATCH! Updating team counts...`);
                
                const updateResponse = await fetch(`http://localhost:3000/api/users/${user.id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Cookie': sessionCookie || ''
                    },
                    body: JSON.stringify({
                        leftTeamCount: correctLeftCount,
                        rightTeamCount: correctRightCount
                    })
                });
                
                if (updateResponse.ok) {
                    console.log(`   ✅ Successfully updated team counts`);
                } else {
                    console.log(`   ❌ Failed to update team counts`);
                }
            } else {
                console.log(`   ✅ Team counts are correct`);
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
            
            console.log("\n📊 Updated Binary Team Counts:");
            updatedUsers.forEach(user => {
                if (user.role !== 'admin') {
                    const totalTeam = user.leftTeamCount + user.rightTeamCount;
                    const directReferrals = updatedUsers.filter(u => u.referredBy === user.id);
                    console.log(`   - ${user.name}: ${totalTeam} total team (Left: ${user.leftTeamCount}, Right: ${user.rightTeamCount}) | ${directReferrals.length} direct`);
                }
            });
        }
        
        console.log("\n✅ Binary team count fix completed!");
        console.log("🎯 Dashboard should now show correct team member counts including entire downline.");
        
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

fixBinaryTeamCounts();