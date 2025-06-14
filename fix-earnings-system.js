// Fix earnings system - Check and recalculate all earnings
import { storage } from './server/pgStorage.js';

async function fixEarningsSystem() {
    console.log("=== FIXING EARNINGS SYSTEM ===\n");
    
    try {
        // 1. Check all users
        console.log("1. Checking all users:");
        const allUsers = await storage.getAllUsers();
        allUsers.forEach(user => {
            console.log(`- ${user.name} (ID: ${user.id}, Email: ${user.email})`);
            console.log(`  Referred by: ${user.referredBy || 'None'}`);
            console.log(`  Total earnings: ₹${user.totalEarnings}`);
            console.log(`  Referral ID: ${user.referralId}`);
        });
        
        // 2. Check all packages
        console.log("\n2. Checking all packages:");
        const allPackages = await storage.getAllPackages();
        allPackages.forEach(pkg => {
            console.log(`- Package ID: ${pkg.id}, User ID: ${pkg.userId}`);
            console.log(`  Type: ${pkg.packageType}, Amount: ₹${pkg.monthlyAmount}/month`);
        });
        
        // 3. Check all earnings
        console.log("\n3. Checking all earnings:");
        const allEarnings = await storage.getAllEarnings();
        console.log(`Total earnings records: ${allEarnings.length}`);
        allEarnings.forEach(earning => {
            console.log(`- User ID: ${earning.userId}, Type: ${earning.earningType}, Amount: ₹${earning.amount}`);
            console.log(`  Description: ${earning.description}`);
        });
        
        // 4. Check binary structure
        console.log("\n4. Checking binary structure:");
        const binaryStructures = Array.from(storage.binaryStructures.values());
        console.log(`Total binary structure records: ${binaryStructures.length}`);
        binaryStructures.forEach(bs => {
            console.log(`- User ID: ${bs.userId}, Parent ID: ${bs.parentId}, Position: ${bs.position}`);
        });
        
        // 5. Find Pelnora user and check referrals
        console.log("\n5. Checking Pelnora's referral structure:");
        const pelnoraUser = await storage.getUserByEmail("test@pelnora.com");
        if (pelnoraUser) {
            console.log(`Pelnora user found: ${pelnoraUser.name} (ID: ${pelnoraUser.id})`);
            console.log(`Referral ID: ${pelnoraUser.referralId}`);
            
            // Find direct referrals
            const directReferrals = allUsers.filter(u => u.referredBy === pelnoraUser.id);
            console.log(`Direct referrals: ${directReferrals.length}`);
            directReferrals.forEach(ref => {
                console.log(`  - ${ref.name} (ID: ${ref.id}, Email: ${ref.email})`);
            });
            
            // Check level 1 users (referrals of direct referrals)
            console.log("\nLevel 1 users (referrals of direct referrals):");
            for (const directRef of directReferrals) {
                const level1Users = allUsers.filter(u => u.referredBy === directRef.id);
                console.log(`  From ${directRef.name}: ${level1Users.length} users`);
                level1Users.forEach(l1User => {
                    console.log(`    - ${l1User.name} (ID: ${l1User.id})`);
                });
            }
        }
        
        // 6. Recalculate earnings for all packages
        console.log("\n6. Recalculating earnings for all packages:");
        for (const pkg of allPackages) {
            console.log(`\nRecalculating earnings for package ${pkg.id} (User: ${pkg.userId})`);
            await storage.calculateRealEarnings(pkg.userId, pkg);
        }
        
        // 7. Check earnings after recalculation
        console.log("\n7. Checking earnings after recalculation:");
        const updatedEarnings = await storage.getAllEarnings();
        console.log(`Total earnings records after recalculation: ${updatedEarnings.length}`);
        
        // Group earnings by user
        const earningsByUser = {};
        updatedEarnings.forEach(earning => {
            if (!earningsByUser[earning.userId]) {
                earningsByUser[earning.userId] = [];
            }
            earningsByUser[earning.userId].push(earning);
        });
        
        for (const [userId, userEarnings] of Object.entries(earningsByUser)) {
            const user = await storage.getUser(parseInt(userId));
            console.log(`\n${user?.name || 'Unknown'} (ID: ${userId}) earnings:`);
            userEarnings.forEach(earning => {
                console.log(`  - ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
            });
            
            const totalEarnings = userEarnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
            console.log(`  Total: ₹${totalEarnings.toFixed(2)}`);
        }
        
        console.log("\n=== EARNINGS SYSTEM CHECK COMPLETE ===");
        
    } catch (error) {
        console.error("Error fixing earnings system:", error);
    }
}

// Run the fix
fixEarningsSystem().then(() => {
    console.log("Fix complete!");
}).catch(error => {
    console.error("Fix failed:", error);
});