import fetch from 'node-fetch';

const baseUrl = 'http://localhost:3000';
let cookies = '';

async function testCorrectedEarnings() {
  console.log('\n=== Testing Corrected Earnings System ===\n');

  // Step 1: Login as Pelnora and get referral ID
  console.log('1. Logging in as Pelnora...');
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

  if (!pelnoraLoginResponse.ok) {
    throw new Error('Failed to login as Pelnora');
  }

  cookies = pelnoraLoginResponse.headers.get('set-cookie');
  const pelnoraData = await pelnoraLoginResponse.json();
  const pelnoraReferralId = pelnoraData.referralId;
  console.log(`Pelnora referral ID: ${pelnoraReferralId}\n`);

  // Step 2: Get Pelnora's user object by referral code
  console.log('2. Fetching Pelnora user object by referral code...');
  const pelnoraUserResponse = await fetch(`${baseUrl}/api/users/by-referral/${pelnoraReferralId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Cookie': cookies
    }
  });
  if (!pelnoraUserResponse.ok) {
    throw new Error('Failed to fetch Pelnora user by referral code');
  }
  const pelnoraUser = await pelnoraUserResponse.json();
  const pelnoraUserId = pelnoraUser.id;
  console.log(`Pelnora numeric user ID: ${pelnoraUserId}\n`);

  // Step 3: Register new user under Pelnora (using numeric user ID)
  console.log('3. Registering new user under Pelnora...');
  const newUserResponse = await fetch(`${baseUrl}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'test123',
      phone: '9876543210',
      referredBy: pelnoraUserId, // Use numeric user ID
      packageType: 'basic',
      monthlyAmount: '1000'
    })
  });

  if (!newUserResponse.ok) {
    const error = await newUserResponse.text();
    throw new Error(`Registration failed: ${newUserResponse.status} - ${error}`);
  }

  const newUserData = await newUserResponse.json();
  console.log(`New user registered with ID: ${newUserData.id}\n`);

  // Step 4: Login as new user
  console.log('4. Logging in as new user...');
  const newUserLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: newUserData.email,
      password: 'test123'
    }),
    credentials: 'include'
  });

  if (!newUserLoginResponse.ok) {
    throw new Error('Failed to login as new user');
  }

  const newUserCookies = newUserLoginResponse.headers.get('set-cookie');
  console.log('New user logged in successfully\n');

  // Step 5: Check Pelnora's earnings
  console.log('5. Checking Pelnora earnings...');
  const pelnoraEarningsResponse = await fetch(`${baseUrl}/api/earnings`, {
    headers: {
      'Cookie': cookies
    }
  });

  if (!pelnoraEarningsResponse.ok) {
    throw new Error('Failed to get Pelnora earnings');
  }

  const pelnoraEarnings = await pelnoraEarningsResponse.json();
  console.log('Pelnora earnings:');
  console.log(JSON.stringify(pelnoraEarnings, null, 2));

  // Step 6: Check level income specifically
  console.log('\n6. Checking level income distribution...');
  const levelIncome = pelnoraEarnings.filter(earning => earning.earningType === 'level');
  console.log('Level income entries:');
  console.log(JSON.stringify(levelIncome, null, 2));

  // Verify no level income for direct referral
  const directLevelIncome = levelIncome.filter(earning => 
    earning.description.includes('Level 1') && 
    earning.relatedUserId === newUserData.id
  );

  if (directLevelIncome.length > 0) {
    console.log('\n❌ ERROR: Level income was incorrectly given for direct referral!');
  } else {
    console.log('\n✅ SUCCESS: No level income given for direct referral (correct behavior)');
  }
}

testCorrectedEarnings().catch(console.error);