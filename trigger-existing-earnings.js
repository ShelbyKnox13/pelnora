import { db } from './server/db.js';
import { users, packages, earnings } from './shared/schema.js';
import { eq } from 'drizzle-orm';

async function triggerEarningsForExistingPackages() {
  console.log('🔄 Triggering earnings calculations for existing packages...');

  try {
    // Get all packages
    const allPackages = await db.select().from(packages);
    console.log(`Found ${allPackages.length} packages`);

    for (const pkg of allPackages) {
      console.log(`\n📦 Processing package for user ${pkg.userId}: ${pkg.packageType} (₹${pkg.monthlyAmount})`);
      
      // Get the user who bought this package
      const buyer = await db.select().from(users).where(eq(users.id, pkg.userId)).limit(1);
      if (!buyer.length) continue;
      
      const buyerUser = buyer[0];
      console.log(`👤 Buyer: ${buyerUser.name} (${buyerUser.email})`);
      
      if (!buyerUser.referredBy) {
        console.log(`   No referrer for ${buyerUser.name}`);
        continue;
      }

      // Get the direct referrer
      const referrer = await db.select().from(users).where(eq(users.id, buyerUser.referredBy)).limit(1);
      if (!referrer.length) continue;
      
      const referrerUser = referrer[0];
      console.log(`👆 Referrer: ${referrerUser.name} (${referrerUser.email})`);

      // Calculate direct income (5% of package amount)
      const directIncomeAmount = Math.round(pkg.monthlyAmount * 0.05);
      console.log(`💰 Direct income: ₹${directIncomeAmount} (5% of ₹${pkg.monthlyAmount})`);

      // Create direct income earning
      await db.insert(earnings).values({
        userId: referrerUser.id,
        amount: directIncomeAmount.toString(),
        earningType: 'direct',
        description: `Direct income from ${buyerUser.name}'s ${pkg.packageType} package`,
        relatedUserId: buyerUser.id,
      });

      // Update referrer's total earnings
      await db.update(users)
        .set({ totalEarnings: (parseFloat(referrerUser.totalEarnings || '0') + directIncomeAmount).toString() })
        .where(eq(users.id, referrerUser.id));

      console.log(`✅ Added direct income earning for ${referrerUser.name}`);

      // Calculate level income based on direct income
      const levelPercentages = [0.15, 0.10, 0.08, 0.06, 0.05, 0.04, 0.03, 0.02, 0.01, 0.01];
      
      let currentReferrerId = referrerUser.referredBy;
      let currentLevel = 1;
      
      while (currentReferrerId && currentLevel <= 10) {
        const uplineUser = await db.select().from(users).where(eq(users.id, currentReferrerId)).limit(1);
        if (!uplineUser.length) break;
        
        const upline = uplineUser[0];
        const levelPercentage = levelPercentages[currentLevel - 1];
        const levelIncomeAmount = Math.round(directIncomeAmount * levelPercentage);
        
        if (levelIncomeAmount > 0) {
          console.log(`📈 Level ${currentLevel} income for ${upline.name}: ₹${levelIncomeAmount} (${(levelPercentage * 100)}% of ₹${directIncomeAmount})`);
          
          await db.insert(earnings).values({
            userId: upline.id,
            amount: levelIncomeAmount.toString(),
            earningType: 'level',
            description: `Level ${currentLevel} income from ${buyerUser.name}'s package`,
            relatedUserId: buyerUser.id,
          });

          // Update upline's total earnings
          await db.update(users)
            .set({ totalEarnings: (parseFloat(upline.totalEarnings || '0') + levelIncomeAmount).toString() })
            .where(eq(users.id, upline.id));
        }
        
        currentReferrerId = upline.referredBy;
        currentLevel++;
      }
    }

    console.log('\n✅ Earnings calculations completed for all existing packages');

  } catch (error) {
    console.error('❌ Error triggering earnings:', error);
  }
}

triggerEarningsForExistingPackages();