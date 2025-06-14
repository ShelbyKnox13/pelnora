import { MemStorage } from './server/storage.js';

async function debugUsers() {
  console.log('=== DEBUGGING USERS AND PACKAGES ===');
  
  const storage = new MemStorage();
  
  // Wait a bit for async user creation to complete
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('\n--- ALL USERS ---');
  const allUsers = await storage.getAllUsers();
  allUsers.forEach(user => {
    console.log(`ID: ${user.id}, Name: "${user.name}", Email: "${user.email}", Role: ${user.role}`);
  });
  
  console.log('\n--- ALL PACKAGES ---');
  const allPackages = await storage.getAllPackages();
  allPackages.forEach(pkg => {
    console.log(`Package ID: ${pkg.id}, User ID: ${pkg.userId}, Type: ${pkg.packageType}, Amount: ₹${pkg.monthlyAmount}/month`);
  });
  
  console.log('\n--- USER BY EMAIL TEST ---');
  const testUser = await storage.getUserByEmail('test@pelnora.com');
  if (testUser) {
    console.log(`Found user: ${testUser.name} (ID: ${testUser.id})`);
    
    const userPackage = await storage.getPackageByUserId(testUser.id);
    if (userPackage) {
      console.log(`User has package: ${userPackage.packageType} - ₹${userPackage.monthlyAmount}/month`);
    } else {
      console.log('User has NO package');
    }
  } else {
    console.log('test@pelnora.com user NOT FOUND');
  }
  
  console.log('\n=== DEBUG COMPLETE ===');
}

debugUsers().catch(console.error);