import fetch from 'node-fetch';

async function testRealEarnings() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('=== Testing Real Earnings System ===\n');
    
    // Step 1: Get Pelnora's referral ID
    console.log('1. Getting Pelnora referral ID...');
    const referralResponse = await fetch(`${baseUrl}/api/auth/test-referral-id`);
    const referralData = await referralResponse.json();
    console.log('Pelnora referral ID:', referralData.referralId);
    
    // Step 2: Register a new user under Pelnora
    console.log('\n2. Registering new user under Pelnora...');
    const registerResponse = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Referral User',
        email: 'referral@test.com',
        phone: '9876543211',
        password: 'test123',
        referralId: referralData.referralId
      })
    });
    
    if (!registerResponse.ok) {
      const error = await registerResponse.text();
      throw new Error(`Registration failed: ${registerResponse.status} - ${error}`);
    }
    
    const registerData = await registerResponse.json();
    console.log('Registration successful:', registerData.message);
    
    // Step 3: Login as the new user
    console.log('\n3. Logging in as new user...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'referral@test.com',
        password: 'test123'
      }),
      credentials: 'include'
    });
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.name);
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Step 4: Purchase a package (this should trigger real earnings)
    console.log('\n4. Purchasing a Gold package (₹3000/month)...');
    const packageResponse = await fetch(`${baseUrl}/api/packages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      },
      body: JSON.stringify({
        packageType: 'gold',
        monthlyAmount: '3000',
        totalMonths: 11
      })
    });
    
    if (!packageResponse.ok) {
      const error = await packageResponse.text();
      throw new Error(`Package purchase failed: ${packageResponse.status} - ${error}`);
    }
    
    const packageData = await packageResponse.json();
    console.log('Package purchased successfully:', packageData);
    
    // Step 5: Check Pelnora's earnings (should have direct income now)
    console.log('\n5. Checking Pelnora earnings...');
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
    console.log('Earnings details:', earnings);
    
    if (earnings.length > 0) {
      console.log('\n✅ SUCCESS: Real earnings system is working!');
      earnings.forEach(earning => {
        console.log(`- ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
      });
    } else {
      console.log('\n❌ No earnings found. Check server logs for issues.');
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testRealEarnings();