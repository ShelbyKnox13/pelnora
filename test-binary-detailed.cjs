const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBinaryStructure() {
  try {
    console.log('🧪 Testing binary structure API in detail...\n');
    
    // 1. Login first
    console.log('1. Logging in...');
    const loginUrl = 'http://localhost:3000/api/auth/login';
    console.log('Making login request to:', loginUrl);
    
    const loginResponse = await fetch(loginUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@pelnora.com',
        password: 'test123'
      })
    });
    
    console.log('Login response status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login response body:', loginData);
    
    if (loginResponse.status !== 200) {
      throw new Error('Login failed');
    }
    
    // Extract cookies for session
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('✅ Login successful!');
    
    // 2. Test binary structure API
    console.log('2. Testing binary structure API...');
    const binaryResponse = await fetch('http://localhost:3000/api/binary-structure/me', {
      headers: {
        'Cookie': cookies
      }
    });
    
    if (binaryResponse.status !== 200) {
      const errorText = await binaryResponse.text();
      throw new Error(`Binary structure API failed: ${binaryResponse.status} - ${errorText}`);
    }
    
    const binaryData = await binaryResponse.json();
    console.log('✅ Binary structure API successful!');
    
    // 3. Display detailed results
    console.log('📊 Binary Structure Data:');
    console.log(`   User: ${binaryData.user.name} (ID: ${binaryData.user.id})`);
    console.log(`   Left Team Count: ${binaryData.leftTeamCount}`);
    console.log(`   Right Team Count: ${binaryData.rightTeamCount}`);
    console.log(`   Total Team Size: ${binaryData.totalTeamSize}`);
    console.log(`   Left Team Business: ₹${binaryData.leftTeamBusiness}`);
    console.log(`   Right Team Business: ₹${binaryData.rightTeamBusiness}`);
    console.log(`   Left Carry Forward: ₹${binaryData.leftCarryForward}`);
    console.log(`   Right Carry Forward: ₹${binaryData.rightCarryForward}`);
    
    if (binaryData.downline && binaryData.downline.length > 0) {
      console.log(`\n   Downline Members (${binaryData.downline.length}):`);
      binaryData.downline.forEach(member => {
        console.log(`     - ${member.name} (ID: ${member.id}) - Position: ${member.position}, Level: ${member.level}`);
      });
    } else {
      console.log('\n   No downline members found');
    }
    
    // 4. Test admin API to get all users and packages
    console.log('\n3. Testing admin login...');
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
      
      // Get all users
      console.log('4. Getting all users...');
      const usersResponse = await fetch('http://localhost:3000/api/users', {
        headers: {
          'Cookie': adminCookies
        }
      });
      
      let users = [];
      if (usersResponse.status === 200) {
        users = await usersResponse.json();
        console.log('\n📋 All Users:');
        users.forEach(user => {
          console.log(`   - ${user.name} (ID: ${user.id}) - Email: ${user.email}, Referred By: ${user.referredBy}, Left: ${user.leftTeamCount}, Right: ${user.rightTeamCount}`);
        });
      }
      
      // Get all packages
      console.log('\n5. Getting all packages...');
      const packagesResponse = await fetch('http://localhost:3000/api/packages', {
        headers: {
          'Cookie': adminCookies
        }
      });
      
      if (packagesResponse.status === 200) {
        const packages = await packagesResponse.json();
        console.log('\n📦 All Packages:');
        packages.forEach(pkg => {
          const user = users.find(u => u.id === pkg.userId);
          console.log(`   - Package ID: ${pkg.id}, User: ${user?.name || 'Unknown'} (ID: ${pkg.userId}), Type: ${pkg.packageType}, Monthly: ₹${pkg.monthlyAmount}`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBinaryStructure();