
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBinaryTrigger() {
  try {
    console.log('🧪 Testing Binary Income Trigger...\n');
    
    // 1. Login as Pelnora to check current state
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
    
    if (!pelnoraLoginResponse.ok) {
      throw new Error('Failed to login as Pelnora');
    }
    
    const pelnoraData = await pelnoraLoginResponse.json();
    const pelnoraLoginCookies = pelnoraLoginResponse.headers.get('set-cookie');
    
    console.log('✅ Pelnora login successful');
    console.log(`Current total earnings: ₹${pelnoraData.totalEarnings || 0}`);
    
    // 2. Get current binary structure
    const binaryResponse = await fetch('http://localhost:3000/api/binary-structure/me', {
      headers: {
        'Cookie': pelnoraLoginCookies
      }
    });
    
    if (binaryResponse.ok) {
      const binaryData = await binaryResponse.json();
      console.log('\n📊 Current Binary Structure:');
      console.log(`Left Team: ${binaryData.leftTeamCount || 0} members, ₹${binaryData.leftTeamBusiness || 0} business`);
      console.log(`Right Team: ${binaryData.rightTeamCount || 0} members, ₹${binaryData.rightTeamBusiness || 0} business`);
      console.log(`Carry Forward: Left ₹${binaryData.leftCarryForward || 0}, Right ₹${binaryData.rightCarryForward || 0}`);
      
      // Check if binary income should be generated
      const leftTotal = (parseFloat(binaryData.leftTeamBusiness) || 0) + (parseFloat(binaryData.leftCarryForward) || 0);
      const rightTotal = (parseFloat(binaryData.rightTeamBusiness) || 0) + (parseFloat(binaryData.rightCarryForward) || 0);
      const leftCount = parseInt(binaryData.leftTeamCount) || 0;
      const rightCount = parseInt(binaryData.rightTeamCount) || 0;
      
      console.log(`\nTotal volumes: Left ₹${leftTotal}, Right ₹${rightTotal}`);
      console.log(`Team counts: Left ${leftCount}, Right ${rightCount}`);
      
      const canMatch = (leftCount >= 2 && rightCount >= 1) || (leftCount >= 1 && rightCount >= 2);
      
      if (canMatch && leftTotal > 0 && rightTotal > 0) {
        const weakerSide = Math.min(leftTotal, rightTotal);
        const expectedBinary = weakerSide * 0.05;
        console.log(`\n💰 Binary conditions met!`);
        console.log(`Expected binary income: ₹${expectedBinary} (5% of ₹${weakerSide})`);
      } else {
        console.log(`\n❌ Binary conditions not met:`);
        console.log(`- Can match (2:1 or 1:2): ${canMatch}`);
        console.log(`- Has left business: ${leftTotal > 0}`);
        console.log(`- Has right business: ${rightTotal > 0}`);
      }
    }
    
    // 3. Check current earnings
    const earningsResponse = await fetch('http://localhost:3000/api/earnings/me', {
      headers: {
        'Cookie': pelnoraLoginCookies
      }
    });
    
    if (earningsResponse.ok) {
      const earnings = await earningsResponse.json();
      const binaryEarnings = earnings.filter(e => e.earningType === 'binary');
      
      console.log(`\n📈 Current Earnings: ${earnings.length} total`);
      console.log(`Binary earnings: ${binaryEarnings.length}`);
      
      if (binaryEarnings.length > 0) {
        binaryEarnings.forEach(earning => {
          console.log(`- ₹${earning.amount}: ${earning.description}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBinaryTrigger();
