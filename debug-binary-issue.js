// Debug binary structure issue
import { storage } from './server/pgStorage.js';

async function debugBinaryIssue() {
  try {
    console.log('🔍 Debugging binary structure issue...\n');
    
    // Get all data
    const packages = await storage.getAllPackages();
    const users = await storage.getAllUsers();
    const binaryStructures = Array.from(storage.binaryStructures.values());
    
    console.log('=== ALL PACKAGES ===');
    packages.forEach(pkg => {
      const user = users.find(u => u.id === pkg.userId);
      console.log(`Package ID: ${pkg.id}, User: ${user?.name || 'Unknown'} (ID: ${pkg.userId}), Type: ${pkg.packageType}, Monthly: ₹${pkg.monthlyAmount}, Total Months: ${pkg.totalMonths}`);
    });
    
    console.log('\n=== ALL USERS ===');
    users.forEach(user => {
      console.log(`User ID: ${user.id}, Name: ${user.name}, Email: ${user.email}, Referred By: ${user.referredBy}, Left Count: ${user.leftTeamCount}, Right Count: ${user.rightTeamCount}`);
    });
    
    console.log('\n=== BINARY STRUCTURES ===');
    binaryStructures.forEach(bs => {
      const user = users.find(u => u.id === bs.userId);
      const parent = users.find(u => u.id === bs.parentId);
      console.log(`Binary ID: ${bs.id}, User: ${user?.name || 'Unknown'} (ID: ${bs.userId}), Parent: ${parent?.name || 'Unknown'} (ID: ${bs.parentId}), Position: ${bs.position}, Level: ${bs.level}`);
    });
    
    // Test binary business info for Pelnora (user ID 2)
    console.log('\n=== BINARY BUSINESS INFO FOR PELNORA ===');
    const businessInfo = await storage.getBinaryBusinessInfo(2);
    console.log('Business Info:', businessInfo);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

debugBinaryIssue();