
import { storage } from './server/pgStorage.js';

async function debugPelnorasBinary() {
  console.log('🔍 Debugging Pelnora\'s Binary Income Issue...\n');
  
  try {
    // 1. Get Pelnora's user data
    const pelnora = await storage.getUserByEmail('test@pelnora.com');
    if (!pelnora) {
      console.log('❌ Pelnora user not found');
      return;
    }
    
    console.log('=== PELNORA USER DATA ===');
    console.log(`ID: ${pelnora.id}`);
    console.log(`Name: ${pelnora.name}`);
    console.log(`Left Team Count: ${pelnora.leftTeamCount}`);
    console.log(`Right Team Count: ${pelnora.rightTeamCount}`);
    console.log(`Left Carry Forward: ₹${pelnora.leftCarryForward || 0}`);
    console.log(`Right Carry Forward: ₹${pelnora.rightCarryForward || 0}`);
    
    // 2. Get all users referred by Pelnora
    const allUsers = await storage.getAllUsers();
    const directReferrals = allUsers.filter(u => u.referredBy === pelnora.referralId);
    
    console.log('\n=== DIRECT REFERRALS ===');
    console.log(`Total direct referrals: ${directReferrals.length}`);
    directReferrals.forEach(user => {
      console.log(`- ${user.name} (ID: ${user.id}, Email: ${user.email})`);
    });
    
    // 3. Get binary structures for Pelnora's team
    const binaryStructures = Array.from(storage.binaryStructures.values());
    const pelnoraTeamStructures = binaryStructures.filter(bs => bs.parentId === pelnora.id);
    
    console.log('\n=== BINARY STRUCTURE UNDER PELNORA ===');
    console.log(`Binary structures where Pelnora is parent: ${pelnoraTeamStructures.length}`);
    pelnoraTeamStructures.forEach(bs => {
      const user = allUsers.find(u => u.id === bs.userId);
      console.log(`- ${user?.name || 'Unknown'} (ID: ${bs.userId}) on ${bs.position} side, Level: ${bs.level}`);
    });
    
    // 4. Get packages for team members
    const allPackages = await storage.getAllPackages();
    const teamPackages = allPackages.filter(pkg => 
      pelnoraTeamStructures.some(bs => bs.userId === pkg.userId)
    );
    
    console.log('\n=== TEAM PACKAGES ===');
    teamPackages.forEach(pkg => {
      const user = allUsers.find(u => u.id === pkg.userId);
      const structure = pelnoraTeamStructures.find(bs => bs.userId === pkg.userId);
      console.log(`- ${user?.name}: ${pkg.packageType} (₹${pkg.monthlyAmount}/month) on ${structure?.position} side`);
    });
    
    // 5. Calculate business volumes manually
    const leftSidePackages = teamPackages.filter(pkg => {
      const structure = pelnoraTeamStructures.find(bs => bs.userId === pkg.userId);
      return structure?.position === 'left';
    });
    
    const rightSidePackages = teamPackages.filter(pkg => {
      const structure = pelnoraTeamStructures.find(bs => bs.userId === pkg.userId);
      return structure?.position === 'right';
    });
    
    const leftBusiness = leftSidePackages.reduce((sum, pkg) => sum + parseFloat(pkg.monthlyAmount), 0);
    const rightBusiness = rightSidePackages.reduce((sum, pkg) => sum + parseFloat(pkg.monthlyAmount), 0);
    
    console.log('\n=== BUSINESS VOLUME CALCULATION ===');
    console.log(`Left side: ${leftSidePackages.length} packages = ₹${leftBusiness}`);
    console.log(`Right side: ${rightSidePackages.length} packages = ₹${rightBusiness}`);
    console.log(`Left carry forward: ₹${pelnora.leftCarryForward || 0}`);
    console.log(`Right carry forward: ₹${pelnora.rightCarryForward || 0}`);
    
    const totalLeft = leftBusiness + (parseFloat(pelnora.leftCarryForward) || 0);
    const totalRight = rightBusiness + (parseFloat(pelnora.rightCarryForward) || 0);
    
    console.log(`Total left volume: ₹${totalLeft}`);
    console.log(`Total right volume: ₹${totalRight}`);
    
    // 6. Check binary matching criteria
    const leftCount = pelnoraTeamStructures.filter(bs => bs.position === 'left').length;
    const rightCount = pelnoraTeamStructures.filter(bs => bs.position === 'right').length;
    
    console.log('\n=== BINARY MATCHING ANALYSIS ===');
    console.log(`Left team count: ${leftCount}`);
    console.log(`Right team count: ${rightCount}`);
    console.log(`Pelnora's stored left count: ${pelnora.leftTeamCount}`);
    console.log(`Pelnora's stored right count: ${pelnora.rightTeamCount}`);
    
    // Check if counts match
    if (leftCount !== pelnora.leftTeamCount || rightCount !== pelnora.rightTeamCount) {
      console.log('⚠️  MISMATCH: Binary structure counts don\'t match user\'s team counts!');
    }
    
    // Check 2:1 or 1:2 criteria
    const canMatch21 = leftCount >= 2 && rightCount >= 1;
    const canMatch12 = leftCount >= 1 && rightCount >= 2;
    const canMatch = canMatch21 || canMatch12;
    
    console.log(`Can do 2:1 matching: ${canMatch21}`);
    console.log(`Can do 1:2 matching: ${canMatch12}`);
    console.log(`Overall can match: ${canMatch}`);
    
    if (canMatch && totalLeft > 0 && totalRight > 0) {
      const weakerSide = Math.min(totalLeft, totalRight);
      const expectedBinaryIncome = weakerSide * 0.05; // 5% binary income
      console.log(`\n💰 SHOULD GENERATE BINARY INCOME:`);
      console.log(`Weaker side: ₹${weakerSide}`);
      console.log(`Expected binary income: ₹${expectedBinaryIncome}`);
    } else {
      console.log('\n❌ BINARY INCOME CONDITIONS NOT MET:');
      if (!canMatch) {
        console.log('- Team count criteria not met (need 2:1 or 1:2)');
      }
      if (totalLeft === 0) {
        console.log('- No business volume on left side');
      }
      if (totalRight === 0) {
        console.log('- No business volume on right side');
      }
    }
    
    // 7. Check existing earnings
    const earnings = await storage.getEarningsByUserId(pelnora.id);
    const binaryEarnings = earnings.filter(e => e.earningType === 'binary');
    
    console.log('\n=== EXISTING EARNINGS ===');
    console.log(`Total earnings: ${earnings.length}`);
    console.log(`Binary earnings: ${binaryEarnings.length}`);
    
    if (binaryEarnings.length > 0) {
      console.log('Binary earnings found:');
      binaryEarnings.forEach(earning => {
        console.log(`- ₹${earning.amount}: ${earning.description}`);
      });
    }
    
    // 8. Identify the root cause
    console.log('\n=== ROOT CAUSE ANALYSIS ===');
    if (directReferrals.length === 0) {
      console.log('❌ No direct referrals found');
    } else if (pelnoraTeamStructures.length === 0) {
      console.log('❌ No binary structures created for team members');
    } else if (teamPackages.length === 0) {
      console.log('❌ No packages found for team members');
    } else if (!canMatch) {
      console.log('❌ Team count criteria not met for binary matching');
    } else if (totalLeft === 0 || totalRight === 0) {
      console.log('❌ Insufficient business volume on one or both sides');
    } else {
      console.log('✅ All conditions met - binary income should be generated!');
      console.log('🔍 Check if calculateRealEarnings is being called properly');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugPelnorasBinary();
