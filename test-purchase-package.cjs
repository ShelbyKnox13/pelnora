const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testPurchasePackage() {
  try {
    console.log('🧪 Testing package purchase to trigger binary calculation...\n');
    
    // 1. Login as a user who can purchase a package
    console.log('1. Creating a new user...');
    const signupResponse = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Binary User',
        email: `testbinary${Date.now()}@test.com`,
        phone: '9999999999',
        password: 'test123',
        referralId: 'PELTEST001', // Pelnora's referral ID
        placementPosition: 'left' // Place on left side
      })
    });
    
    if (signupResponse.status !== 201) {
      const errorText = await signupResponse.text();
      throw new Error(`Signup failed: ${signupResponse.status} - ${errorText}`);
    }
    
    const signupData = await signupResponse.json();
    console.log('✅ New user created:', signupData.user.name, 'ID:', signupData.user.id);
    
    // 2. Login as the new user
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: signupData.user.email,
        password: 'test123'
      })
    });
    
    if (loginResponse.status !== 200) {
      throw new Error('Login failed');
    }
    
    const loginCookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Login successful!');
    
    // 3. Purchase a package
    console.log('2. Purchasing a package...');
    const packageResponse = await fetch('http://localhost:3000/api/packages/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': loginCookies
      },
      body: JSON.stringify({
        packageType: 'diamond',
        totalMonths: 12
      })
    });
    
    if (packageResponse.status !== 201) {
      const errorText = await packageResponse.text();
      throw new Error(`Package purchase failed: ${packageResponse.status} - ${errorText}`);
    }
    
    const packageData = await packageResponse.json();
    console.log('✅ Package purchased successfully!');
    console.log('Package details:', packageData);
    
    // 4. Check Pelnora's binary structure after the purchase
    console.log('\n3. Checking Pelnora\'s binary structure after purchase...');
    const pelnoraLoginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@pelnora.com',
        password: 'test123'
      })
    });
    
    if (pelnoraLoginResponse.status === 200) {
      const pelnoraLoginCookies = pelnoraLoginResponse.headers.get('set-cookie');
      
      const binaryResponse = await fetch('http://localhost:3000/api/binary-structure/me', {
        headers: {
          'Cookie': pelnoraLoginCookies
        }
      });
      
      if (binaryResponse.status === 200) {
        const binaryData = await binaryResponse.json();
        console.log('📊 Updated Binary Structure Data:');
        console.log(`   User: ${binaryData.user.name} (ID: ${binaryData.user.id})`);
        console.log(`   Left Team Count: ${binaryData.leftTeamCount}`);
        console.log(`   Right Team Count: ${binaryData.rightTeamCount}`);
        console.log(`   Left Team Business: ₹${binaryData.leftTeamBusiness}`);
        console.log(`   Right Team Business: ₹${binaryData.rightTeamBusiness}`);
        console.log(`   Left Carry Forward: ₹${binaryData.leftCarryForward}`);
        console.log(`   Right Carry Forward: ₹${binaryData.rightCarryForward}`);
        
        if (binaryData.downline && binaryData.downline.length > 0) {
          console.log(`\n   Downline Members (${binaryData.downline.length}):`);
          binaryData.downline.forEach(member => {
            console.log(`     - ${member.name} (ID: ${member.id}) - Position: ${member.position}, Level: ${member.level}`);
          });
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testPurchasePackage();