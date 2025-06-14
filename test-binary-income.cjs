const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBinaryIncome() {
  try {
    console.log('🧪 Testing binary income calculation...\n');
    
    // 1. Check current state
    console.log('1. Checking current binary structure...');
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
      const pelnoraLoginData = await pelnoraLoginResponse.json();
      const pelnoraLoginCookies = pelnoraLoginResponse.headers.get('set-cookie');
      
      console.log('✅ Pelnora login successful!');
      console.log('Current earnings:', pelnoraLoginData.totalEarnings);
      
      const binaryResponse = await fetch('http://localhost:3000/api/binary-structure/me', {
        headers: {
          'Cookie': pelnoraLoginCookies
        }
      });
      
      if (binaryResponse.status === 200) {
        const binaryData = await binaryResponse.json();
        console.log('📊 Current Binary Structure:');
        console.log(`   Left Team Business: ₹${binaryData.leftTeamBusiness}`);
        console.log(`   Right Team Business: ₹${binaryData.rightTeamBusiness}`);
        console.log(`   Left Carry Forward: ₹${binaryData.leftCarryForward}`);
        console.log(`   Right Carry Forward: ₹${binaryData.rightCarryForward}`);
        
        // Check if binary income should be generated
        const leftBusiness = parseFloat(binaryData.leftTeamBusiness);
        const rightBusiness = parseFloat(binaryData.rightTeamBusiness);
        const leftCarryForward = parseFloat(binaryData.leftCarryForward);
        const rightCarryForward = parseFloat(binaryData.rightCarryForward);
        
        const totalLeft = leftBusiness + leftCarryForward;
        const totalRight = rightBusiness + rightCarryForward;
        
        console.log(`\n💼 Total Business (including carry forward):`);
        console.log(`   Left: ₹${totalLeft}`);
        console.log(`   Right: ₹${totalRight}`);
        
        const minBusiness = Math.min(totalLeft, totalRight);
        const maxBusiness = Math.max(totalLeft, totalRight);
        
        if (minBusiness > 0 && maxBusiness >= minBusiness * 2) {
          const expectedBinaryIncome = minBusiness * 0.10;
          console.log(`\n🎯 Binary matching criteria met!`);
          console.log(`   Smaller side: ₹${minBusiness}`);
          console.log(`   Expected binary income: ₹${expectedBinaryIncome} (10% of smaller side)`);
        } else if (minBusiness > 0) {
          console.log(`\n⏳ Binary matching criteria not met yet.`);
          console.log(`   Need 2:1 ratio. Current: ${maxBusiness}:${minBusiness}`);
          console.log(`   For matching, need at least ₹${minBusiness * 2} on larger side`);
        } else {
          console.log(`\n❌ No business on one side yet.`);
        }
      }
    }
    
    // 2. Test the binary income calculation by manually calling it
    console.log('\n2. Testing manual binary income calculation...');
    
    // Login as admin to access debug endpoints
    const adminLoginResponse = await fetch('http://localhost:3000/api/admin/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'Qwertghjkl@13'
      })
    });
    
    if (adminLoginResponse.status === 200) {
      const adminCookies = adminLoginResponse.headers.get('set-cookie');
      console.log('✅ Admin login successful!');
      
      // Check earnings before
      const earningsBeforeResponse = await fetch('http://localhost:3000/api/earnings', {
        headers: {
          'Cookie': adminCookies
        }
      });
      
      if (earningsBeforeResponse.status === 200) {
        const earningsBefore = await earningsBeforeResponse.json();
        const pelnoraEarningsBefore = earningsBefore.filter(e => e.userId === 2);
        console.log(`\n📊 Pelnora's earnings before: ${pelnoraEarningsBefore.length} entries`);
        pelnoraEarningsBefore.forEach(earning => {
          console.log(`   - ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBinaryIncome();