import { storage } from './server/storage';

// Test for a 10,000 rupee package to verify level income calculation
async function test10kPackage() {
  console.log('Starting 10k package test...');
  
  try {
    // Create a root user (Pelnora)
    const rootUser = await storage.createUser({
      name: "TestPelnora",
      email: "testpelnora@example.com",
      phone: "1234567890",
      password: "password123",
      role: "user",
      isActive: true,
    });
    console.log(`Created root user: ${rootUser.name} (ID: ${rootUser.id})`);
    
    // Create a direct referral for the root user
    const directRef = await storage.createUser({
      name: "DirectRef10k",
      email: "directref10k@example.com",
      phone: "2345678901",
      password: "password123",
      role: "user",
      isActive: true,
    }, rootUser.id, "left");
    console.log(`Created direct referral: ${directRef.name} (ID: ${directRef.id})`);
    
    // Create a level 1 user (direct referral's referral)
    const levelOneUser = await storage.createUser({
      name: "LevelOne10k",
      email: "levelone10k@example.com",
      phone: "3456789012",
      password: "password123",
      role: "user",
      isActive: true,
    }, directRef.id, "left");
    console.log(`Created level 1 user: ${levelOneUser.name} (ID: ${levelOneUser.id})`);
    
    // Create package for level 1 user to trigger earnings calculation (10,000 package)
    const levelOnePackage = await storage.createPackage({
      userId: levelOneUser.id,
      packageType: "diamond",
      monthlyAmount: "10000",
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
    
    // Calculate the expected level 1 income
    const directIncome = 10000 * 0.05; // 500 rupees
    const level1Income = directIncome * 0.15; // 75 rupees
    
    console.log('\nCalculation check:');
    console.log(`- Direct income: 5% of ₹10,000 = ₹${directIncome}`);
    console.log(`- Level 1 income: 15% of ₹${directIncome} = ₹${level1Income}`);
    
    console.log('\nTest completed successfully!');
  } catch (error) {
    console.error('Error during test:', error);
  }
}

// Run the test
test10kPackage();