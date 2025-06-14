const { MemStorage } = require('./server/storage.js');

async function debugBinaryStructure() {
  const storage = new MemStorage();
  
  console.log('\n=== Debugging Binary Structure ===\n');

  // Get all users
  const allUsers = await storage.getAllUsers();
  console.log('All Users:');
  allUsers.forEach(user => {
    console.log(`- ${user.name} (ID: ${user.id})`);
  });

  // Get all packages
  const allPackages = await storage.getAllPackages();
  console.log('\nAll Packages:');
  allPackages.forEach(pkg => {
    console.log(`- User ID: ${pkg.userId}, Type: ${pkg.packageType}, Amount: ₹${pkg.monthlyAmount}`);
  });

  // Get all binary structures
  const allBinaryStructures = Array.from(storage.binaryStructures.values());
  console.log('\nBinary Structures:');
  allBinaryStructures.forEach(bs => {
    console.log(`- User ID: ${bs.userId}, Parent ID: ${bs.parentId}, Position: ${bs.position}`);
  });

  // Test binary business info for user 2 (Pelnora)
  console.log('\nTesting Binary Business Info for Pelnora:');
  const businessInfo = await storage.getBinaryBusinessInfo(2);
  console.log('Business Info:', businessInfo);
}

debugBinaryStructure().catch(console.error);