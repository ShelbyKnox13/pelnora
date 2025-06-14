import { db } from './db';
import { 
  users, type User, type InsertUser,
  packages, type Package, type InsertPackage,
  emiPayments, type EMIPayment, type InsertEMIPayment,
  binaryStructure, type BinaryStructure, type InsertBinaryStructure,
  earnings, type Earning, type InsertEarning,
  withdrawals, type Withdrawal, type InsertWithdrawal,
  autoPool, type AutoPool, type InsertAutoPool,
  transactions, type Transaction, type InsertTransaction
} from "../shared/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import crypto from 'crypto';
import { IStorage } from './storage';
import { schema } from '../shared/schema';

export class PostgresStorage implements IStorage {
  // Generate a unique referral ID
  private generateReferralId(): string {
    return 'PEL' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0];
  }

  async getUserByReferralId(referralId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.referralId, referralId));
    return result[0];
  }

  async createUser(userData: InsertUser, referredById?: number, placementPosition?: string): Promise<User> {
    try {
      console.log('Starting user creation in storage');
      const referralId = this.generateReferralId();
      const now = new Date();
      
      // Compose the full user object for insertion (only fields that exist in schema)
      const insertObj = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        password: userData.password,
        referralId: referralId,
        referredBy: referredById ?? userData.referredBy ?? null,
        role: userData.role ?? 'user',
        isActive: true,
        leftTeamCount: 0,
        rightTeamCount: 0,
        leftCarryForward: '0',
        rightCarryForward: '0',
        totalEarnings: '0',
        withdrawableAmount: '0',
        bankName: null,
        accountNumber: null,
        ifscCode: null,
        panNumber: null,
        idProofType: null,
        idProofNumber: null,
        panCardImage: null,
        idProofImage: null,
        kycStatus: 'not_submitted',
        kycRejectionReason: null,
        unlockedLevels: 0,
        autoPoolEligible: false,
        createdAt: now
      };
      
      const [user] = await db.insert(users).values(insertObj).returning();
      if (!user) {
        throw new Error('Failed to create user - no user returned from database');
      }
      console.log('User created successfully in storage:', { id: user.id, email: user.email });
      
      // If this user was referred, update the referrer's level access and binary structure
      if (referredById) {
        const referrer = await this.getUser(referredById);
        if (referrer) {
          console.log(`Setting up binary structure for ${user.name} under referrer ${referrer.name}`);
          
          // Add 2 more levels for each direct referral
          const newLevels = referrer.unlockedLevels + 2;
          await this.updateUser(referredById, { 
            unlockedLevels: Math.min(newLevels, 20) // Max 20 levels
          });
          
          // Create binary structure entry for this user
          const position = placementPosition === "right" ? "right" : "left"; // Default to left if not specified
          
          // Create binary structure entry
          await this.createBinaryStructure({
            userId: user.id,
            parentId: referredById,
            position: position,
            level: 1,
          });
          
          // Update referrer's team count
          if (position === "left") {
            await this.updateUser(referredById, { 
              leftTeamCount: referrer.leftTeamCount + 1 
            });
            console.log(`Updated ${referrer.name}'s left team count to ${referrer.leftTeamCount + 1}`);
          } else {
            await this.updateUser(referredById, { 
              rightTeamCount: referrer.rightTeamCount + 1 
            });
            console.log(`Updated ${referrer.name}'s right team count to ${referrer.rightTeamCount + 1}`);
          }
        }
      }
      
      return user;
    } catch (error) {
      console.error('Error in createUser:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw new Error('Failed to create user: Unknown error');
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set(data)
      .where(eq(users.id, id))
      .returning();
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async updateUserEarnings(id: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const currentEarnings = parseFloat(user.totalEarnings);
    const updatedEarnings = (currentEarnings + amount).toFixed(2);
    
    // If total earnings exceed 10,000, make user eligible for auto pool
    const autoPoolEligible = parseFloat(updatedEarnings) >= 10000;
    
    const [updatedUser] = await db.update(users)
      .set({ 
        totalEarnings: updatedEarnings,
        withdrawableAmount: (parseFloat(user.withdrawableAmount) + amount).toFixed(2),
        autoPoolEligible: user.autoPoolEligible || autoPoolEligible
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  async getUserCount(): Promise<number> {
    const result = await db.select({ count: sql`count(*)` }).from(users);
    return Number(result[0].count);
  }

  async getAdminUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, 'admin'));
  }

  // KYC operations
  async updateUserKYC(data: {
    userId: number;
    panNumber: string;
    idProofType: string;
    idProofNumber: string;
    panCardImage: string;
    idProofImage: string;
    kycStatus: string;
  }): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({
        panNumber: data.panNumber,
        idProofType: data.idProofType,
        idProofNumber: data.idProofNumber,
        panCardImage: data.panCardImage,
        idProofImage: data.idProofImage,
        kycStatus: data.kycStatus as any,
      })
      .where(eq(users.id, data.userId))
      .returning();
    return updatedUser;
  }

  async updateUserKYCStatus(data: {
    userId: number;
    kycStatus: string;
    kycRejectionReason: string | null;
  }): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({
        kycStatus: data.kycStatus as any,
        kycRejectionReason: data.kycRejectionReason,
      })
      .where(eq(users.id, data.userId))
      .returning();
    return updatedUser;
  }

  async getKYCRequests(status?: string): Promise<any[]> {
    let query = db.select().from(users);
    if (status) {
      query = query.where(eq(users.kycStatus, status as any));
    }
    return await query;
  }

  async createNotification(data: {
    userId: number;
    type: string;
    message: string;
  }): Promise<any> {
    // For now, just return the data as notifications table doesn't exist yet
    return data;
  }

  // Binary structure operations
  async createBinaryStructure(data: InsertBinaryStructure): Promise<BinaryStructure> {
    const [result] = await db.insert(binaryStructure).values(data).returning();
    return result;
  }

  async getBinaryStructureByUserId(userId: number): Promise<BinaryStructure | undefined> {
    const result = await db.select().from(binaryStructure).where(eq(binaryStructure.userId, userId));
    return result[0];
  }

  async getUsersBinaryDownline(userId: number): Promise<BinaryStructure[]> {
    return await db.select().from(binaryStructure).where(eq(binaryStructure.parentId, userId));
  }

  async getAllBinaryStructures(): Promise<BinaryStructure[]> {
    return await db.select().from(binaryStructure);
  }

  async getBinaryBusinessInfo(userId: number): Promise<{ leftTeamBusiness: string, rightTeamBusiness: string, leftCarryForward: string, rightCarryForward: string }> {
    const user = await this.getUser(userId);
    if (!user) {
      return { leftTeamBusiness: '0', rightTeamBusiness: '0', leftCarryForward: '0', rightCarryForward: '0' };
    }
    
    // Get all binary structures to calculate the complete downline
    const allBinaryStructures = await db.select().from(binaryStructure) as BinaryStructure[];
    const allUsers = await db.select().from(users) as User[];
    
    // Recursively find all users in a position (left or right) including their downlines
    const getCompleteTeam = (rootUserId: number, position: string): number[] => {
      const result: number[] = [];
      
      // Get direct children in the specified position
      const directChildren = allBinaryStructures
        .filter(bs => bs.parentId === rootUserId && bs.position === position)
        .map(bs => bs.userId);
      
      // Add direct children to result
      result.push(...directChildren);
      
      // For each direct child, get their entire downline (both left and right)
      for (const childId of directChildren) {
        const getAllDownline = (parentId: number): number[] => {
          const children = allBinaryStructures
            .filter(bs => bs.parentId === parentId)
            .map(bs => bs.userId);
          
          let allChildren = [...children];
          for (const child of children) {
            allChildren.push(...getAllDownline(child));
          }
          return allChildren;
        };
        
        result.push(...getAllDownline(childId));
      }
      
      return [...new Set(result)]; // Remove duplicates
    };
    
    // Get complete left and right teams
    const leftTeamUserIds = getCompleteTeam(userId, 'left');
    const rightTeamUserIds = getCompleteTeam(userId, 'right');
    
    console.log(`🔍 User ${user.name} (ID: ${userId}) team analysis:`);
    console.log(`   Left team user IDs: [${leftTeamUserIds.join(', ')}]`);
    console.log(`   Right team user IDs: [${rightTeamUserIds.join(', ')}]`);
    
    const leftTeamUsers = allUsers.filter(u => leftTeamUserIds.includes(u.id));
    const rightTeamUsers = allUsers.filter(u => rightTeamUserIds.includes(u.id));
    
    // Calculate total business volume for each team (current business, not including carry forward)
    let leftTeamBusiness = 0;
    let rightTeamBusiness = 0;
    
    // Calculate left team business
    console.log(`📊 Calculating left team business:`);
    console.log(`   Left team users found: ${leftTeamUsers.length}`);
    for (const leftUser of leftTeamUsers) {
      console.log(`   Checking user: ${leftUser.name} (ID: ${leftUser.id})`);
      const userPackage = await this.getPackageByUserId(leftUser.id);
      if (userPackage) {
        const packageValue = parseFloat(userPackage.monthlyAmount);
        leftTeamBusiness += packageValue;
        console.log(`   ✅ Added ₹${packageValue} from ${leftUser.name}'s ${userPackage.packageType} package`);
      } else {
        console.log(`   ❌ No package found for ${leftUser.name} (ID: ${leftUser.id})`);
      }
    }
    
    // Calculate right team business
    console.log(`📊 Calculating right team business:`);
    console.log(`   Right team users found: ${rightTeamUsers.length}`);
    for (const rightUser of rightTeamUsers) {
      console.log(`   Checking user: ${rightUser.name} (ID: ${rightUser.id})`);
      const userPackage = await this.getPackageByUserId(rightUser.id);
      if (userPackage) {
        const packageValue = parseFloat(userPackage.monthlyAmount);
        rightTeamBusiness += packageValue;
        console.log(`   ✅ Added ₹${packageValue} from ${rightUser.name}'s ${userPackage.packageType} package`);
      } else {
        console.log(`   ❌ No package found for ${rightUser.name} (ID: ${rightUser.id})`);
      }
    }

    // Get current carry forward values
    const leftCarryForward = user.leftCarryForward || "0";
    const rightCarryForward = user.rightCarryForward || "0";

    console.log(`📈 Final calculation for ${user.name}:`);
    console.log(`   Current business - Left: ₹${leftTeamBusiness}, Right: ₹${rightTeamBusiness}`);
    console.log(`   Carry forward - Left: ₹${leftCarryForward}, Right: ₹${rightCarryForward}`);
    
    // For binary income calculation, we need to show the total accumulated business
    // The carry forward should include all unmatched business
    const totalLeftBusiness = parseFloat(leftCarryForward) + leftTeamBusiness;
    const totalRightBusiness = parseFloat(rightCarryForward) + rightTeamBusiness;
    console.log(`   Total accumulated business - Left: ₹${totalLeftBusiness}, Right: ₹${totalRightBusiness}`);
    
    
    return {
      leftTeamBusiness: leftTeamBusiness.toString(),
      rightTeamBusiness: rightTeamBusiness.toString(),
      leftCarryForward: totalLeftBusiness.toString(), // Show total accumulated business
      rightCarryForward: totalRightBusiness.toString() // Show total accumulated business
    };
  }

  // Package operations
  async createPackage(packageData: InsertPackage): Promise<Package> {
    const [pkg] = await db.insert(packages).values(packageData).returning();
    
    console.log(`📦 PACKAGE CREATED: User ID ${packageData.userId}, Package Type: ${packageData.packageType}, Amount: ${packageData.monthlyAmount}`);
    
    // Calculate and distribute real earnings when package is purchased
    await this.calculateRealEarnings(packageData.userId, pkg);
    
    return pkg;
  }

  async getPackageByUserId(userId: number): Promise<Package | undefined> {
    const result = await db.select().from(packages).where(eq(packages.userId, userId));
    return result[0];
  }

  async getUserPackage(userId: number): Promise<Package | undefined> {
    return this.getPackageByUserId(userId);
  }

  async updatePackage(id: number, data: Partial<Package>): Promise<Package | undefined> {
    const [updatedPackage] = await db.update(packages)
      .set(data)
      .where(eq(packages.id, id))
      .returning();
    return updatedPackage;
  }

  async getAllPackages(): Promise<Package[]> {
    return await db.select().from(packages);
  }

  // EMI operations
  async createEMIPayment(emiData: InsertEMIPayment): Promise<EMIPayment> {
    const [newEMIPayment] = await db.insert(emiPayments).values(emiData).returning();
    return newEMIPayment;
  }

  async getEMIPaymentsByUserId(userId: number): Promise<EMIPayment[]> {
    return await db.select().from(emiPayments).where(eq(emiPayments.userId, userId));
  }

  async getEMIPaymentsByPackageId(packageId: number): Promise<EMIPayment[]> {
    return await db.select().from(emiPayments).where(eq(emiPayments.packageId, packageId));
  }

  async getAllEMIPayments(): Promise<EMIPayment[]> {
    return await db.select().from(emiPayments);
  }

  // Earnings operations
  async createEarning(earningData: InsertEarning): Promise<Earning> {
    const [newEarning] = await db.insert(earnings).values(earningData).returning();
    return newEarning;
  }

  async getEarningsByUserId(userId: number): Promise<Earning[]> {
    return await db.select()
      .from(earnings)
      .where(eq(earnings.userId, userId))
      .orderBy(desc(earnings.createdAt));
  }

  async getUserEarnings(userId: number): Promise<Earning[]> {
    return this.getEarningsByUserId(userId);
  }

  async getAllEarnings(): Promise<Earning[]> {
    return await db.select().from(earnings);
  }

  // Withdrawal operations
  async createWithdrawal(withdrawalData: InsertWithdrawal): Promise<Withdrawal> {
    const [newWithdrawal] = await db.insert(withdrawals).values(withdrawalData).returning();
    return newWithdrawal;
  }

  async getWithdrawalsByUserId(userId: number): Promise<Withdrawal[]> {
    return await db.select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, userId))
      .orderBy(desc(withdrawals.requestDate));
  }

  async updateWithdrawal(id: number, data: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const [updatedWithdrawal] = await db.update(withdrawals)
      .set(data)
      .where(eq(withdrawals.id, id))
      .returning();
    return updatedWithdrawal;
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return await db.select().from(withdrawals);
  }

  // Auto pool operations
  async createAutoPoolEntry(data: InsertAutoPool): Promise<AutoPool> {
    const [newAutoPool] = await db.insert(autoPool).values(data).returning();
    return newAutoPool;
  }

  async getAutoPoolEntriesByUserId(userId: number): Promise<AutoPool[]> {
    return await db.select().from(autoPool).where(eq(autoPool.userId, userId));
  }

  async getAutoPoolMatrix(): Promise<AutoPool[]> {
    return await db.select().from(autoPool);
  }

  // Transaction operations
  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db.insert(transactions).values(data).returning();
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return await db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  // Level structure operations
  async getUsersAtLevel(userId: number, level: number): Promise<User[]> {
    // This is a placeholder implementation
    // In a real implementation, you would need to traverse the referral tree
    return [];
  }

  async calculateLevelEarnings(userId: number): Promise<any[]> {
    // This is a placeholder implementation
    return [];
  }

  // Real earnings calculation when package is purchased
  async calculateRealEarnings(buyerUserId: number, packagePurchased: Package): Promise<void> {
    console.log(`🔄 Calculating real earnings for package purchase by user ${buyerUserId}`);
    
    const buyer = await this.getUser(buyerUserId);
    if (!buyer) {
      console.log(`❌ Buyer user ${buyerUserId} not found`);
      return;
    }

    const monthlyAmount = parseFloat(packagePurchased.monthlyAmount);
    const totalPackageValue = monthlyAmount * packagePurchased.totalMonths;
    console.log(`📊 Package purchased: ${packagePurchased.packageType} - Monthly: ₹${monthlyAmount}, Total: ₹${totalPackageValue}`);

    // 1. DIRECT INCOME: 5% of monthly amount (one-time payment at signup)
    if (buyer.referredBy) {
      const referrer = await this.getUser(buyer.referredBy);
      if (referrer) {
        const directIncome = monthlyAmount * 0.05; // 5% of monthly amount only
        
        console.log(`💰 Creating direct income: ₹${directIncome} for ${referrer.name} (ID: ${referrer.id})`);
        
        await this.createEarning({
          userId: referrer.id,
          amount: directIncome.toString(),
          earningType: 'direct',
          description: `Direct income: 5% of ${buyer.name}'s ${packagePurchased.packageType} package (₹${monthlyAmount}/month)`,
          relatedUserId: buyer.id,
        });
        
        await this.updateUserEarnings(referrer.id, directIncome);
        console.log(`✅ Direct income: ₹${directIncome} paid to ${referrer.name} (ID: ${referrer.id})`);
        
        // 2. BINARY INCOME: Calculate binary income for entire upline
        await this.calculateUplineBinaryIncome(buyer.id, monthlyAmount);
        
        // 3. LEVEL INCOME: Distribute to upline levels
        await this.calculateLevelIncome(buyerUserId, monthlyAmount);
      }
    } else {
      console.log(`ℹ️ User ${buyer.name} has no referrer, skipping earnings calculation`);
    }
  }

  // Calculate level income distribution based on actual percentages
  async calculateLevelIncome(buyerUserId: number, monthlyAmount: number): Promise<void> {
    console.log(`🎯 Calculating level income for buyer ${buyerUserId} with package amount: ₹${monthlyAmount}`);
    
    // Level income percentages (updated per requirements)
    const levelPercentages = [
      0.15, // Level 1: 15%
      0.10, // Level 2: 10%
      0.05, // Level 3: 5%
      0.03, 0.03, 0.03, 0.03, 0.03, // Levels 4-8: 3% each
      0.02, 0.02, 0.02, 0.02, 0.02, 0.02, // Levels 9-14: 2% each
      0.01, 0.01, 0.01, 0.01, 0.01, 0.01  // Levels 15-20: 1% each
    ];

    const directIncome = monthlyAmount * 0.05; // 5% direct income base
    const allUsers = await this.getAllUsers();
    
    // Find the buyer's direct referrer first
    const buyerUser = await this.getUser(buyerUserId);
    if (!buyerUser || !buyerUser.referredBy) {
      console.log(`ℹ️ No direct referrer found for user ${buyerUserId}. Skipping level income.`);
      return;
    }
    
    // Get the direct referrer
    const directReferrerId = buyerUser.referredBy;
    const directReferrer = await this.getUser(directReferrerId);
    if (!directReferrer) {
      console.log(`❌ Direct referrer with ID ${directReferrerId} not found. Skipping level income.`);
      return;
    }
    
    console.log(`👤 Buyer's direct referrer is ${directReferrer.name} (ID: ${directReferrerId})`);
    
    // Skip level income for direct referrer (they already got direct income)
    console.log(`⏭️ Skipping level income for direct referrer ${directReferrer.name}`);
    
    // Calculate level income for everyone else in the upline chain starting from the direct referrer's referrer
    let currentReferrerId = directReferrer.referredBy;
    let currentLevel = 1; // Start at level 1 for the direct referrer's referrer
    
    while (currentReferrerId && currentLevel <= 20) {
      const uplineUser = await this.getUser(currentReferrerId);
      if (!uplineUser) break;
      
      // Check if this upline user has unlocked this level based on their direct referrals
      const directReferralCount = allUsers.filter(u => u.referredBy === uplineUser.id).length;
      const unlockedLevels = directReferralCount * 2;
      
      if (currentLevel <= unlockedLevels) {
        // Calculate level income
        const levelIncome = directIncome * levelPercentages[currentLevel - 1];
        
        if (levelIncome > 0) {
          console.log(`💎 Creating level ${currentLevel} income: ₹${levelIncome.toFixed(2)} for ${uplineUser.name} (ID: ${uplineUser.id})`);
          
          // Create level income for this upline user
          await this.createEarning({
            userId: uplineUser.id,
            amount: levelIncome.toString(),
            earningType: 'level',
            description: `Level ${currentLevel} income: ${(levelPercentages[currentLevel - 1] * 100).toFixed(0)}% from ${buyerUser.name}'s package (₹${monthlyAmount})`,
            relatedUserId: buyerUserId,
          });
          
          await this.updateUserEarnings(uplineUser.id, levelIncome);
          console.log(`✅ Level ${currentLevel} income: ₹${levelIncome.toFixed(2)} (${(levelPercentages[currentLevel - 1] * 100).toFixed(0)}%) paid to ${uplineUser.name} (ID: ${uplineUser.id})`);
        }
      } else {
        console.log(`🔒 Level ${currentLevel} locked for user ${uplineUser.id} (${uplineUser.name}). Needs ${Math.ceil(currentLevel / 2)} direct referrals, has ${directReferralCount}`);
      }
      
      // Move up to the next person in the upline
      currentReferrerId = uplineUser.referredBy;
      currentLevel++;
    }
  }

  // Calculate binary income for entire upline when a new package is purchased
  async calculateUplineBinaryIncome(newMemberUserId: number, newMemberPackageAmount: number): Promise<void> {
    console.log(`🔄 Calculating upline binary income for new member ${newMemberUserId} with package amount: ₹${newMemberPackageAmount}`);
    
    // Get the new member to find their referrer
    const newMember = await this.getUser(newMemberUserId);
    if (!newMember || !newMember.referredBy) {
      console.log(`❌ New member ${newMemberUserId} has no referrer, skipping binary income calculation`);
      return;
    }
    
    // Start from the direct referrer and go up the chain
    let currentUserId = newMember.referredBy;
    let level = 0;
    
    while (currentUserId && level < 20) { // Limit to prevent infinite loops
      await this.calculateBinaryIncome(currentUserId, newMemberPackageAmount, newMemberUserId);
      
      // Move to the next upline user
      const currentUser = await this.getUser(currentUserId);
      if (!currentUser || !currentUser.referredBy) break;
      
      currentUserId = currentUser.referredBy;
      level++;
    }
  }

  // Calculate binary income for a specific user with proper 2:1 or 1:2 matching and carry forward
  async calculateBinaryIncome(userId: number, newMemberPackageAmount: number, newMemberUserId?: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    console.log(`🎯 Calculating binary income for user ${userId} (${user.name}) with new member package amount: ₹${newMemberPackageAmount}`);

    // First, update carry forward with new business
    await this.updateCarryForwardWithNewBusiness(userId, newMemberPackageAmount, newMemberUserId);

    // Get updated business info after adding new business to carry forward
    const businessInfo = await this.getBinaryBusinessInfo(userId);
    let leftCarryForward = parseFloat(businessInfo.leftCarryForward);
    let rightCarryForward = parseFloat(businessInfo.rightCarryForward);

    console.log(`📦 Total carry forward after new business - Left: ₹${leftCarryForward}, Right: ₹${rightCarryForward}`);

    // Check for binary matching (2:1 or 1:2 ratio)
    const minBusiness = Math.min(leftCarryForward, rightCarryForward);
    const maxBusiness = Math.max(leftCarryForward, rightCarryForward);

    // Binary income is 10% of the smaller side when there's a 2:1 or 1:2 match
    if (minBusiness > 0 && maxBusiness >= minBusiness * 2) {
      const binaryIncome = minBusiness * 0.10; // 10% of smaller side
      
      if (binaryIncome > 0) {
        console.log(`💰 Binary matching achieved! Smaller side: ₹${minBusiness}, Binary income: ₹${binaryIncome}`);
        
        // Create binary income earning
        await this.createEarning({
          userId: user.id,
          amount: binaryIncome.toString(),
          earningType: 'binary',
          description: `Binary income: 10% of matched business (₹${minBusiness})`,
          relatedUserId: null,
        });
        
        await this.updateUserEarnings(user.id, binaryIncome);
        console.log(`✅ Binary income: ₹${binaryIncome} paid to ${user.name} (ID: ${user.id})`);

        // Update carry forward - subtract the matched amount from both sides
        const newLeftCarryForward = Math.max(0, leftCarryForward - minBusiness);
        const newRightCarryForward = Math.max(0, rightCarryForward - minBusiness);

        await this.updateUser(user.id, {
          leftCarryForward: newLeftCarryForward.toString(),
          rightCarryForward: newRightCarryForward.toString()
        });

        console.log(`📦 Updated carry forward after matching - Left: ₹${newLeftCarryForward}, Right: ₹${newRightCarryForward}`);
      }
    } else {
      console.log(`⏳ No binary matching yet. Left: ₹${leftCarryForward}, Right: ₹${rightCarryForward} (need 2:1 or 1:2 ratio)`);
    }
  }

  // Update carry forward when new business is added to a team
  async updateCarryForwardWithNewBusiness(userId: number, newBusinessAmount: number, newMemberUserId?: number): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) return;

    let sideToUpdate = 'left'; // default

    // If we have the new member's user ID, find which side they're on
    if (newMemberUserId) {
      const memberBinaryStructure = await db.select().from(binaryStructure)
        .where(eq(binaryStructure.userId, newMemberUserId));
      
      if (memberBinaryStructure.length > 0) {
        // Find the path from the new member to this user to determine which side
        const memberStructure = memberBinaryStructure[0];
        
        // Traverse up to find which side this member is on relative to userId
        let currentStructure = memberStructure;
        while (currentStructure && currentStructure.parentId !== userId) {
          const parentStructure = await db.select().from(binaryStructure)
            .where(eq(binaryStructure.userId, currentStructure.parentId));
          if (parentStructure.length > 0) {
            currentStructure = parentStructure[0];
          } else {
            break;
          }
        }
        
        if (currentStructure && currentStructure.parentId === userId) {
          sideToUpdate = currentStructure.position;
        }
      }
    }
    
    const leftCarryForward = parseFloat(user.leftCarryForward || "0");
    const rightCarryForward = parseFloat(user.rightCarryForward || "0");
    
    if (sideToUpdate === 'left') {
      const newLeftCarryForward = leftCarryForward + newBusinessAmount;
      await this.updateUser(userId, {
        leftCarryForward: newLeftCarryForward.toString()
      });
      console.log(`📦 Added ₹${newBusinessAmount} to left carry forward for ${user.name}. New total: ₹${newLeftCarryForward}`);
    } else {
      const newRightCarryForward = rightCarryForward + newBusinessAmount;
      await this.updateUser(userId, {
        rightCarryForward: newRightCarryForward.toString()
      });
      console.log(`📦 Added ₹${newBusinessAmount} to right carry forward for ${user.name}. New total: ₹${newRightCarryForward}`);
    }
  }

  // User deletion methods
  async deleteUser(userId: number): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting user ${userId} and all related data`);
      
      // Delete in order to avoid foreign key constraints
      // 1. Delete earnings
      await db.delete(earnings).where(eq(earnings.userId, userId));
      console.log(`   ✅ Deleted earnings for user ${userId}`);
      
      // 2. Delete withdrawals
      await db.delete(withdrawals).where(eq(withdrawals.userId, userId));
      console.log(`   ✅ Deleted withdrawals for user ${userId}`);
      
      // 3. Delete EMI payments
      await db.delete(emiPayments).where(eq(emiPayments.userId, userId));
      console.log(`   ✅ Deleted EMI payments for user ${userId}`);
      
      // 4. Delete packages
      await db.delete(packages).where(eq(packages.userId, userId));
      console.log(`   ✅ Deleted packages for user ${userId}`);
      
      // 5. Delete binary structure records
      await db.delete(binaryStructure).where(eq(binaryStructure.userId, userId));
      await db.delete(binaryStructure).where(eq(binaryStructure.parentId, userId));
      console.log(`   ✅ Deleted binary structure for user ${userId}`);
      
      // 6. Update referral relationships (set referredBy to null for users referred by this user)
      await db.update(users)
        .set({ referredBy: null })
        .where(eq(users.referredBy, userId));
      console.log(`   ✅ Updated referral relationships for user ${userId}`);
      
      // 7. Finally delete the user
      const result = await db.delete(users).where(eq(users.id, userId));
      console.log(`   ✅ Deleted user ${userId}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Error deleting user ${userId}:`, error);
      return false;
    }
  }

  async deleteEarningsByUserId(userId: number): Promise<number> {
    try {
      const userEarnings = await this.getEarningsByUserId(userId);
      const count = userEarnings.length;
      
      await db.delete(earnings).where(eq(earnings.userId, userId));
      console.log(`   ✅ Deleted ${count} earnings records for user ${userId}`);
      
      return count;
    } catch (error) {
      console.error(`❌ Error deleting earnings for user ${userId}:`, error);
      return 0;
    }
  }

  // User management operations
  async deactivateUser(userId: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ isActive: false })
      .where(eq(users.id, userId))
      .returning();
    
    if (updatedUser) {
      console.log(`User ${updatedUser.name} (ID: ${userId}) has been deactivated`);
    }
    
    return updatedUser;
  }

  async activateUser(userId: number): Promise<User | undefined> {
    const [updatedUser] = await db.update(users)
      .set({ isActive: true })
      .where(eq(users.id, userId))
      .returning();
    
    if (updatedUser) {
      console.log(`User ${updatedUser.name} (ID: ${userId}) has been activated`);
    }
    
    return updatedUser;
  }

  async deleteUserPermanently(userId: number, deletedByAdminId: number): Promise<{
    success: boolean;
    message: string;
    orphanedUsers?: User[];
    reassignedUsers?: { userId: number; newParentId: number; position: string }[];
  }> {
    try {
      const userToDelete = await this.getUser(userId);
      if (!userToDelete) {
        return { success: false, message: "User not found" };
      }

      // Prevent deletion of admin users
      if (userToDelete.role === 'admin') {
        return { success: false, message: "Cannot delete admin users" };
      }

      console.log(`Starting permanent deletion of user: ${userToDelete.name} (ID: ${userId})`);

      // Log the deletion activity
      const deletionLog = {
        deletedUserId: userId,
        deletedUserName: userToDelete.name,
        deletedByAdminId,
        timestamp: new Date(),
        action: 'USER_DELETED_PERMANENTLY'
      };
      console.log('Deletion Log:', deletionLog);

      // Get user's binary structure
      const userBinaryStructure = await this.getBinaryStructureByUserId(userId);
      
      // Find all users in the deleted user's downline (left and right)
      const allBinaryStructures = await this.getAllBinaryStructures();
      const leftDownline = this.getCompleteDownline(userId, 'left', allBinaryStructures);
      const rightDownline = this.getCompleteDownline(userId, 'right', allBinaryStructures);
      
      const reassignedUsers: { userId: number; newParentId: number; position: string }[] = [];
      const orphanedUsers: User[] = [];

      // Handle reassignment logic
      if (userBinaryStructure && userBinaryStructure.parentId) {
        // User has an upline - reassign downline to the upline
        const uplineId = userBinaryStructure.parentId;
        const deletedUserPosition = userBinaryStructure.position;

        console.log(`Reassigning downline to upline ${uplineId} in position ${deletedUserPosition}`);

        // Reassign left downline
        if (leftDownline.length > 0) {
          const primaryLeftUser = leftDownline[0];
          await this.updateBinaryStructure(primaryLeftUser, uplineId, deletedUserPosition);
          reassignedUsers.push({ userId: primaryLeftUser, newParentId: uplineId, position: deletedUserPosition });
          
          // Reassign remaining left users under the primary left user
          for (let i = 1; i < leftDownline.length; i++) {
            await this.updateBinaryStructure(leftDownline[i], primaryLeftUser, 'left');
            reassignedUsers.push({ userId: leftDownline[i], newParentId: primaryLeftUser, position: 'left' });
          }
        }

        // Reassign right downline
        if (rightDownline.length > 0) {
          const primaryRightUser = rightDownline[0];
          
          // If left downline was reassigned to the deleted user's position, put right downline on the opposite side
          const rightPosition = leftDownline.length > 0 ? (deletedUserPosition === 'left' ? 'right' : 'left') : deletedUserPosition;
          
          await this.updateBinaryStructure(primaryRightUser, uplineId, rightPosition);
          reassignedUsers.push({ userId: primaryRightUser, newParentId: uplineId, position: rightPosition });
          
          // Reassign remaining right users under the primary right user
          for (let i = 1; i < rightDownline.length; i++) {
            await this.updateBinaryStructure(rightDownline[i], primaryRightUser, 'right');
            reassignedUsers.push({ userId: rightDownline[i], newParentId: primaryRightUser, position: 'right' });
          }
        }

        // Update upline's team counts
        await this.recalculateTeamCounts(uplineId);
      } else {
        // User has no upline - downline becomes orphaned
        console.log(`User ${userId} has no upline, downline will be orphaned`);
        
        for (const downlineUserId of [...leftDownline, ...rightDownline]) {
          const downlineUser = await this.getUser(downlineUserId);
          if (downlineUser) {
            orphanedUsers.push(downlineUser);
            // Remove binary structure for orphaned users
            await db.delete(binaryStructure).where(eq(binaryStructure.userId, downlineUserId));
          }
        }
      }

      // Delete all related records in the correct order to avoid foreign key constraint violations
      
      // 1. Delete earnings records first (they reference users)
      const userEarnings = await this.getEarningsByUserId(userId);
      console.log(`   Deleting ${userEarnings.length} earnings records for user ${userId}`);
      await db.delete(earnings).where(eq(earnings.userId, userId));

      // 2. Delete earnings where this user was the related user
      const relatedEarnings = await db.select().from(earnings).where(eq(earnings.relatedUserId, userId));
      console.log(`   Deleting ${relatedEarnings.length} related earnings records for user ${userId}`);
      await db.delete(earnings).where(eq(earnings.relatedUserId, userId));

      // 3. Delete EMI payments (they reference both packages and users)
      const userEMIPayments = await db.select().from(emiPayments).where(eq(emiPayments.userId, userId));
      console.log(`   Deleting ${userEMIPayments.length} EMI payment records for user ${userId}`);
      await db.delete(emiPayments).where(eq(emiPayments.userId, userId));

      // 4. Delete packages (they reference users)
      const userPackages = await db.select().from(packages).where(eq(packages.userId, userId));
      console.log(`   Deleting ${userPackages.length} package records for user ${userId}`);
      await db.delete(packages).where(eq(packages.userId, userId));

      // 5. Delete withdrawals (they reference users)
      const userWithdrawals = await db.select().from(withdrawals).where(eq(withdrawals.userId, userId));
      console.log(`   Deleting ${userWithdrawals.length} withdrawal records for user ${userId}`);
      await db.delete(withdrawals).where(eq(withdrawals.userId, userId));

      // 6. Delete transactions (they reference users)
      const userTransactions = await db.select().from(transactions).where(eq(transactions.userId, userId));
      console.log(`   Deleting ${userTransactions.length} transaction records for user ${userId}`);
      await db.delete(transactions).where(eq(transactions.userId, userId));

      // 7. Delete auto pool entries (they reference users)
      const userAutoPoolEntries = await db.select().from(autoPool).where(eq(autoPool.userId, userId));
      console.log(`   Deleting ${userAutoPoolEntries.length} auto pool records for user ${userId}`);
      await db.delete(autoPool).where(eq(autoPool.userId, userId));

      // 8. Update binary structures where this user is a parent (set parentId to null or reassign)
      const childBinaryStructures = await db.select().from(binaryStructure).where(eq(binaryStructure.parentId, userId));
      console.log(`   Updating ${childBinaryStructures.length} child binary structures for user ${userId}`);
      // This is handled by the reassignment logic above, but we need to make sure orphaned ones are handled
      
      // 9. Remove user's own binary structure
      if (userBinaryStructure) {
        console.log(`   Deleting binary structure for user ${userId}`);
        await db.delete(binaryStructure).where(eq(binaryStructure.id, userBinaryStructure.id));
      }

      // 10. Update users table where this user is referenced as referredBy (set to null)
      const referredUsers = await db.select().from(users).where(eq(users.referredBy, userId));
      console.log(`   Updating ${referredUsers.length} users who were referred by user ${userId}`);
      await db.update(users)
        .set({ referredBy: null })
        .where(eq(users.referredBy, userId));

      // 11. Finally, delete the user
      console.log(`   Deleting user ${userId}`);
      await db.delete(users).where(eq(users.id, userId));

      // Comprehensive recalculation for all affected users
      console.log(`🔄 Starting targeted recalculation after deletion`);
      
      // Get fresh data after deletion
      const allUsersAfterDeletion = await this.getAllUsers();
      const allBinaryStructuresAfterDeletion = await this.getAllBinaryStructures();
      const allPackagesAfterDeletion = await this.getAllPackages();
      
      // Collect all users that need recalculation
      const usersToRecalculate = new Set<number>();
      
      // Add the parent (if exists)
      if (userBinaryStructure && userBinaryStructure.parentId) {
        usersToRecalculate.add(userBinaryStructure.parentId);
      }
      
      // Add all reassigned users and their new parents
      for (const reassignment of reassignedUsers) {
        usersToRecalculate.add(reassignment.newParentId);
        usersToRecalculate.add(reassignment.userId);
      }
      
      // Add all users in the upline chain from the deletion point
      let currentParentId = userBinaryStructure?.parentId;
      while (currentParentId) {
        usersToRecalculate.add(currentParentId);
        const parentBinaryStruct = allBinaryStructuresAfterDeletion.find(bs => bs.userId === currentParentId);
        currentParentId = parentBinaryStruct?.parentId;
      }
      
      console.log(`🔄 Recalculating ${usersToRecalculate.size} affected users: [${Array.from(usersToRecalculate).join(', ')}]`);
      
      // Recalculate each affected user
      for (const userIdToRecalc of usersToRecalculate) {
        await this.recalculateUserStats(
          userIdToRecalc,
          allUsersAfterDeletion,
          allBinaryStructuresAfterDeletion,
          allPackagesAfterDeletion
        );
      }

      console.log(`User ${userToDelete.name} (ID: ${userId}) has been permanently deleted`);
      console.log(`Reassigned ${reassignedUsers.length} users, orphaned ${orphanedUsers.length} users`);
      console.log(`✅ All recalculations completed`);

      return {
        success: true,
        message: `User ${userToDelete.name} has been permanently deleted`,
        orphanedUsers,
        reassignedUsers
      };
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      return {
        success: false,
        message: `Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Helper method to get complete downline for a user
  private getCompleteDownline(userId: number, position: string, allBinaryStructures: BinaryStructure[]): number[] {
    const directChildren = allBinaryStructures
      .filter(bs => bs.parentId === userId && bs.position === position)
      .map(bs => bs.userId);

    let allDownline = [...directChildren];

    for (const childId of directChildren) {
      const leftDownline = this.getCompleteDownline(childId, 'left', allBinaryStructures);
      const rightDownline = this.getCompleteDownline(childId, 'right', allBinaryStructures);
      allDownline = [...allDownline, ...leftDownline, ...rightDownline];
    }

    return Array.from(new Set(allDownline)); // Remove duplicates
  }

  // Helper method to update binary structure
  private async updateBinaryStructure(userId: number, newParentId: number, position: string): Promise<void> {
    await db.update(binaryStructure)
      .set({
        parentId: newParentId,
        position: position
      })
      .where(eq(binaryStructure.userId, userId));
  }

  // Helper method to recalculate team counts for a user
  private async recalculateTeamCounts(userId: number): Promise<void> {
    const allBinaryStructures = await this.getAllBinaryStructures();
    const leftTeam = this.getCompleteDownline(userId, 'left', allBinaryStructures);
    const rightTeam = this.getCompleteDownline(userId, 'right', allBinaryStructures);

    await this.updateUser(userId, {
      leftTeamCount: leftTeam.length,
      rightTeamCount: rightTeam.length
    });
  }

  // Helper method to recalculate binary earnings for affected users
  private async recalculateBinaryEarnings(userId: number): Promise<void> {
    console.log(`🔄 Starting comprehensive recalculation for user ${userId} and upline`);
    
    try {
      // Get all users and binary structures for calculations
      const allUsers = await this.getAllUsers();
      const allBinaryStructures = await this.getAllBinaryStructures();
      const allPackages = await this.getAllPackages();
      
      // Find all users in the upline that need recalculation
      const usersToRecalculate = new Set<number>();
      usersToRecalculate.add(userId);
      
      // Add all upline users
      let currentUserId = userId;
      while (currentUserId) {
        const currentBinaryStructure = allBinaryStructures.find(bs => bs.userId === currentUserId);
        if (currentBinaryStructure && currentBinaryStructure.parentId) {
          usersToRecalculate.add(currentBinaryStructure.parentId);
          currentUserId = currentBinaryStructure.parentId;
        } else {
          break;
        }
      }
      
      console.log(`🔄 Recalculating for ${usersToRecalculate.size} users: [${Array.from(usersToRecalculate).join(', ')}]`);
      
      // Recalculate each user
      for (const userIdToRecalc of usersToRecalculate) {
        await this.recalculateUserStats(userIdToRecalc, allUsers, allBinaryStructures, allPackages);
      }
      
      console.log(`✅ Comprehensive recalculation completed`);
    } catch (error) {
      console.error('❌ Error during recalculation:', error);
    }
  }
  
  // Helper method to recalculate all stats for a single user
  private async recalculateUserStats(
    userId: number, 
    allUsers: User[], 
    allBinaryStructures: BinaryStructure[], 
    allPackages: Package[]
  ): Promise<void> {
    const user = allUsers.find(u => u.id === userId);
    if (!user) {
      console.log(`⚠️ User ${userId} not found for recalculation`);
      return;
    }
    
    console.log(`🔄 Recalculating stats for ${user.name} (ID: ${userId})`);
    
    // 1. Recalculate team counts
    const leftTeamUserIds = this.getCompleteDownline(userId, 'left', allBinaryStructures);
    const rightTeamUserIds = this.getCompleteDownline(userId, 'right', allBinaryStructures);
    
    const newLeftTeamCount = leftTeamUserIds.length;
    const newRightTeamCount = rightTeamUserIds.length;
    
    console.log(`   Team counts - Left: ${user.leftTeamCount} → ${newLeftTeamCount}, Right: ${user.rightTeamCount} → ${newRightTeamCount}`);
    
    // 2. Recalculate business volumes
    let leftTeamBusiness = 0;
    let rightTeamBusiness = 0;
    
    // Calculate left team business
    for (const leftUserId of leftTeamUserIds) {
      const userPackage = allPackages.find(p => p.userId === leftUserId);
      if (userPackage) {
        leftTeamBusiness += parseFloat(userPackage.monthlyAmount);
      }
    }
    
    // Calculate right team business
    for (const rightUserId of rightTeamUserIds) {
      const userPackage = allPackages.find(p => p.userId === rightUserId);
      if (userPackage) {
        rightTeamBusiness += parseFloat(userPackage.monthlyAmount);
      }
    }
    
    console.log(`   Business volumes - Left: ₹${leftTeamBusiness}, Right: ₹${rightTeamBusiness}`);
    
    // 3. Recalculate total earnings (sum of all valid earnings)
    const userEarnings = await this.getEarningsByUserId(userId);
    const totalEarnings = userEarnings.reduce((sum, earning) => {
      // Only count earnings that haven't been invalidated
      if (!earning.description?.includes('[INVALIDATED')) {
        return sum + parseFloat(earning.amount);
      }
      return sum;
    }, 0);
    
    console.log(`   Total earnings recalculated: ₹${totalEarnings}`);
    
    // 4. Update the user with recalculated values
    await db.update(users)
      .set({
        leftTeamCount: newLeftTeamCount,
        rightTeamCount: newRightTeamCount,
        leftCarryForward: leftTeamBusiness.toString(), // Reset to current business volume
        rightCarryForward: rightTeamBusiness.toString(), // Reset to current business volume
        totalEarnings: totalEarnings.toFixed(2),
        withdrawableAmount: totalEarnings.toFixed(2), // Assuming all earnings are withdrawable
      })
      .where(eq(users.id, userId));
    
    console.log(`✅ Updated stats for ${user.name}`);
  }

  // Demo earnings generation
  async generateDemoEarnings(userId: number): Promise<void> {
    // This is a placeholder method to prevent errors
    console.log(`Demo earnings generation for user ${userId} - not implemented yet`);
  }

  // Helper method to recalculate stats for a specific user
  private async recalculateUserStats(
    userId: number, 
    allUsers: User[], 
    allBinaryStructures: BinaryStructure[], 
    allPackages: Package[]
  ): Promise<void> {
    try {
      console.log(`🔄 Recalculating stats for user ${userId}`);
      
      // Get user's binary structure
      const userBinaryStructure = allBinaryStructures.find(bs => bs.userId === userId);
      if (!userBinaryStructure) {
        console.log(`No binary structure found for user ${userId}`);
        return;
      }
      
      // Calculate team counts
      const leftTeam = this.getTeamMembers(userId, 'left', allBinaryStructures, allUsers);
      const rightTeam = this.getTeamMembers(userId, 'right', allBinaryStructures, allUsers);
      
      // Calculate business volumes
      let leftTeamBusiness = 0;
      let rightTeamBusiness = 0;
      
      for (const member of leftTeam) {
        const memberPackage = allPackages.find(p => p.userId === member.id);
        if (memberPackage) {
          leftTeamBusiness += parseFloat(memberPackage.monthlyAmount);
        }
      }
      
      for (const member of rightTeam) {
        const memberPackage = allPackages.find(p => p.userId === member.id);
        if (memberPackage) {
          rightTeamBusiness += parseFloat(memberPackage.monthlyAmount);
        }
      }
      
      // Get current earnings (only non-invalidated ones)
      const userEarnings = await this.getEarningsByUserId(userId);
      const totalEarnings = userEarnings
        .filter(e => !e.isInvalidated)
        .reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      // Update user stats in database
      await this.db.query(`
        UPDATE users 
        SET 
          left_team_count = $1,
          right_team_count = $2,
          left_team_business = $3,
          right_team_business = $4,
          total_earnings = $5,
          withdrawable_amount = $6,
          left_carry_forward = $7,
          right_carry_forward = $8
        WHERE id = $9
      `, [
        leftTeam.length,
        rightTeam.length,
        leftTeamBusiness.toString(),
        rightTeamBusiness.toString(),
        totalEarnings.toString(),
        totalEarnings.toString(), // For now, withdrawable = total earnings
        leftTeamBusiness.toString(), // Reset carry forward to current business
        rightTeamBusiness.toString(),
        userId
      ]);
      
      console.log(`✅ Updated stats for user ${userId}: Left=${leftTeam.length}, Right=${rightTeam.length}, Earnings=₹${totalEarnings}`);
      
    } catch (error) {
      console.error(`❌ Error recalculating stats for user ${userId}:`, error);
      throw error;
    }
  }

  // Helper method to get team members recursively
  private getTeamMembers(
    userId: number, 
    side: 'left' | 'right', 
    allBinaryStructures: BinaryStructure[], 
    allUsers: User[]
  ): User[] {
    const members: User[] = [];
    
    const userStructure = allBinaryStructures.find(bs => bs.userId === userId);
    if (!userStructure) return members;
    
    const childId = side === 'left' ? userStructure.leftChildId : userStructure.rightChildId;
    if (!childId) return members;
    
    const childUser = allUsers.find(u => u.id === childId);
    if (childUser) {
      members.push(childUser);
      // Recursively get all descendants
      members.push(...this.getTeamMembers(childId, 'left', allBinaryStructures, allUsers));
      members.push(...this.getTeamMembers(childId, 'right', allBinaryStructures, allUsers));
    }
    
    return members;
  }

  // Admin method to permanently delete a user and all related data
  async deleteUserPermanently(userId: number, deletedByAdminId: number): Promise<{
    success: boolean;
    message: string;
    orphanedUsers?: User[];
    reassignedUsers?: { userId: number; newParentId: number; position: string }[];
  }> {
    try {
      console.log(`🗑️ Starting permanent deletion of user ${userId} by admin ${deletedByAdminId}`);
      
      // Get user info before deletion
      const userToDelete = await this.getUser(userId);
      if (!userToDelete) {
        return {
          success: false,
          message: "User not found"
        };
      }
      
      if (userToDelete.role === 'admin') {
        return {
          success: false,
          message: "Cannot delete admin users"
        };
      }
      
      console.log(`Deleting user: ${userToDelete.name} (${userToDelete.email})`);
      
      // Get all users and binary structures before deletion for recalculation
      const allUsers = await this.getAllUsers();
      const allBinaryStructures = await this.getAllBinaryStructures();
      
      // Find users who will be affected by this deletion (upline users)
      const affectedUserIds = new Set<number>();
      
      // Add direct upline
      const userBinaryStructure = await this.getBinaryStructureByUserId(userId);
      if (userBinaryStructure && userBinaryStructure.parentId) {
        affectedUserIds.add(userBinaryStructure.parentId);
        
        // Add all upline users
        let currentParentId = userBinaryStructure.parentId;
        while (currentParentId) {
          const parentStructure = allBinaryStructures.find(bs => bs.userId === currentParentId);
          if (parentStructure && parentStructure.parentId) {
            affectedUserIds.add(parentStructure.parentId);
            currentParentId = parentStructure.parentId;
          } else {
            break;
          }
        }
      }
      
      // Delete user's data in the correct order (respecting foreign key constraints)
      
      // 1. Delete earnings
      await this.db.query('DELETE FROM earnings WHERE user_id = $1', [userId]);
      console.log(`Deleted earnings for user ${userId}`);
      
      // 2. Delete withdrawals
      await this.db.query('DELETE FROM withdrawals WHERE user_id = $1', [userId]);
      console.log(`Deleted withdrawals for user ${userId}`);
      
      // 3. Delete EMI payments
      await this.db.query('DELETE FROM emi_payments WHERE user_id = $1', [userId]);
      console.log(`Deleted EMI payments for user ${userId}`);
      
      // 4. Delete packages
      await this.db.query('DELETE FROM packages WHERE user_id = $1', [userId]);
      console.log(`Deleted packages for user ${userId}`);
      
      // 5. Delete auto pool entries
      await this.db.query('DELETE FROM auto_pool WHERE user_id = $1', [userId]);
      console.log(`Deleted auto pool entries for user ${userId}`);
      
      // 6. Delete transactions
      await this.db.query('DELETE FROM transactions WHERE user_id = $1', [userId]);
      console.log(`Deleted transactions for user ${userId}`);
      
      // 7. Update binary structure - remove references to this user
      await this.db.query('UPDATE binary_structure SET left_child_id = NULL WHERE left_child_id = $1', [userId]);
      await this.db.query('UPDATE binary_structure SET right_child_id = NULL WHERE right_child_id = $1', [userId]);
      console.log(`Updated binary structure references for user ${userId}`);
      
      // 8. Delete user's binary structure
      await this.db.query('DELETE FROM binary_structure WHERE user_id = $1', [userId]);
      console.log(`Deleted binary structure for user ${userId}`);
      
      // 9. Update users table - remove referral references
      await this.db.query('UPDATE users SET referred_by = NULL WHERE referred_by = $1', [userId]);
      console.log(`Updated referral references for user ${userId}`);
      
      // 10. Finally delete the user
      await this.db.query('DELETE FROM users WHERE id = $1', [userId]);
      console.log(`Deleted user ${userId} from users table`);
      
      // 11. Recalculate stats for all affected users
      console.log(`Recalculating stats for ${affectedUserIds.size} affected users`);
      const allPackages = await this.getAllPackages();
      
      for (const affectedUserId of affectedUserIds) {
        try {
          await this.recalculateUserStats(affectedUserId, allUsers, allBinaryStructures, allPackages);
          console.log(`✅ Recalculated stats for user ${affectedUserId}`);
        } catch (error) {
          console.error(`❌ Error recalculating stats for user ${affectedUserId}:`, error);
        }
      }
      
      console.log(`✅ Successfully deleted user ${userToDelete.name} and recalculated affected users`);
      
      return {
        success: true,
        message: `Successfully deleted user ${userToDelete.name} and updated ${affectedUserIds.size} affected users`
      };
      
    } catch (error) {
      console.error('❌ Error during permanent user deletion:', error);
      return {
        success: false,
        message: `Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // Admin method to recalculate all user stats (for fixing data inconsistencies)
  async recalculateAllUserStats(): Promise<{ success: boolean; message: string; updatedUsers: number }> {
    try {
      console.log(`🔄 Starting full recalculation for all users`);
      
      const allUsers = await this.getAllUsers();
      const allBinaryStructures = await this.getAllBinaryStructures();
      const allPackages = await this.getAllPackages();
      
      let updatedCount = 0;
      
      for (const user of allUsers) {
        if (user.role !== 'admin') { // Skip admin users
          await this.recalculateUserStats(user.id, allUsers, allBinaryStructures, allPackages);
          updatedCount++;
        }
      }
      
      console.log(`✅ Full recalculation completed for ${updatedCount} users`);
      
      return {
        success: true,
        message: `Successfully recalculated stats for ${updatedCount} users`,
        updatedUsers: updatedCount
      };
    } catch (error) {
      console.error('❌ Error during full recalculation:', error);
      return {
        success: false,
        message: `Error during recalculation: ${error instanceof Error ? error.message : 'Unknown error'}`,
        updatedUsers: 0
      };
    }
  }

  // Get all binary structures
  async getAllBinaryStructures(): Promise<BinaryStructure[]> {
    const result = await db.select().from(binaryStructure).orderBy(binaryStructure.userId);
    return result;
  }

  // Package management methods
  async createPackage(packageData: any): Promise<Package> {
    const result = await db.insert(packages).values({
      userId: packageData.userId,
      packageType: packageData.packageType,
      monthlyAmount: packageData.monthlyAmount,
      totalMonths: packageData.totalMonths || 11,
      paidMonths: packageData.paidMonths || 0,
      isCompleted: false,
      bonusEarned: false,
      startDate: new Date(),
      nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    }).returning();
    return result[0];
  }

  async getPackageByUserId(userId: number): Promise<Package | undefined> {
    const result = await db.select().from(packages)
      .where(eq(packages.userId, userId))
      .orderBy(desc(packages.startDate))
      .limit(1);
    return result[0];
  }

  async getUserPackage(userId: number): Promise<Package | undefined> {
    return this.getPackageByUserId(userId);
  }

  async updatePackage(id: number, data: Partial<Package>): Promise<Package | undefined> {
    const result = await db.update(packages)
      .set(data)
      .where(eq(packages.id, id))
      .returning();
    return result[0];
  }

  async deletePackage(id: number): Promise<boolean> {
    try {
      console.log(`🗑️ Deleting package with ID: ${id}`);
      
      // First delete related EMI payments
      await db.delete(emiPayments).where(eq(emiPayments.packageId, id));
      console.log(`✅ Deleted related EMI payments for package ${id}`);
      
      // Then delete the package
      const result = await db.delete(packages).where(eq(packages.id, id));
      console.log(`🗑️ Delete result:`, result);
      
      // For drizzle delete operations, we need to check if any rows were affected
      return true; // If no error was thrown, deletion was successful
    } catch (error) {
      console.error('Error deleting package:', error);
      return false;
    }
  }

  async getAllPackages(): Promise<Package[]> {
    const result = await db.select().from(packages).orderBy(desc(packages.startDate));
    return result;
  }
}

// Export a singleton instance
export const storage = new PostgresStorage();