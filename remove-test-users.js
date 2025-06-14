import fetch from 'node-fetch';

async function removeTestUsers() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('=== Removing Test Users ===\n');
    
    // Login as admin to access user management
    console.log('1. Logging in as admin...');
    const adminLoginResponse = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@pelnora.com',
        password: 'admin123'
      }),
      credentials: 'include'
    });
    
    if (!adminLoginResponse.ok) {
      throw new Error(`Admin login failed: ${adminLoginResponse.status}`);
    }
    
    const adminLoginData = await adminLoginResponse.json();
    console.log('Admin login successful:', adminLoginData.name);
    const adminCookies = adminLoginResponse.headers.get('set-cookie');
    
    // Get all users to find the test users
    console.log('\n2. Getting all users...');
    const usersResponse = await fetch(`${baseUrl}/api/users`, {
      headers: {
        'Cookie': adminCookies
      }
    });
    
    if (!usersResponse.ok) {
      throw new Error(`Failed to get users: ${usersResponse.status}`);
    }
    
    const users = await usersResponse.json();
    console.log('Total users found:', users.length);
    
    // Find test users to remove
    const testUsersToRemove = [
      'Package Test User',
      'Diamond Test User',
      'Real Test User',
      'Test Referral User'
    ];
    
    const testUsers = users.filter(u => testUsersToRemove.includes(u.name));
    
    console.log('\nTest users found for removal:');
    testUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
    if (testUsers.length === 0) {
      console.log('✅ No test users found to remove.');
    } else {
      console.log(`\n⚠️  Found ${testUsers.length} test users that should be removed.`);
      console.log('Note: Since we\'re using in-memory storage, these will be cleared when server restarts.');
    }
    
    // List remaining users after cleanup
    const remainingUsers = users.filter(u => !testUsersToRemove.includes(u.name));
    console.log('\nRemaining users in system:');
    remainingUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
    // Check Pelnora's earnings after cleanup
    console.log('\n3. Checking Pelnora earnings...');
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
    console.log('Pelnora current earnings count:', earnings.length);
    
    if (earnings.length > 0) {
      console.log('Current earnings:');
      earnings.forEach(earning => {
        console.log(`- ${earning.earningType}: ₹${earning.amount} - ${earning.description}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

removeTestUsers();