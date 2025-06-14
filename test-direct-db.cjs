// Direct database test to check binary structures
const { Client } = require('pg');

async function testDirectDB() {
  const client = new Client({
    host: 'localhost',
    port: 5432,
    database: 'pelnora',
    user: 'postgres',
    password: 'admin',
  });

  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check table structure first
    console.log('\n📋 Users table structure:');
    const tableStructure = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      ORDER BY ordinal_position
    `);
    tableStructure.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });

    // Get all users
    console.log('\n👥 All Users:');
    const usersResult = await client.query('SELECT * FROM users ORDER BY id LIMIT 10');
    console.log('First user columns:', Object.keys(usersResult.rows[0] || {}));
    usersResult.rows.forEach(user => {
      console.log(`   - ${user.name} (ID: ${user.id}) - Email: ${user.email}, Referred By: ${user.referredBy || user.referred_by}, Left: ${user.leftTeamCount || user.left_team_count}, Right: ${user.rightTeamCount || user.right_team_count}`);
    });

    // Get all packages
    console.log('\n📦 All Packages:');
    const packagesResult = await client.query('SELECT p.id, p.user_id, p.package_type, p.monthly_amount, p.total_months, u.name FROM packages p JOIN users u ON p.user_id = u.id ORDER BY p.id');
    packagesResult.rows.forEach(pkg => {
      console.log(`   - ${pkg.name} (ID: ${pkg.user_id}) - ${pkg.package_type}: ₹${pkg.monthly_amount}/month x ${pkg.total_months} months`);
    });

    // Check specifically for Julia Davis (ID: 7) package
    console.log('\n🔍 Checking Julia Davis (ID: 7) package specifically:');
    const juliaPackageResult = await client.query('SELECT * FROM packages WHERE user_id = 7');
    if (juliaPackageResult.rows.length === 0) {
      console.log('   ❌ Julia Davis (ID: 7) has NO package!');
    } else {
      console.log('   ✅ Julia Davis (ID: 7) packages:');
      juliaPackageResult.rows.forEach(pkg => {
        console.log(`     - Package ID: ${pkg.id}, Type: ${pkg.package_type}, Monthly: ₹${pkg.monthly_amount}, Total Months: ${pkg.total_months}`);
      });
    }

    // Get all binary structures
    console.log('\n🏗️ All Binary Structures:');
    const binaryResult = await client.query(`
      SELECT bs.id, bs.user_id, bs.parent_id, bs.position, bs.level, 
             u.name as user_name, p.name as parent_name
      FROM binary_structure bs 
      JOIN users u ON bs.user_id = u.id 
      LEFT JOIN users p ON bs.parent_id = p.id 
      ORDER BY bs.id
    `);
    
    if (binaryResult.rows.length === 0) {
      console.log('   ❌ No binary structures found!');
    } else {
      binaryResult.rows.forEach(bs => {
        console.log(`   - ${bs.user_name} (ID: ${bs.user_id}) under ${bs.parent_name || 'NULL'} (ID: ${bs.parent_id}) - Position: ${bs.position}, Level: ${bs.level}`);
      });
    }

    // Check specific relationships
    console.log('\n🔍 Checking specific relationships:');
    
    // Check if Prince (ID: 8) has a binary structure
    const princeResult = await client.query('SELECT * FROM binary_structure WHERE user_id = 8');
    if (princeResult.rows.length === 0) {
      console.log('   ❌ Prince (ID: 8) has no binary structure entry!');
    } else {
      console.log('   ✅ Prince (ID: 8) binary structure:', princeResult.rows[0]);
    }

    // Check Pelnora's direct downline
    const pelnoraDownlineResult = await client.query('SELECT * FROM binary_structure WHERE parent_id = 2');
    console.log(`   Pelnora's direct downline: ${pelnoraDownlineResult.rows.length} entries`);
    pelnoraDownlineResult.rows.forEach(bs => {
      console.log(`     - User ID: ${bs.user_id}, Position: ${bs.position}`);
    });

    // Fix the missing binary structure for Julia Davis (ID: 7)
    console.log('\n🔧 Fixing missing binary structure...');
    
    // Check if Julia Davis (ID: 7) has a binary structure
    const juliaResult = await client.query('SELECT * FROM binary_structure WHERE user_id = 7');
    if (juliaResult.rows.length === 0) {
      console.log('   ❌ Julia Davis (ID: 7) has no binary structure entry!');
      console.log('   🔧 Creating binary structure for Julia Davis (ID: 7) under Pelnora (ID: 2) on left side...');
      
      await client.query(`
        INSERT INTO binary_structure (user_id, parent_id, position, level) 
        VALUES (7, 2, 'left', 1)
      `);
      
      console.log('   ✅ Binary structure created for Julia Davis (ID: 7)');
    } else {
      console.log('   ✅ Julia Davis (ID: 7) already has binary structure:', juliaResult.rows[0]);
    }

    // Verify the fix
    console.log('\n✅ Verification after fix:');
    const updatedPelnoraDownlineResult = await client.query('SELECT * FROM binary_structure WHERE parent_id = 2');
    console.log(`   Pelnora's direct downline: ${updatedPelnoraDownlineResult.rows.length} entries`);
    updatedPelnoraDownlineResult.rows.forEach(bs => {
      console.log(`     - User ID: ${bs.user_id}, Position: ${bs.position}`);
    });

  } catch (error) {
    console.error('❌ Database error:', error.message);
  } finally {
    await client.end();
  }
}

testDirectDB();