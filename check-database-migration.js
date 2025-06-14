import { db } from './server/db.js';
import { 
  users, 
  packages, 
  earnings, 
  binaryStructure, 
  emiPayments, 
  withdrawals
} from './shared/schema.js';

async function checkDatabaseMigration() {
  console.log('=== CHECKING DATABASE MIGRATION STATUS ===\n');
  
  try {
    // Check Users table
    console.log('📊 USERS TABLE:');
    const allUsers = await db.select().from(users);
    console.log(`Total users in PostgreSQL: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`  - ID: ${user.id}, Name: "${user.name}", Email: ${user.email}, Role: ${user.role}`);
    });
    
    // Check Packages table
    console.log('\n📦 PACKAGES TABLE:');
    const allPackages = await db.select().from(packages);
    console.log(`Total packages in PostgreSQL: ${allPackages.length}`);
    allPackages.forEach(pkg => {
      console.log(`  - ID: ${pkg.id}, UserID: ${pkg.userId}, Type: ${pkg.packageType}, Amount: ₹${pkg.monthlyAmount}/month`);
    });
    
    // Check Earnings table
    console.log('\n💰 EARNINGS TABLE:');
    const allEarnings = await db.select().from(earnings);
    console.log(`Total earnings records in PostgreSQL: ${allEarnings.length}`);
    allEarnings.forEach(earning => {
      console.log(`  - ID: ${earning.id}, UserID: ${earning.userId}, Amount: ₹${earning.amount}, Type: ${earning.earningType}`);
    });
    
    // Check Binary Structure table
    console.log('\n🌳 BINARY STRUCTURE TABLE:');
    const allBinaryStructure = await db.select().from(binaryStructure);
    console.log(`Total binary structure records in PostgreSQL: ${allBinaryStructure.length}`);
    allBinaryStructure.forEach(bs => {
      console.log(`  - ID: ${bs.id}, UserID: ${bs.userId}, ParentID: ${bs.parentId}, Position: ${bs.position}, Level: ${bs.level}`);
    });
    
    // Check EMI Payments table
    console.log('\n💳 EMI PAYMENTS TABLE:');
    const allEMIPayments = await db.select().from(emiPayments);
    console.log(`Total EMI payments in PostgreSQL: ${allEMIPayments.length}`);
    allEMIPayments.forEach(emi => {
      console.log(`  - ID: ${emi.id}, UserID: ${emi.userId}, Amount: ₹${emi.amount}, Status: ${emi.status}`);
    });
    
    // Check Withdrawals table
    console.log('\n🏦 WITHDRAWALS TABLE:');
    const allWithdrawals = await db.select().from(withdrawals);
    console.log(`Total withdrawals in PostgreSQL: ${allWithdrawals.length}`);
    allWithdrawals.forEach(withdrawal => {
      console.log(`  - ID: ${withdrawal.id}, UserID: ${withdrawal.userId}, Amount: ₹${withdrawal.amount}, Status: ${withdrawal.status}`);
    });
    
    // Note: Skipping Auto Pool and Transactions tables as they may not be in the compiled schema
    
    console.log('\n=== MIGRATION STATUS SUMMARY ===');
    console.log(`Users: ${allUsers.length > 0 ? '✅ Data exists' : '❌ No data'}`);
    console.log(`Packages: ${allPackages.length > 0 ? '✅ Data exists' : '❌ No data'}`);
    console.log(`Earnings: ${allEarnings.length > 0 ? '✅ Data exists' : '❌ No data'}`);
    console.log(`Binary Structure: ${allBinaryStructure.length > 0 ? '✅ Data exists' : '❌ No data'}`);
    console.log(`EMI Payments: ${allEMIPayments.length > 0 ? '✅ Data exists' : '❌ No data'}`);
    console.log(`Withdrawals: ${allWithdrawals.length > 0 ? '✅ Data exists' : '❌ No data'}`);
    
    // Check if we have the basic required data
    const hasBasicData = allUsers.length > 0 && allPackages.length > 0;
    console.log(`\n🔍 OVERALL STATUS: ${hasBasicData ? '✅ Basic data migrated' : '❌ Migration incomplete or not done'}`);
    
    if (!hasBasicData) {
      console.log('\n⚠️  WARNING: It appears that data migration from memory storage to PostgreSQL is incomplete!');
      console.log('   This could explain why you\'re not seeing the expected data in the dashboard.');
      console.log('   The system might still be using memory storage or the migration process needs to be run.');
    }
    
  } catch (error) {
    console.error('❌ Error checking database:', error);
    console.log('\n🔍 This error might indicate:');
    console.log('   1. Database connection issues');
    console.log('   2. Tables not created (migrations not run)');
    console.log('   3. Schema mismatch between code and database');
  }
}

checkDatabaseMigration();