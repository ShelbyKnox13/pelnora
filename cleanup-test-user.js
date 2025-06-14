import fetch from 'node-fetch';

async function cleanupTestUser() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    console.log('=== Cleaning up Test Referral User ===\n');
    
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
    
    // Get all users to find the test referral user
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
    
    // Find test referral user
    const testUser = users.find(u => u.email === 'referral@test.com');
    if (testUser) {
      console.log('Found test referral user:', testUser.name, 'ID:', testUser.id);
      console.log('✅ Test user identified for removal');
    } else {
      console.log('❌ Test referral user not found');
    }
    
    // List all users for verification
    console.log('\nCurrent users in system:');
    users.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

cleanupTestUser();