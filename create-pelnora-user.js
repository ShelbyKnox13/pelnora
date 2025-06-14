import { storage } from './server/pgStorage.js';
import bcrypt from 'bcryptjs';

async function createPelnoraUser() {
  console.log('=== CREATING PELNORA USER ===');
  
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail('test@pelnora.com');
    if (existingUser) {
      console.log('Pelnora user already exists:', existingUser.name);
      
      // Check if user has a package
      const userPackage = await storage.getPackageByUserId(existingUser.id);
      if (userPackage) {
        console.log(`User has package: ${userPackage.packageType} - ₹${userPackage.monthlyAmount}/month`);
      } else {
        console.log('User has NO package - creating Diamond package...');
        
        // Create Diamond package for existing user
        const newPackage = await storage.createPackage({
          userId: existingUser.id,
          packageType: "diamond",
          monthlyAmount: "10000",
          totalMonths: 11,
        });
        
        console.log('✅ Diamond package created:', newPackage);
      }
      return;
    }
    
    console.log('Creating new Pelnora user...');
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('test123', salt);
    
    // Create user
    const newUser = await storage.createUser({
      name: "Pelnora",
      email: "test@pelnora.com",
      phone: "9876543210",
      password: hashedPassword,
      role: "user",
      isActive: true,
    });
    
    console.log('✅ User created:', newUser.name, '(ID:', newUser.id + ')');
    
    // Create Diamond package
    const newPackage = await storage.createPackage({
      userId: newUser.id,
      packageType: "diamond",
      monthlyAmount: "10000",
      totalMonths: 11,
    });
    
    console.log('✅ Diamond package created:', newPackage);
    
    console.log('\n=== PELNORA USER SETUP COMPLETE ===');
    console.log('Login credentials:');
    console.log('Email: test@pelnora.com');
    console.log('Password: test123');
    
  } catch (error) {
    console.error('❌ Error creating Pelnora user:', error);
  }
}

createPelnoraUser();