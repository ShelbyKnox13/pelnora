// Simple test to check if getBinaryBusinessInfo method exists
const fs = require('fs');

// Check if the method exists in the compiled JavaScript
const pgStorageContent = fs.readFileSync('./server/pgStorage.js', 'utf8');

if (pgStorageContent.includes('getBinaryBusinessInfo')) {
  console.log('✅ getBinaryBusinessInfo method found in pgStorage.js');
} else {
  console.log('❌ getBinaryBusinessInfo method NOT found in pgStorage.js');
}

// Check if the method exists in the TypeScript source
const storageContent = fs.readFileSync('./server/storage.ts', 'utf8');

if (storageContent.includes('getBinaryBusinessInfo')) {
  console.log('✅ getBinaryBusinessInfo method found in storage.ts');
} else {
  console.log('❌ getBinaryBusinessInfo method NOT found in storage.ts');
}

console.log('\n=== Checking what storage exports ===');
try {
  const { storage } = require('./server/storage.js');
  console.log('Available methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(storage)));
  
  if (typeof storage.getBinaryBusinessInfo === 'function') {
    console.log('✅ getBinaryBusinessInfo is available as a function');
  } else {
    console.log('❌ getBinaryBusinessInfo is NOT available as a function');
  }
} catch (error) {
  console.error('Error loading storage:', error.message);
}