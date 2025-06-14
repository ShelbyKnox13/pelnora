// Test script to check level statistics API
const fetch = require('node-fetch');

async function testLevelStats() {
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@pelnora.com',
        password: 'test123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    // Get cookies from login response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Cookies:', cookies);

    // Get level statistics
    const levelStatsResponse = await fetch('http://localhost:3000/api/level-statistics/me', {
      method: 'GET',
      headers: {
        'Cookie': cookies || ''
      }
    });

    const levelStatsData = await levelStatsResponse.json();
    console.log('\nLevel Statistics:');
    console.log(JSON.stringify(levelStatsData, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

testLevelStats();