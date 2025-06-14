import fetch from 'node-fetch';

async function testPackage() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Step 1: Login as Pelnora user
    console.log('Logging in as Pelnora user...');
    const loginResponse = await fetch(`${baseUrl}/api/auth/login`, {
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
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }
    
    const loginData = await loginResponse.json();
    console.log('Login successful:', loginData.name);
    
    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    
    // Step 2: Check package details
    console.log('\nChecking package details...');
    const packageResponse = await fetch(`${baseUrl}/api/packages/me`, {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!packageResponse.ok) {
      throw new Error(`Package fetch failed: ${packageResponse.status}`);
    }
    
    const packageData = await packageResponse.json();
    console.log('Package details:', {
      packageType: packageData.packageType,
      monthlyAmount: packageData.monthlyAmount,
      totalMonths: packageData.totalMonths,
      totalValue: parseFloat(packageData.monthlyAmount) * packageData.totalMonths
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testPackage();