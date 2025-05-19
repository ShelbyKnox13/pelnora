import { 
  users, type User, type InsertUser,
  packages, type Package, type InsertPackage,
  emiPayments, type EMIPayment, type InsertEMIPayment,
  binaryStructure, type BinaryStructure, type InsertBinaryStructure,
  earnings, type Earning, type InsertEarning,
  withdrawals, type Withdrawal, type InsertWithdrawal,
  autoPool, type AutoPool, type InsertAutoPool,
  transactions, type Transaction, type InsertTransaction
} from "@shared/schema";
import crypto from 'crypto';

// Interface for all storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByReferralId(referralId: string): Promise<User | undefined>;
  createUser(user: InsertUser, referredById?: number): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  updateUserEarnings(id: number, amount: number): Promise<User | undefined>;
  getUserCount(): Promise<number>;
  
  // Package operations
  createPackage(packageData: InsertPackage): Promise<Package>;
  getPackageByUserId(userId: number): Promise<Package | undefined>;
  updatePackage(id: number, data: Partial<Package>): Promise<Package | undefined>;
  getAllPackages(): Promise<Package[]>;
  
  // EMI operations
  createEMIPayment(emiData: InsertEMIPayment): Promise<EMIPayment>;
  getEMIPaymentsByUserId(userId: number): Promise<EMIPayment[]>;
  getEMIPaymentsByPackageId(packageId: number): Promise<EMIPayment[]>;
  getAllEMIPayments(): Promise<EMIPayment[]>;
  
  // Binary structure operations
  createBinaryStructure(data: InsertBinaryStructure): Promise<BinaryStructure>;
  getBinaryStructureByUserId(userId: number): Promise<BinaryStructure | undefined>;
  getUsersBinaryDownline(userId: number): Promise<BinaryStructure[]>;
  
  // Earnings operations
  createEarning(earningData: InsertEarning): Promise<Earning>;
  getEarningsByUserId(userId: number): Promise<Earning[]>;
  getAllEarnings(): Promise<Earning[]>;
  
  // Withdrawal operations
  createWithdrawal(withdrawalData: InsertWithdrawal): Promise<Withdrawal>;
  getWithdrawalsByUserId(userId: number): Promise<Withdrawal[]>;
  updateWithdrawal(id: number, data: Partial<Withdrawal>): Promise<Withdrawal | undefined>;
  getAllWithdrawals(): Promise<Withdrawal[]>;
  
  // Auto pool operations
  createAutoPoolEntry(data: InsertAutoPool): Promise<AutoPool>;
  getAutoPoolEntriesByUserId(userId: number): Promise<AutoPool[]>;
  getAutoPoolMatrix(): Promise<AutoPool[]>;
  
  // Transaction operations
  createTransaction(data: InsertTransaction): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
}

// Memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private packages: Map<number, Package>;
  private emiPayments: Map<number, EMIPayment>;
  private binaryStructures: Map<number, BinaryStructure>;
  private earnings: Map<number, Earning>;
  private withdrawals: Map<number, Withdrawal>;
  private autoPools: Map<number, AutoPool>;
  private transactions: Map<number, Transaction>;
  
  private userIdCounter: number;
  private packageIdCounter: number;
  private emiPaymentIdCounter: number;
  private binaryStructureIdCounter: number;
  private earningIdCounter: number;
  private withdrawalIdCounter: number;
  private autoPoolIdCounter: number;
  private transactionIdCounter: number;

  constructor() {
    this.users = new Map();
    this.packages = new Map();
    this.emiPayments = new Map();
    this.binaryStructures = new Map();
    this.earnings = new Map();
    this.withdrawals = new Map();
    this.autoPools = new Map();
    this.transactions = new Map();
    
    this.userIdCounter = 1;
    this.packageIdCounter = 1;
    this.emiPaymentIdCounter = 1;
    this.binaryStructureIdCounter = 1;
    this.earningIdCounter = 1;
    this.withdrawalIdCounter = 1;
    this.autoPoolIdCounter = 1;
    this.transactionIdCounter = 1;
    
    // Create admin user by default
    this.createUser({
      name: "Admin User",
      email: "admin@pelnora.com",
      phone: "1234567890",
      password: "admin123",
      role: "admin",
      isActive: true,
    });
    
    // Create test user for development
    this.createUser({
      name: "Test User",
      email: "test@pelnora.com",
      phone: "9876543210",
      password: "test123", // Using a password that meets the 6-character minimum
      role: "user",
      isActive: true,
    });
  }

  // Generate a unique referral ID
  private generateReferralId(): string {
    return 'PEL' + crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email.toLowerCase() === email.toLowerCase()
    );
  }

  async getUserByReferralId(referralId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralId === referralId
    );
  }

  async createUser(userData: InsertUser, referredById?: number): Promise<User> {
    const id = this.userIdCounter++;
    const referralId = this.generateReferralId();
    
    const user: User = {
      ...userData,
      id,
      referralId,
      referredBy: referredById,
      leftTeamCount: 0,
      rightTeamCount: 0,
      totalEarnings: "0",
      withdrawableAmount: "0",
      unlockedLevels: referredById ? 2 : 0, // If referred, start with 2 levels
      autoPoolEligible: false,
      kycStatus: false,
      isActive: true,
      createdAt: new Date(),
    };
    
    this.users.set(id, user);
    
    // If this user was referred, update the referrer's level access
    if (referredById) {
      const referrer = await this.getUser(referredById);
      if (referrer) {
        // Add 2 more levels for each direct referral
        const newLevels = referrer.unlockedLevels + 2;
        await this.updateUser(referredById, { 
          unlockedLevels: Math.min(newLevels, 20) // Max 20 levels
        });
        
        // Add direct referral income (5% of package amount)
        // This will be added when they purchase a package
      }
    }
    
    return user;
  }

  async updateUser(id: number, data: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUserEarnings(id: number, amount: number): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const currentEarnings = parseFloat(user.totalEarnings);
    const updatedEarnings = (currentEarnings + amount).toFixed(2);
    
    // If total earnings exceed 10,000, make user eligible for auto pool
    const autoPoolEligible = parseFloat(updatedEarnings) >= 10000;
    
    const updatedUser = { 
      ...user, 
      totalEarnings: updatedEarnings,
      withdrawableAmount: (parseFloat(user.withdrawableAmount) + amount).toFixed(2),
      autoPoolEligible: user.autoPoolEligible || autoPoolEligible
    };
    
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  // Package operations
  async createPackage(packageData: InsertPackage): Promise<Package> {
    const id = this.packageIdCounter++;
    
    const nextPaymentDate = new Date();
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    
    const newPackage: Package = {
      ...packageData,
      id,
      paidMonths: 0,
      isCompleted: false,
      bonusEarned: false,
      startDate: new Date(),
      nextPaymentDue: nextPaymentDate,
    };
    
    this.packages.set(id, newPackage);
    return newPackage;
  }

  async getPackageByUserId(userId: number): Promise<Package | undefined> {
    return Array.from(this.packages.values()).find(
      (pkg) => pkg.userId === userId
    );
  }

  async updatePackage(id: number, data: Partial<Package>): Promise<Package | undefined> {
    const pkg = this.packages.get(id);
    if (!pkg) return undefined;
    
    const updatedPackage = { ...pkg, ...data };
    this.packages.set(id, updatedPackage);
    return updatedPackage;
  }

  async getAllPackages(): Promise<Package[]> {
    return Array.from(this.packages.values());
  }

  // EMI operations
  async createEMIPayment(emiData: InsertEMIPayment): Promise<EMIPayment> {
    const id = this.emiPaymentIdCounter++;
    
    const newEMIPayment: EMIPayment = {
      ...emiData,
      id,
      paymentDate: new Date(),
    };
    
    this.emiPayments.set(id, newEMIPayment);
    
    // Update package's paid months
    const pkg = await this.getPackageByUserId(emiData.userId);
    if (pkg) {
      const paidMonths = pkg.paidMonths + 1;
      const isCompleted = paidMonths >= pkg.totalMonths;
      
      // Check if bonus is earned (all payments made on time)
      const bonusEarned = isCompleted && this.emiPayments
        .values()
        .filter(payment => payment.packageId === pkg.id)
        .every(payment => payment.status === 'paid' || payment.status === 'bonus_earned');
      
      await this.updatePackage(pkg.id, { 
        paidMonths, 
        isCompleted,
        bonusEarned
      });
      
      // Add EMI Bonus if completed all payments on time
      if (isCompleted && bonusEarned) {
        const bonusAmount = parseFloat(pkg.monthlyAmount);
        await this.createEarning({
          userId: emiData.userId,
          amount: bonusAmount.toString(),
          earningType: 'emi_bonus',
          description: 'EMI Bonus for completing all payments on time',
        });
        
        await this.updateUserEarnings(emiData.userId, bonusAmount);
      }
      
      // Update next payment due date
      if (!isCompleted) {
        const nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        await this.updatePackage(pkg.id, { nextPaymentDue: nextPaymentDate });
      }
    }
    
    return newEMIPayment;
  }

  async getEMIPaymentsByUserId(userId: number): Promise<EMIPayment[]> {
    return Array.from(this.emiPayments.values()).filter(
      (payment) => payment.userId === userId
    );
  }

  async getEMIPaymentsByPackageId(packageId: number): Promise<EMIPayment[]> {
    return Array.from(this.emiPayments.values()).filter(
      (payment) => payment.packageId === packageId
    );
  }

  async getAllEMIPayments(): Promise<EMIPayment[]> {
    return Array.from(this.emiPayments.values());
  }

  // Binary structure operations
  async createBinaryStructure(data: InsertBinaryStructure): Promise<BinaryStructure> {
    const id = this.binaryStructureIdCounter++;
    
    const newBinaryStructure: BinaryStructure = {
      ...data,
      id,
    };
    
    this.binaryStructures.set(id, newBinaryStructure);
    
    // Update user's team counts
    if (data.parentId) {
      const parent = await this.getUser(data.parentId);
      if (parent) {
        const position = data.position;
        if (position === 'left') {
          await this.updateUser(data.parentId, { 
            leftTeamCount: parent.leftTeamCount + 1 
          });
        } else if (position === 'right') {
          await this.updateUser(data.parentId, { 
            rightTeamCount: parent.rightTeamCount + 1 
          });
        }
      }
    }
    
    return newBinaryStructure;
  }

  async getBinaryStructureByUserId(userId: number): Promise<BinaryStructure | undefined> {
    return Array.from(this.binaryStructures.values()).find(
      (structure) => structure.userId === userId
    );
  }

  async getUsersBinaryDownline(userId: number): Promise<BinaryStructure[]> {
    return Array.from(this.binaryStructures.values()).filter(
      (structure) => structure.parentId === userId
    );
  }

  // Earnings operations
  async createEarning(earningData: InsertEarning): Promise<Earning> {
    const id = this.earningIdCounter++;
    
    const newEarning: Earning = {
      ...earningData,
      id,
      createdAt: new Date(),
    };
    
    this.earnings.set(id, newEarning);
    
    // Create a transaction record for this earning
    await this.createTransaction({
      userId: earningData.userId,
      amount: earningData.amount,
      type: 'earning',
      description: `${earningData.earningType} income: ${earningData.description || ''}`,
      relatedId: id,
    });
    
    return newEarning;
  }

  async getEarningsByUserId(userId: number): Promise<Earning[]> {
    return Array.from(this.earnings.values())
      .filter(earning => earning.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllEarnings(): Promise<Earning[]> {
    return Array.from(this.earnings.values());
  }

  // Withdrawal operations
  async createWithdrawal(withdrawalData: InsertWithdrawal): Promise<Withdrawal> {
    const id = this.withdrawalIdCounter++;
    
    const newWithdrawal: Withdrawal = {
      ...withdrawalData,
      id,
      status: 'pending',
      requestDate: new Date(),
      processedDate: undefined,
      remarks: '',
    };
    
    this.withdrawals.set(id, newWithdrawal);
    
    // Reduce withdrawable amount from user
    const user = await this.getUser(withdrawalData.userId);
    if (user) {
      const withdrawable = Math.max(0, parseFloat(user.withdrawableAmount) - parseFloat(withdrawalData.amount));
      await this.updateUser(withdrawalData.userId, { 
        withdrawableAmount: withdrawable.toString() 
      });
    }
    
    return newWithdrawal;
  }

  async getWithdrawalsByUserId(userId: number): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values())
      .filter(withdrawal => withdrawal.userId === userId)
      .sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime());
  }

  async updateWithdrawal(id: number, data: Partial<Withdrawal>): Promise<Withdrawal | undefined> {
    const withdrawal = this.withdrawals.get(id);
    if (!withdrawal) return undefined;
    
    const updatedWithdrawal = { ...withdrawal, ...data };
    
    // If withdrawal is rejected, add the amount back to user's withdrawable balance
    if (data.status === 'rejected' && withdrawal.status !== 'rejected') {
      const user = await this.getUser(withdrawal.userId);
      if (user) {
        const withdrawable = parseFloat(user.withdrawableAmount) + parseFloat(withdrawal.amount);
        await this.updateUser(withdrawal.userId, { 
          withdrawableAmount: withdrawable.toString() 
        });
      }
    }
    
    // If withdrawal is processed (approved or rejected), set processedDate
    if ((data.status === 'approved' || data.status === 'rejected') && !updatedWithdrawal.processedDate) {
      updatedWithdrawal.processedDate = new Date();
    }
    
    this.withdrawals.set(id, updatedWithdrawal);
    
    // Create a transaction record if withdrawal is approved
    if (data.status === 'approved' && withdrawal.status !== 'approved') {
      await this.createTransaction({
        userId: withdrawal.userId,
        amount: `-${withdrawal.amount}`,
        type: 'withdrawal',
        description: `Withdrawal processed: ${data.remarks || ''}`,
        relatedId: id,
      });
    }
    
    return updatedWithdrawal;
  }

  async getAllWithdrawals(): Promise<Withdrawal[]> {
    return Array.from(this.withdrawals.values());
  }

  // Auto pool operations
  async createAutoPoolEntry(data: InsertAutoPool): Promise<AutoPool> {
    const id = this.autoPoolIdCounter++;
    
    const newAutoPoolEntry: AutoPool = {
      ...data,
      id,
      joinDate: new Date(),
    };
    
    this.autoPools.set(id, newAutoPoolEntry);
    return newAutoPoolEntry;
  }

  async getAutoPoolEntriesByUserId(userId: number): Promise<AutoPool[]> {
    return Array.from(this.autoPools.values()).filter(
      (entry) => entry.userId === userId
    );
  }

  async getAutoPoolMatrix(): Promise<AutoPool[]> {
    return Array.from(this.autoPools.values());
  }

  // Transaction operations
  async createTransaction(data: InsertTransaction): Promise<Transaction> {
    const id = this.transactionIdCounter++;
    
    const newTransaction: Transaction = {
      ...data,
      id,
      createdAt: new Date(),
    };
    
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

// Export the storage instance
export const storage = new MemStorage();
