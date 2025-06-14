import { storage } from './server/storage';

// Test the level structure by creating a hierarchy of users
async function testLevelIncome() {
  console.log('Starting level income test...');
  
  try {
    // Create a root user (similar to Pelnora)
    const rootUser = await storage.createUser({
      name: "Test Root",
      email: "test-root@example.com",
      phone: "1234567890",
      password: "password123",
      role: "user",
      isActive: true,
    });
    console.log(`Created root user: ${rootUser.name} (ID: ${rootUser.id})`);
    
    // Create a direct referral for the root user
    const directRef = await storage.createUser({
      name: "Direct Referral",
      email: "direct-ref@example.com",
      phone: "2345678901",
      password: "password123",
      role: "user",
      isActive: true,
    }, rootUser.id, "left");
    console.log(`Created direct referral: ${directRef.name} (ID: ${directRef.id})`);
    
    // Create a level 1 user (direct referral's referral)
    const levelOneUser = await storage.createUser({
      name: "Level 1 User",
      email: "level1@example.com",
      phone: "3456789012",
      password: "password123",
      role: "user",
      isActive: true,
    }, directRef.id, "left");
    console.log(`Created level 1 user: ${levelOneUser.name} (ID: ${levelOneUser.id})`);
    
    // Create package for level 1 user to trigger earnings calculation
    const levelOnePackage = await storage.createPackage({
      userId: levelOneUser.id,
      packageType: "silver",
      monthlyAmount: "2000",
      totalMonths: 11
    });
    console.log(`Created package for level 1 user: ${levelOnePackage.packageType} (₹${levelOnePackage.monthlyAmount})`);
    
    // Check earnings for root user
    const rootEarnings = await storage.getEarningsByUserId(rootUser.id);
    console.log('\nRoot user earnings:');
    rootEarnings.forEach(earning => {
      console.log(`- ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
    });
    
    // Check earnings for direct referral
    const directRefEarnings = await storage.getEarningsByUserId(directRef.id);
    console.log('\nDirect referral earnings:');
    directRefEarnings.forEach(earning => {
      console.log(`- ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
    });
    
    // Check level statistics
    const levelStats = await storage.calculateLevelEarnings(rootUser.id);
    console.log('\nLevel statistics for root user:');
    levelStats.forEach(level => {
      console.log(`Level ${level.level}: Status=${level.status}, Members=${level.members}, Earnings=${level.earnings}`);
    });
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
testLevelIncome();