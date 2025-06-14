import fetch from 'node-fetch';

async function testEarnings() {
  const baseUrl = 'http://localhost:3000';
  
  try {
    // Step 1: Login as test user
    console.log('Logging in as test user...');
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
    
    // Step 2: Check current earnings
    console.log('\nChecking current earnings...');
    const earningsResponse = await fetch(`${baseUrl}/api/earnings/me`, {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!earningsResponse.ok) {
      throw new Error(`Earnings fetch failed: ${earningsResponse.status}`);
    }
    
    const currentEarnings = await earningsResponse.json();
    console.log('Current earnings count:', currentEarnings.length);
    
    // Step 3: Generate demo earnings
    console.log('\nGenerating demo earnings...');
    const demoResponse = await fetch(`${baseUrl}/api/earnings/generate-demo`, {
      method: 'POST',
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!demoResponse.ok) {
      throw new Error(`Demo generation failed: ${demoResponse.status}`);
    }
    
    const demoResult = await demoResponse.json();
    console.log('Demo generation result:', demoResult.message);
    
    // Step 4: Check earnings after generation
    console.log('\nChecking earnings after generation...');
    const newEarningsResponse = await fetch(`${baseUrl}/api/earnings/me`, {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (!newEarningsResponse.ok) {
      throw new Error(`New earnings fetch failed: ${newEarningsResponse.status}`);
    }
    
    const newEarnings = await newEarningsResponse.json();
    console.log('New earnings count:', newEarnings.length);
    console.log('Earnings details:', newEarnings);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testEarnings();