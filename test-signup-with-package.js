import fetch from 'node-fetch';

async function testSignupWithPackage() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('=== Testing Signup with Package Selection ===\n');
    
    // Step 1: Get Pelnora's referral ID
    console.log('1. Getting Pelnora referral ID...');
    const referralResponse = await fetch(`${baseUrl}/api/auth/test-referral-id`);
    const referralData = await referralResponse.json();
    console.log('Pelnora referral ID:', referralData.referralId);
    
    // Step 2: Register a new user with package selection
    console.log('\n2. Registering new user with Gold package...');
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Package Test User',
        email: 'packagetest@example.com',
        phone: '9876543288',
        password: 'test123',
        referralId: referralData.referralId,
        packageType: 'gold'  // This should trigger earnings calculation
      })
    });
    
    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      throw new Error(`Registration failed: ${registerResponse.status} - ${error}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('Registration successful!');
    console.log('User:', registerData.name);
    console.log('Package:', registerData.packageType);
    console.log('Monthly Amount:', registerData.monthlyAmount);
    
    // Step 3: Immediately check Pelnora's earnings (should have direct income now)
    console.log('\n3. Checking Pelnora earnings immediately after registration...');
    const pelnoraLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@pelnora.com',
        password: 'test123'
      }),
      credentials: 'include'
    });
    
    const pelnoraLoginData = await pelnoraLoginResponse.json();
    const pelnoraLoginCookies = pelnoraLoginResponse.headers.get('set-cookie');
    
    const earningsResponse = await fetch(`${baseUrl}/api/earnings/me`, {
      headers: {
        'Cookie': pelnoraLoginCookies
      }
    });
    
    const earnings = await earningsResponse.json();
    console.log('Pelnora earnings count:', earnings.length);
    
    if (earnings.length > 0) {
      console.log('\n✅ SUCCESS: Real-time earnings calculation working!');
      earnings.forEach(earning => {
        console.log(`- ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
      });
      
      // Verify the calculation
      const directEarning = earnings.find(e => e.earningType === 'direct');
      if (directEarning) {
        const expectedAmount = 3000 * 0.05; // 5% of ₹3000 Gold package
        const actualAmount = parseFloat(directEarning.amount);
        console.log(`\n📊 Calculation Verification:`);
        console.log(`Expected: ₹${expectedAmount} (5% of ₹3000 Gold package)`);
        console.log(`Actual: ₹${actualAmount}`);
        console.log(`✅ ${expectedAmount === actualAmount ? 'CORRECT' : 'INCORRECT'}`);
      }
    } else {
      console.log('\n❌ No earnings found. Check server logs for issues.');
    }
    
    // Step 4: Test with different package
    console.log('\n4. Testing with Diamond package...');
    const diamondRegisterResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Diamond Test User',
        email: 'diamondtest@example.com',
        phone: '9876543277',
        password: 'test123',
        referralId: referralData.referralId,
        packageType: 'diamond'  // ₹10,000/month
      })
    });
    
    if (diamondRegisterResponse.ok) {
      const diamondData = await diamondRegisterResponse.json();
      console.log('Diamond user registered:', diamondData.name);
      
      // Check earnings again
      const newEarningsResponse = await fetch(`${baseUrl}/api/earnings/me`, {
        headers: {
          'Cookie': pelnoraLoginCookies
        }
      });
      
      const newEarnings = await newEarningsResponse.json();
      console.log('Total earnings after Diamond user:', newEarnings.length);
      
      const diamondEarning = newEarnings.find(e => 
        e.earningType === 'direct' && e.description.includes('Diamond Test User')
      );
      
      if (diamondEarning) {
        console.log(`Diamond package earning: ₹${diamondEarning.amount} (Expected: ₹500)`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testSignupWithPackage();