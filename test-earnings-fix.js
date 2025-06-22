import { storage } from './server/pgStorage.js';

async function testEarningsSystem() {
  console.log('🧪 Testing corrected earnings system...');

  try {
    // 1. Test direct income calculation (5% of package amount)
    console.log('\n1. Testing Direct Income (5% of package amount)');
    
    // Get Pelnora and Test1 users
    const pelnora = await storage.getUserByEmail('test@pelnora.com');
    const test1 = await storage.getUserByEmail('hell.shelbyknox@outlook.in');
    
    if (pelnora && test1) {
      console.log(`📊 Test1 referred by Pelnora`);
      console.log(`   Test1's package: Diamond (₹10,000/month)`);
      console.log(`   Expected direct income for Pelnora: ₹500 (5% of ₹10,000)`);
      
      const pelnoraEarnings = await storage.getEarningsByUserId(pelnora.id);
      const directEarnings = pelnoraEarnings.filter(e => e.earningType === 'direct');
      
      console.log(`   Actual direct earnings for Pelnora: ${directEarnings.length} entries`);
      directEarnings.forEach(earning => {
        console.log(`     ₹${earning.amount} - ${earning.description}`);
      });
    }

    // 2. Test level income calculation (based on direct income)
    console.log('\n2. Testing Level Income (calculated on direct income amount)');
    
    if (pelnora) {
      const levelEarnings = pelnoraEarnings.filter(e => e.earningType === 'level');
      console.log(`   Level earnings for Pelnora: ${levelEarnings.length} entries`);
      levelEarnings.forEach((earning, index) => {
        console.log(`     Level ${index + 1}: ₹${earning.amount} - ${earning.description}`);
      });
      
      console.log('\n   Expected level percentages:');
      console.log('     Level 1: 15%, Level 2: 10%, Level 3: 8%');
      console.log('     Level 4: 6%, Level 5: 5%, Level 6: 4%');
      console.log('     Level 7: 3%, Level 8: 2%, Level 9: 1%, Level 10: 1%');
    }

    // 3. Test binary income (5% with 2:1 first match, then 1:1)
    console.log('\n3. Testing Binary Income (5% with proper matching)');
    
    if (pelnora) {
      const binaryEarnings = pelnoraEarnings.filter(e => e.earningType === 'binary');
      console.log(`   Binary earnings for Pelnora: ${binaryEarnings.length} entries`);
      binaryEarnings.forEach(earning => {
        console.log(`     ₹${earning.amount} - ${earning.description}`);
      });
      
      // Check Pelnora's team structure
      console.log(`   Pelnora's team: Left=${pelnora.leftTeamCount}, Right=${pelnora.rightTeamCount}`);
      console.log(`   Carry forward: Left=₹${pelnora.leftCarryForward}, Right=₹${pelnora.rightCarryForward}`);
    }

    // 4. Test auto pool system (₹500 entry per ₹10,000 earnings)
    console.log('\n4. Testing Auto Pool System (₹500 entry per ₹10,000 total earnings)');
    
    if (pelnora) {
      const totalEarnings = pelnoraEarnings.reduce((sum, earning) => {
        return sum + parseFloat(earning.amount);
      }, 0);
      
      console.log(`   Total earnings for Pelnora: ₹${totalEarnings.toFixed(2)}`);
      console.log(`   Expected auto pool entries: ${Math.floor(totalEarnings / 10000)}`);
      
      const autoPoolDeductions = pelnoraEarnings.filter(e => 
        e.earningType === 'autopool' && parseFloat(e.amount) < 0
      );
      
      console.log(`   Auto pool deductions: ${autoPoolDeductions.length} entries`);
      autoPoolDeductions.forEach(deduction => {
        console.log(`     ₹${deduction.amount} - ${deduction.description}`);
      });
    }

    console.log('\n✅ Earnings system test completed');

  } catch (error) {
    console.error('❌ Error testing earnings system:', error);
  }
}

testEarningsSystem();