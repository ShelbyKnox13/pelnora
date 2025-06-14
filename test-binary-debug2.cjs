const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBinaryDebug() {
  try {
    console.log('🔍 Testing binary business calculation...\n');
    
    // 1. Login as admin
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
    
    if (adminLoginResponse.status !== 200) {
      throw new Error('Admin login failed');
    }
    
    const adminCookies = adminLoginResponse.headers.get('set-cookie');
    console.log('✅ Admin login successful!');
    
    // 2. Get debug info
    console.log('2. Getting binary structures debug info...');
    const debugResponse = await fetch('http://localhost:3000/api/debug/binary-structures', {
      headers: {
        'Cookie': adminCookies
      }
    });
    
    if (debugResponse.status === 200) {
      const debugData = await debugResponse.json();
      console.log('\n📋 Binary Structures Debug Info:');
      
      console.log('\n🏗️ Binary Structures:');
      debugData.binaryStructures.forEach(bs => {
        console.log(`   - ${bs.userName} (ID: ${bs.userId}) under ${bs.parentName} (ID: ${bs.parentId}) - Position: ${bs.position}, Level: ${bs.level}`);
      });
      
      console.log('\n👥 All Users:');
      debugData.users.forEach(user => {
        console.log(`   - ${user.name} (ID: ${user.id}) - Email: ${user.email}, Referred By: ${user.referredBy}, Left: ${user.leftTeamCount}, Right: ${user.rightTeamCount}`);
      });
      
      console.log('\n📦 All Packages:');
      debugData.packages.forEach(pkg => {
        console.log(`   - ${pkg.userName} (ID: ${pkg.userId}) - ${pkg.packageType}: ₹${pkg.monthlyAmount}/month`);
      });
    } else {
      console.log('❌ Debug API failed:', debugResponse.status);
    }
    
    // 3. Login as Pelnora and test binary structure
    console.log('\n3. Testing as Pelnora...');
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
    
    if (pelnoraLoginResponse.status === 200) {
      const pelnoraLoginData = await pelnoraLoginResponse.json();
      const pelnoraLoginCookies = pelnoraLoginResponse.headers.get('set-cookie');
      
      console.log('✅ Pelnora login successful!');
      console.log('Pelnora data:', {
        id: pelnoraLoginData.id,
        name: pelnoraLoginData.name,
        leftTeamCount: pelnoraLoginData.leftTeamCount,
        rightTeamCount: pelnoraLoginData.rightTeamCount,
        leftCarryForward: pelnoraLoginData.leftCarryForward,
        rightCarryForward: pelnoraLoginData.rightCarryForward
      });
      
      // Test binary business API
      console.log('\n4. Testing binary business API...');
      const binaryBusinessResponse = await fetch('http://localhost:3000/api/binary-business/me', {
        headers: {
          'Cookie': pelnoraLoginCookies
        }
      });
      
      if (binaryBusinessResponse.status === 200) {
        const binaryBusinessData = await binaryBusinessResponse.json();
        console.log('✅ Binary business API successful!');
        console.log('Binary Business Data:', binaryBusinessData);
      } else {
        console.log('❌ Binary business API failed:', binaryBusinessResponse.status);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testBinaryDebug();