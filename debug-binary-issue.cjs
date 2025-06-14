// Debug binary structure issue
const { storage } = require('./server/pgStorage.js');

async function debugBinaryIssue() {
  try {
    console.log('🔍 Debugging binary structure issue...\n');
    
    // Get all data
    const packages = await storage.getAllPackages();
    const users = await storage.getAllUsers();
    
    console.log('=== ALL PACKAGES ===');
    packages.forEach(pkg => {
      const user = users.find(u => u.id === pkg.userId);
      console.log(`Package ID: ${pkg.id}, User: ${user?.name || 'Unknown'} (ID: ${pkg.userId}), Type: ${pkg.packageType}, Monthly: ₹${pkg.monthlyAmount}, Total Months: ${pkg.totalMonths}`);
    });
    
    console.log('\n=== ALL USERS ===');
    users.forEach(user => {
      console.log(`User ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Referred By: ${user.referredBy}, Left Count: ${user.leftTeamCount}, Right Count: ${user.rightTeamCount}`);
    });
    
    // Get binary structures from database
    console.log('\n=== BINARY STRUCTURES ===');
    const binaryStructures = await storage.getAllBinaryStructures ? await storage.getAllBinaryStructures() : [];
    binaryStructures.forEach(bs => {
      const user = users.find(u => u.id === bs.userId);
      const parent = users.find(u => u.id === bs.parentId);
      console.log(`Binary ID: ${bs.id}, User: ${user?.name || 'Unknown'} (ID: ${bs.userId}), Parent: ${parent?.name || 'Unknown'} (ID: ${bs.parentId}), Position: ${bs.position}, Level: ${bs.level}`);
    });
    
    // Test binary business info for Pelnora (user ID 2)
    console.log('\n=== BINARY BUSINESS INFO FOR PELNORA ===');
    const businessInfo = await storage.getBinaryBusinessInfo(2);
    console.log('Business Info:', businessInfo);
    
    // Test for specific users who should have packages
    console.log('\n=== CHECKING SPECIFIC USERS ===');
    const userIds = [7, 8, 9]; // Julia Davis users
    for (const userId of userIds) {
      const user = await storage.getUser(userId);
      const userPackage = await storage.getPackageByUserId(userId);
      console.log(`User ${userId} (${user?.name}): Package = ${userPackage ? `${userPackage.packageType} - ₹${userPackage.monthlyAmount}` : 'None'}`);
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugBinaryIssue();