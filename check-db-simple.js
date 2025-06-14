import { db } from './server/db.js';
import { sql } from 'drizzle-orm';

async function checkDatabase() {
  console.log('=== CHECKING DATABASE TABLES ===\n');
  
  try {
    // Check if tables exist
    console.log('📋 CHECKING TABLE EXISTENCE:');
    
    const tableQueries = [
      { name: 'users', query: sql`SELECT COUNT(*) as count FROM users` },
      { name: 'packages', query: sql`SELECT COUNT(*) as count FROM packages` },
      { name: 'earnings', query: sql`SELECT COUNT(*) as count FROM earnings` },
      { name: 'binary_structure', query: sql`SELECT COUNT(*) as count FROM binary_structure` },
      { name: 'emi_payments', query: sql`SELECT COUNT(*) as count FROM emi_payments` },
      { name: 'withdrawals', query: sql`SELECT COUNT(*) as count FROM withdrawals` }
    ];
    
    for (const table of tableQueries) {
      try {
        const result = await db.execute(table.query);
        const count = result.rows[0]?.count || 0;
        console.log(`  ${table.name}: ${count} records ${count > 0 ? '✅' : '❌'}`);
      } catch (error) {
        console.log(`  ${table.name}: Table not found or error ❌`);
        console.log(`    Error: ${error.message}`);
      }
    }
    
    // Get detailed user data
    console.log('\n👥 USER DETAILS:');
    try {
      const userResult = await db.execute(sql`SELECT id, name, email, role FROM users`);
      if (userResult.rows.length > 0) {
        userResult.rows.forEach(user => {
          console.log(`  - ID: ${user.id}, Name: "${user.name}", Email: ${user.email}, Role: ${user.role}`);
        });
      } else {
        console.log('  No users found in database');
      }
    } catch (error) {
      console.log(`  Error fetching users: ${error.message}`);
    }
    
    // Get detailed package data
    console.log('\n📦 PACKAGE DETAILS:');
    try {
      const packageResult = await db.execute(sql`SELECT id, user_id, package_type, monthly_amount FROM packages`);
      if (packageResult.rows.length > 0) {
        packageResult.rows.forEach(pkg => {
          console.log(`  - ID: ${pkg.id}, UserID: ${pkg.user_id}, Type: ${pkg.package_type}, Amount: ₹${pkg.monthly_amount}/month`);
        });
      } else {
        console.log('  No packages found in database');
      }
    } catch (error) {
      console.log(`  Error fetching packages: ${error.message}`);
    }
    
    // Check if we have the test user
    console.log('\n🔍 CHECKING FOR TEST USER:');
    try {
      const testUserResult = await db.execute(sql`SELECT * FROM users WHERE email = 'test@pelnora.com'`);
      if (testUserResult.rows.length > 0) {
        const user = testUserResult.rows[0];
        console.log(`  ✅ Test user found: ${user.name} (ID: ${user.id})`);
        
        // Check for user's package
        const packageResult = await db.execute(sql`SELECT * FROM packages WHERE user_id = ${user.id}`);
        if (packageResult.rows.length > 0) {
          const pkg = packageResult.rows[0];
          console.log(`  ✅ User has package: ${pkg.package_type} - ₹${pkg.monthly_amount}/month`);
        } else {
          console.log(`  ❌ User has NO package`);
        }
      } else {
        console.log('  ❌ Test user NOT found in database');
      }
    } catch (error) {
      console.log(`  Error checking test user: ${error.message}`);
    }
    
  } catch (error) {
    console.error('❌ Database connection error:', error);
    console.log('\n🔍 This suggests:');
    console.log('   1. Database is not running');
    console.log('   2. Connection configuration is wrong');
    console.log('   3. Database migrations have not been run');
  }
}

checkDatabase();