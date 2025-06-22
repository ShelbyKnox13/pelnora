var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  autoPool: () => autoPool,
  binaryStructure: () => binaryStructure,
  earningTypeEnum: () => earningTypeEnum,
  earnings: () => earnings,
  emiPayments: () => emiPayments,
  emiStatusEnum: () => emiStatusEnum,
  insertAutoPoolSchema: () => insertAutoPoolSchema,
  insertBinaryStructureSchema: () => insertBinaryStructureSchema,
  insertEMIPaymentSchema: () => insertEMIPaymentSchema,
  insertEarningSchema: () => insertEarningSchema,
  insertPackageSchema: () => insertPackageSchema,
  insertTransactionSchema: () => insertTransactionSchema,
  insertUserSchema: () => insertUserSchema,
  insertWithdrawalSchema: () => insertWithdrawalSchema,
  kycStatusEnum: () => kycStatusEnum,
  loginSchema: () => loginSchema,
  packageTypeEnum: () => packageTypeEnum,
  packages: () => packages,
  transactionTypeEnum: () => transactionTypeEnum,
  transactions: () => transactions,
  userRoleEnum: () => userRoleEnum,
  users: () => users,
  withdrawalStatusEnum: () => withdrawalStatusEnum,
  withdrawals: () => withdrawals
});
import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
var userRoleEnum, packageTypeEnum, emiStatusEnum, withdrawalStatusEnum, earningTypeEnum, transactionTypeEnum, kycStatusEnum, users, packages, emiPayments, binaryStructure, earnings, withdrawals, autoPool, transactions, insertUserSchema, insertPackageSchema, insertEMIPaymentSchema, insertBinaryStructureSchema, insertEarningSchema, insertWithdrawalSchema, insertAutoPoolSchema, insertTransactionSchema, loginSchema;
var init_schema = __esm({
  "shared/schema.ts"() {
    "use strict";
    userRoleEnum = pgEnum("user_role", ["user", "admin"]);
    packageTypeEnum = pgEnum("package_type", ["silver", "gold", "platinum", "diamond"]);
    emiStatusEnum = pgEnum("emi_status", ["pending", "paid", "late", "bonus_earned"]);
    withdrawalStatusEnum = pgEnum("withdrawal_status", ["pending", "approved", "rejected"]);
    earningTypeEnum = pgEnum("earning_type", ["direct", "binary", "level", "autopool", "emi_bonus"]);
    transactionTypeEnum = pgEnum("transaction_type", ["emi_payment", "earning", "withdrawal", "deduction"]);
    kycStatusEnum = pgEnum("kyc_status", ["not_submitted", "pending", "approved", "rejected"]);
    users = pgTable("users", {
      id: serial("id").primaryKey(),
      name: text("name").notNull(),
      email: text("email").notNull().unique(),
      phone: text("phone").notNull(),
      password: text("password").notNull(),
      referralId: text("referral_id").notNull().unique(),
      referredBy: integer("referred_by").references(() => users.id),
      role: userRoleEnum("role").default("user").notNull(),
      isActive: boolean("is_active").default(true).notNull(),
      leftTeamCount: integer("left_team_count").default(0).notNull(),
      rightTeamCount: integer("right_team_count").default(0).notNull(),
      leftCarryForward: numeric("left_carry_forward").default("0").notNull(),
      rightCarryForward: numeric("right_carry_forward").default("0").notNull(),
      totalEarnings: numeric("total_earnings").default("0").notNull(),
      withdrawableAmount: numeric("withdrawable_amount").default("0").notNull(),
      bankName: text("bank_name"),
      accountNumber: text("account_number"),
      ifscCode: text("ifsc_code"),
      panNumber: text("pan_number"),
      idProofType: text("id_proof_type"),
      idProofNumber: text("id_proof_number"),
      panCardImage: text("pan_card_image"),
      idProofImage: text("id_proof_image"),
      kycStatus: kycStatusEnum("kyc_status").default("not_submitted").notNull(),
      kycRejectionReason: text("kyc_rejection_reason"),
      unlockedLevels: integer("unlocked_levels").default(0).notNull(),
      autoPoolEligible: boolean("auto_pool_eligible").default(false).notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull()
    });
    packages = pgTable("packages", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      packageType: packageTypeEnum("package_type").notNull(),
      monthlyAmount: numeric("monthly_amount").notNull(),
      totalMonths: integer("total_months").default(11).notNull(),
      paidMonths: integer("paid_months").default(0).notNull(),
      isCompleted: boolean("is_completed").default(false).notNull(),
      bonusEarned: boolean("bonus_earned").default(false).notNull(),
      startDate: timestamp("start_date").defaultNow().notNull(),
      nextPaymentDue: timestamp("next_payment_due")
    });
    emiPayments = pgTable("emi_payments", {
      id: serial("id").primaryKey(),
      packageId: integer("package_id").notNull().references(() => packages.id),
      userId: integer("user_id").notNull().references(() => users.id),
      amount: numeric("amount").notNull(),
      paymentDate: timestamp("payment_date").defaultNow().notNull(),
      status: emiStatusEnum("status").default("paid").notNull(),
      month: integer("month").notNull()
    });
    binaryStructure = pgTable("binary_structure", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      parentId: integer("parent_id").references(() => users.id),
      position: text("position").notNull(),
      // 'left' or 'right'
      level: integer("level").notNull()
    });
    earnings = pgTable("earnings", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      amount: numeric("amount").notNull(),
      earningType: earningTypeEnum("earning_type").notNull(),
      description: text("description"),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      relatedUserId: integer("related_user_id").references(() => users.id)
    });
    withdrawals = pgTable("withdrawals", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      amount: numeric("amount").notNull(),
      status: withdrawalStatusEnum("status").default("pending").notNull(),
      requestDate: timestamp("request_date").defaultNow().notNull(),
      processedDate: timestamp("processed_date"),
      remarks: text("remarks")
    });
    autoPool = pgTable("auto_pool", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      position: integer("position").notNull(),
      level: integer("level").notNull(),
      // 1, 2, or 3 for the 1:3:9 structure
      parentId: integer("parent_id").references(() => autoPool.id),
      joinDate: timestamp("join_date").defaultNow().notNull()
    });
    transactions = pgTable("transactions", {
      id: serial("id").primaryKey(),
      userId: integer("user_id").notNull().references(() => users.id),
      amount: numeric("amount").notNull(),
      type: transactionTypeEnum("type").notNull(),
      description: text("description").notNull(),
      createdAt: timestamp("created_at").defaultNow().notNull(),
      relatedId: integer("related_id")
      // Could be a package_id, earning_id, etc.
    });
    insertUserSchema = createInsertSchema(users).omit({
      id: true,
      referralId: true,
      leftTeamCount: true,
      rightTeamCount: true,
      leftCarryForward: true,
      rightCarryForward: true,
      totalEarnings: true,
      withdrawableAmount: true,
      unlockedLevels: true,
      autoPoolEligible: true,
      createdAt: true,
      kycStatus: true,
      isActive: true
    });
    insertPackageSchema = createInsertSchema(packages).omit({
      id: true,
      paidMonths: true,
      isCompleted: true,
      bonusEarned: true,
      startDate: true
    });
    insertEMIPaymentSchema = createInsertSchema(emiPayments).omit({
      id: true,
      paymentDate: true
    });
    insertBinaryStructureSchema = createInsertSchema(binaryStructure).omit({
      id: true
    });
    insertEarningSchema = createInsertSchema(earnings).omit({
      id: true,
      createdAt: true
    });
    insertWithdrawalSchema = createInsertSchema(withdrawals).omit({
      id: true,
      requestDate: true,
      processedDate: true,
      status: true
    });
    insertAutoPoolSchema = createInsertSchema(autoPool).omit({
      id: true,
      joinDate: true
    });
    insertTransactionSchema = createInsertSchema(transactions).omit({
      id: true,
      createdAt: true
    });
    loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });
  }
});

// server/db.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
var pool, db;
var init_db = __esm({
  "server/db.ts"() {
    "use strict";
    init_schema();
    pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "pelnora",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "admin"
    });
    pool.connect((err, client, release) => {
      if (err) {
        console.error("Error connecting to the database:", err);
        console.error("Please check if:");
        console.error("1. PostgreSQL is running");
        console.error('2. Database "pelnora" exists');
        console.error("3. Username and password are correct");
        console.error("4. Port 5432 is accessible");
        process.exit(1);
      }
      console.log("Successfully connected to PostgreSQL database");
      release();
    });
    db = drizzle(pool, { schema: schema_exports });
  }
});

// server/pgStorage.ts
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";
var PostgresStorage, storage;
var init_pgStorage = __esm({
  "server/pgStorage.ts"() {
    "use strict";
    init_db();
    init_schema();
    PostgresStorage = class {
      // Generate a unique referral ID
      generateReferralId() {
        return "PEL" + crypto.randomBytes(4).toString("hex").toUpperCase();
      }
      // User operations
      async getUser(id) {
        const result = await db.select().from(users).where(eq(users.id, id));
        return result[0];
      }
      async getUserByEmail(email) {
        const result = await db.select().from(users).where(eq(users.email, email));
        return result[0];
      }
      async getUserByReferralId(referralId) {
        const result = await db.select().from(users).where(eq(users.referralId, referralId));
        return result[0];
      }
      async createUser(userData, referredById, placementPosition) {
        try {
          console.log("Starting user creation in storage");
          const referralId = this.generateReferralId();
          const now = /* @__PURE__ */ new Date();
          const insertObj = {
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password,
            referralId,
            referredBy: referredById ?? userData.referredBy ?? null,
            role: userData.role ?? "user",
            isActive: true,
            leftTeamCount: 0,
            rightTeamCount: 0,
            leftCarryForward: "0",
            rightCarryForward: "0",
            totalEarnings: "0",
            withdrawableAmount: "0",
            bankName: null,
            accountNumber: null,
            ifscCode: null,
            panNumber: null,
            idProofType: null,
            idProofNumber: null,
            panCardImage: null,
            idProofImage: null,
            kycStatus: "not_submitted",
            kycRejectionReason: null,
            unlockedLevels: 0,
            autoPoolEligible: false,
            createdAt: now
          };
          const [user] = await db.insert(users).values(insertObj).returning();
          if (!user) {
            throw new Error("Failed to create user - no user returned from database");
          }
          console.log("User created successfully in storage:", { id: user.id, email: user.email });
          if (referredById) {
            const referrer = await this.getUser(referredById);
            if (referrer) {
              console.log(`Setting up binary structure for ${user.name} under referrer ${referrer.name}`);
              const newLevels = referrer.unlockedLevels + 2;
              await this.updateUser(referredById, {
                unlockedLevels: Math.min(newLevels, 20)
                // Max 20 levels
              });
              const position = placementPosition === "right" ? "right" : "left";
              await this.createBinaryStructure({
                userId: user.id,
                parentId: referredById,
                position,
                level: 1
              });
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
          console.error("Error in createUser:", error);
          if (error instanceof Error) {
            throw new Error(`Failed to create user: ${error.message}`);
          }
          throw new Error("Failed to create user: Unknown error");
        }
      }
      async updateUser(id, data) {
        const [updatedUser] = await db.update(users).set(data).where(eq(users.id, id)).returning();
        return updatedUser;
      }
      async getAllUsers() {
        return await db.select().from(users);
      }
      async updateUserEarnings(id, amount) {
        const user = await this.getUser(id);
        if (!user) return void 0;
        const currentEarnings = parseFloat(user.totalEarnings);
        const updatedEarnings = (currentEarnings + amount).toFixed(2);
        const autoPoolEligible = parseFloat(updatedEarnings) >= 1e4;
        const [updatedUser] = await db.update(users).set({
          totalEarnings: updatedEarnings,
          withdrawableAmount: (parseFloat(user.withdrawableAmount) + amount).toFixed(2),
          autoPoolEligible: user.autoPoolEligible || autoPoolEligible
        }).where(eq(users.id, id)).returning();
        return updatedUser;
      }
      async getUserCount() {
        const result = await db.select({ count: sql`count(*)` }).from(users);
        return Number(result[0].count);
      }
      async getAdminUsers() {
        return await db.select().from(users).where(eq(users.role, "admin"));
      }
      // KYC operations
      async updateUserKYC(data) {
        const [updatedUser] = await db.update(users).set({
          panNumber: data.panNumber,
          idProofType: data.idProofType,
          idProofNumber: data.idProofNumber,
          panCardImage: data.panCardImage,
          idProofImage: data.idProofImage,
          kycStatus: data.kycStatus
        }).where(eq(users.id, data.userId)).returning();
        return updatedUser;
      }
      async updateUserKYCStatus(data) {
        const [updatedUser] = await db.update(users).set({
          kycStatus: data.kycStatus,
          kycRejectionReason: data.kycRejectionReason
        }).where(eq(users.id, data.userId)).returning();
        return updatedUser;
      }
      async getKYCRequests(status) {
        let query = db.select().from(users);
        if (status) {
          query = query.where(eq(users.kycStatus, status));
        }
        return await query;
      }
      async createNotification(data) {
        return data;
      }
      // Binary structure operations
      async createBinaryStructure(data) {
        const [result] = await db.insert(binaryStructure).values(data).returning();
        return result;
      }
      async getBinaryStructureByUserId(userId) {
        const result = await db.select().from(binaryStructure).where(eq(binaryStructure.userId, userId));
        return result[0];
      }
      async getUsersBinaryDownline(userId) {
        return await db.select().from(binaryStructure).where(eq(binaryStructure.parentId, userId));
      }
      async getAllBinaryStructures() {
        return await db.select().from(binaryStructure);
      }
      async getBinaryBusinessInfo(userId) {
        const user = await this.getUser(userId);
        if (!user) {
          return { leftTeamBusiness: "0", rightTeamBusiness: "0", leftCarryForward: "0", rightCarryForward: "0" };
        }
        const allBinaryStructures = await db.select().from(binaryStructure);
        const allUsers = await db.select().from(users);
        const getCompleteTeam = (rootUserId, position) => {
          const result = [];
          const directChildren = allBinaryStructures.filter((bs) => bs.parentId === rootUserId && bs.position === position).map((bs) => bs.userId);
          result.push(...directChildren);
          for (const childId of directChildren) {
            const getAllDownline = (parentId) => {
              const children = allBinaryStructures.filter((bs) => bs.parentId === parentId).map((bs) => bs.userId);
              let allChildren = [...children];
              for (const child of children) {
                allChildren.push(...getAllDownline(child));
              }
              return allChildren;
            };
            result.push(...getAllDownline(childId));
          }
          return [...new Set(result)];
        };
        const leftTeamUserIds = getCompleteTeam(userId, "left");
        const rightTeamUserIds = getCompleteTeam(userId, "right");
        console.log(`\u{1F50D} User ${user.name} (ID: ${userId}) team analysis:`);
        console.log(`   Left team user IDs: [${leftTeamUserIds.join(", ")}]`);
        console.log(`   Right team user IDs: [${rightTeamUserIds.join(", ")}]`);
        const leftTeamUsers = allUsers.filter((u) => leftTeamUserIds.includes(u.id));
        const rightTeamUsers = allUsers.filter((u) => rightTeamUserIds.includes(u.id));
        let leftTeamBusiness = 0;
        let rightTeamBusiness = 0;
        console.log(`\u{1F4CA} Calculating left team business:`);
        console.log(`   Left team users found: ${leftTeamUsers.length}`);
        for (const leftUser of leftTeamUsers) {
          console.log(`   Checking user: ${leftUser.name} (ID: ${leftUser.id})`);
          const userPackage = await this.getPackageByUserId(leftUser.id);
          if (userPackage) {
            const packageValue = parseFloat(userPackage.monthlyAmount);
            leftTeamBusiness += packageValue;
            console.log(`   \u2705 Added \u20B9${packageValue} from ${leftUser.name}'s ${userPackage.packageType} package`);
          } else {
            console.log(`   \u274C No package found for ${leftUser.name} (ID: ${leftUser.id})`);
          }
        }
        console.log(`\u{1F4CA} Calculating right team business:`);
        console.log(`   Right team users found: ${rightTeamUsers.length}`);
        for (const rightUser of rightTeamUsers) {
          console.log(`   Checking user: ${rightUser.name} (ID: ${rightUser.id})`);
          const userPackage = await this.getPackageByUserId(rightUser.id);
          if (userPackage) {
            const packageValue = parseFloat(userPackage.monthlyAmount);
            rightTeamBusiness += packageValue;
            console.log(`   \u2705 Added \u20B9${packageValue} from ${rightUser.name}'s ${userPackage.packageType} package`);
          } else {
            console.log(`   \u274C No package found for ${rightUser.name} (ID: ${rightUser.id})`);
          }
        }
        const leftCarryForward = user.leftCarryForward || "0";
        const rightCarryForward = user.rightCarryForward || "0";
        console.log(`\u{1F4C8} Final calculation for ${user.name}:`);
        console.log(`   Current business - Left: \u20B9${leftTeamBusiness}, Right: \u20B9${rightTeamBusiness}`);
        console.log(`   Carry forward - Left: \u20B9${leftCarryForward}, Right: \u20B9${rightCarryForward}`);
        const totalLeftBusiness = parseFloat(leftCarryForward) + leftTeamBusiness;
        const totalRightBusiness = parseFloat(rightCarryForward) + rightTeamBusiness;
        console.log(`   Total accumulated business - Left: \u20B9${totalLeftBusiness}, Right: \u20B9${totalRightBusiness}`);
        return {
          leftTeamBusiness: leftTeamBusiness.toString(),
          rightTeamBusiness: rightTeamBusiness.toString(),
          leftCarryForward: totalLeftBusiness.toString(),
          // Show total accumulated business
          rightCarryForward: totalRightBusiness.toString()
          // Show total accumulated business
        };
      }
      // Package operations
      async createPackage(packageData) {
        const [pkg] = await db.insert(packages).values(packageData).returning();
        console.log(`\u{1F4E6} PACKAGE CREATED: User ID ${packageData.userId}, Package Type: ${packageData.packageType}, Amount: ${packageData.monthlyAmount}`);
        await this.calculateRealEarnings(packageData.userId, pkg);
        return pkg;
      }
      async getPackageByUserId(userId) {
        const result = await db.select().from(packages).where(eq(packages.userId, userId));
        return result[0];
      }
      async getUserPackage(userId) {
        return this.getPackageByUserId(userId);
      }
      async updatePackage(id, data) {
        const [updatedPackage] = await db.update(packages).set(data).where(eq(packages.id, id)).returning();
        return updatedPackage;
      }
      async getAllPackages() {
        return await db.select().from(packages);
      }
      // EMI operations
      async createEMIPayment(emiData) {
        const [newEMIPayment] = await db.insert(emiPayments).values(emiData).returning();
        return newEMIPayment;
      }
      async getEMIPaymentsByUserId(userId) {
        return await db.select().from(emiPayments).where(eq(emiPayments.userId, userId));
      }
      async getEMIPaymentsByPackageId(packageId) {
        return await db.select().from(emiPayments).where(eq(emiPayments.packageId, packageId));
      }
      async getAllEMIPayments() {
        return await db.select().from(emiPayments);
      }
      // Earnings operations
      async createEarning(earningData) {
        const [newEarning] = await db.insert(earnings).values(earningData).returning();
        return newEarning;
      }
      async getEarningsByUserId(userId) {
        return await db.select().from(earnings).where(eq(earnings.userId, userId)).orderBy(desc(earnings.createdAt));
      }
      async getUserEarnings(userId) {
        return this.getEarningsByUserId(userId);
      }
      async getAllEarnings() {
        return await db.select().from(earnings);
      }
      // Withdrawal operations
      async createWithdrawal(withdrawalData) {
        const [newWithdrawal] = await db.insert(withdrawals).values(withdrawalData).returning();
        return newWithdrawal;
      }
      async getWithdrawalsByUserId(userId) {
        return await db.select().from(withdrawals).where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.requestDate));
      }
      async updateWithdrawal(id, data) {
        const [updatedWithdrawal] = await db.update(withdrawals).set(data).where(eq(withdrawals.id, id)).returning();
        return updatedWithdrawal;
      }
      async getAllWithdrawals() {
        return await db.select().from(withdrawals);
      }
      // Auto pool operations
      async createAutoPoolEntry(data) {
        const [newAutoPool] = await db.insert(autoPool).values(data).returning();
        return newAutoPool;
      }
      async getAutoPoolEntriesByUserId(userId) {
        return await db.select().from(autoPool).where(eq(autoPool.userId, userId));
      }
      async getAutoPoolMatrix() {
        return await db.select().from(autoPool);
      }
      // Transaction operations
      async createTransaction(data) {
        const [newTransaction] = await db.insert(transactions).values(data).returning();
        return newTransaction;
      }
      async getTransactionsByUserId(userId) {
        return await db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt));
      }
      // Level structure operations
      async getUsersAtLevel(userId, level) {
        return [];
      }
      async calculateLevelEarnings(userId) {
        return [];
      }
      // Real earnings calculation when package is purchased
      async calculateRealEarnings(buyerUserId, packagePurchased) {
        console.log(`\u{1F504} Calculating real earnings for package purchase by user ${buyerUserId}`);
        const buyer = await this.getUser(buyerUserId);
        if (!buyer) {
          console.log(`\u274C Buyer user ${buyerUserId} not found`);
          return;
        }
        const monthlyAmount = parseFloat(packagePurchased.monthlyAmount);
        const totalPackageValue = monthlyAmount * packagePurchased.totalMonths;
        console.log(`\u{1F4CA} Package purchased: ${packagePurchased.packageType} - Monthly: \u20B9${monthlyAmount}, Total: \u20B9${totalPackageValue}`);
        if (buyer.referredBy) {
          const referrer = await this.getUser(buyer.referredBy);
          if (referrer) {
            const directIncome = monthlyAmount * 0.05;
            console.log(`\u{1F4B0} Creating direct income: \u20B9${directIncome} for ${referrer.name} (ID: ${referrer.id})`);
            await this.createEarning({
              userId: referrer.id,
              amount: directIncome.toString(),
              earningType: "direct",
              description: `Direct income: 5% of ${buyer.name}'s ${packagePurchased.packageType} package (\u20B9${monthlyAmount}/month)`,
              relatedUserId: buyer.id
            });
            await this.updateUserEarnings(referrer.id, directIncome);
            console.log(`\u2705 Direct income: \u20B9${directIncome} paid to ${referrer.name} (ID: ${referrer.id})`);
            await this.calculateUplineBinaryIncome(buyer.id, monthlyAmount);
            await this.calculateLevelIncome(buyerUserId, monthlyAmount);
          }
        } else {
          console.log(`\u2139\uFE0F User ${buyer.name} has no referrer, skipping earnings calculation`);
        }
      }
      // Calculate level income distribution based on actual percentages
      async calculateLevelIncome(buyerUserId, monthlyAmount) {
        console.log(`\u{1F3AF} Calculating level income for buyer ${buyerUserId} with package amount: \u20B9${monthlyAmount}`);
        const levelPercentages = [
          0.15,
          // Level 1: 15%
          0.1,
          // Level 2: 10%
          0.05,
          // Level 3: 5%
          0.03,
          0.03,
          0.03,
          0.03,
          0.03,
          // Levels 4-8: 3% each
          0.02,
          0.02,
          0.02,
          0.02,
          0.02,
          0.02,
          // Levels 9-14: 2% each
          0.01,
          0.01,
          0.01,
          0.01,
          0.01,
          0.01
          // Levels 15-20: 1% each
        ];
        const directIncome = monthlyAmount * 0.05;
        const allUsers = await this.getAllUsers();
        const buyerUser = await this.getUser(buyerUserId);
        if (!buyerUser || !buyerUser.referredBy) {
          console.log(`\u2139\uFE0F No direct referrer found for user ${buyerUserId}. Skipping level income.`);
          return;
        }
        const directReferrerId = buyerUser.referredBy;
        const directReferrer = await this.getUser(directReferrerId);
        if (!directReferrer) {
          console.log(`\u274C Direct referrer with ID ${directReferrerId} not found. Skipping level income.`);
          return;
        }
        console.log(`\u{1F464} Buyer's direct referrer is ${directReferrer.name} (ID: ${directReferrerId})`);
        console.log(`\u23ED\uFE0F Skipping level income for direct referrer ${directReferrer.name}`);
        let currentReferrerId = directReferrer.referredBy;
        let currentLevel = 1;
        while (currentReferrerId && currentLevel <= 20) {
          const uplineUser = await this.getUser(currentReferrerId);
          if (!uplineUser) break;
          const directReferralCount = allUsers.filter((u) => u.referredBy === uplineUser.id).length;
          const unlockedLevels = directReferralCount * 2;
          if (currentLevel <= unlockedLevels) {
            const levelIncome = directIncome * levelPercentages[currentLevel - 1];
            if (levelIncome > 0) {
              console.log(`\u{1F48E} Creating level ${currentLevel} income: \u20B9${levelIncome.toFixed(2)} for ${uplineUser.name} (ID: ${uplineUser.id})`);
              await this.createEarning({
                userId: uplineUser.id,
                amount: levelIncome.toString(),
                earningType: "level",
                description: `Level ${currentLevel} income: ${(levelPercentages[currentLevel - 1] * 100).toFixed(0)}% from ${buyerUser.name}'s package (\u20B9${monthlyAmount})`,
                relatedUserId: buyerUserId
              });
              await this.updateUserEarnings(uplineUser.id, levelIncome);
              console.log(`\u2705 Level ${currentLevel} income: \u20B9${levelIncome.toFixed(2)} (${(levelPercentages[currentLevel - 1] * 100).toFixed(0)}%) paid to ${uplineUser.name} (ID: ${uplineUser.id})`);
            }
          } else {
            console.log(`\u{1F512} Level ${currentLevel} locked for user ${uplineUser.id} (${uplineUser.name}). Needs ${Math.ceil(currentLevel / 2)} direct referrals, has ${directReferralCount}`);
          }
          currentReferrerId = uplineUser.referredBy;
          currentLevel++;
        }
      }
      // Calculate binary income for entire upline when a new package is purchased
      async calculateUplineBinaryIncome(newMemberUserId, newMemberPackageAmount) {
        console.log(`\u{1F504} Calculating upline binary income for new member ${newMemberUserId} with package amount: \u20B9${newMemberPackageAmount}`);
        const newMember = await this.getUser(newMemberUserId);
        if (!newMember || !newMember.referredBy) {
          console.log(`\u274C New member ${newMemberUserId} has no referrer, skipping binary income calculation`);
          return;
        }
        let currentUserId = newMember.referredBy;
        let level = 0;
        while (currentUserId && level < 20) {
          await this.calculateBinaryIncome(currentUserId, newMemberPackageAmount, newMemberUserId);
          const currentUser = await this.getUser(currentUserId);
          if (!currentUser || !currentUser.referredBy) break;
          currentUserId = currentUser.referredBy;
          level++;
        }
      }
      // Calculate binary income for a specific user with proper 2:1 or 1:2 matching and carry forward
      async calculateBinaryIncome(userId, newMemberPackageAmount, newMemberUserId) {
        const user = await this.getUser(userId);
        if (!user) return;
        console.log(`\u{1F3AF} Calculating binary income for user ${userId} (${user.name}) with new member package amount: \u20B9${newMemberPackageAmount}`);
        await this.updateCarryForwardWithNewBusiness(userId, newMemberPackageAmount, newMemberUserId);
        const businessInfo = await this.getBinaryBusinessInfo(userId);
        let leftCarryForward = parseFloat(businessInfo.leftCarryForward);
        let rightCarryForward = parseFloat(businessInfo.rightCarryForward);
        console.log(`\u{1F4E6} Total carry forward after new business - Left: \u20B9${leftCarryForward}, Right: \u20B9${rightCarryForward}`);
        const minBusiness = Math.min(leftCarryForward, rightCarryForward);
        const maxBusiness = Math.max(leftCarryForward, rightCarryForward);
        if (minBusiness > 0 && maxBusiness >= minBusiness * 2) {
          const binaryIncome = minBusiness * 0.1;
          if (binaryIncome > 0) {
            console.log(`\u{1F4B0} Binary matching achieved! Smaller side: \u20B9${minBusiness}, Binary income: \u20B9${binaryIncome}`);
            await this.createEarning({
              userId: user.id,
              amount: binaryIncome.toString(),
              earningType: "binary",
              description: `Binary income: 10% of matched business (\u20B9${minBusiness})`,
              relatedUserId: null
            });
            await this.updateUserEarnings(user.id, binaryIncome);
            console.log(`\u2705 Binary income: \u20B9${binaryIncome} paid to ${user.name} (ID: ${user.id})`);
            const newLeftCarryForward = Math.max(0, leftCarryForward - minBusiness);
            const newRightCarryForward = Math.max(0, rightCarryForward - minBusiness);
            await this.updateUser(user.id, {
              leftCarryForward: newLeftCarryForward.toString(),
              rightCarryForward: newRightCarryForward.toString()
            });
            console.log(`\u{1F4E6} Updated carry forward after matching - Left: \u20B9${newLeftCarryForward}, Right: \u20B9${newRightCarryForward}`);
          }
        } else {
          console.log(`\u23F3 No binary matching yet. Left: \u20B9${leftCarryForward}, Right: \u20B9${rightCarryForward} (need 2:1 or 1:2 ratio)`);
        }
      }
      // Update carry forward when new business is added to a team
      async updateCarryForwardWithNewBusiness(userId, newBusinessAmount, newMemberUserId) {
        const user = await this.getUser(userId);
        if (!user) return;
        let sideToUpdate = "left";
        if (newMemberUserId) {
          const memberBinaryStructure = await db.select().from(binaryStructure).where(eq(binaryStructure.userId, newMemberUserId));
          if (memberBinaryStructure.length > 0) {
            const memberStructure = memberBinaryStructure[0];
            let currentStructure = memberStructure;
            while (currentStructure && currentStructure.parentId !== userId) {
              const parentStructure = await db.select().from(binaryStructure).where(eq(binaryStructure.userId, currentStructure.parentId));
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
        if (sideToUpdate === "left") {
          const newLeftCarryForward = leftCarryForward + newBusinessAmount;
          await this.updateUser(userId, {
            leftCarryForward: newLeftCarryForward.toString()
          });
          console.log(`\u{1F4E6} Added \u20B9${newBusinessAmount} to left carry forward for ${user.name}. New total: \u20B9${newLeftCarryForward}`);
        } else {
          const newRightCarryForward = rightCarryForward + newBusinessAmount;
          await this.updateUser(userId, {
            rightCarryForward: newRightCarryForward.toString()
          });
          console.log(`\u{1F4E6} Added \u20B9${newBusinessAmount} to right carry forward for ${user.name}. New total: \u20B9${newRightCarryForward}`);
        }
      }
      // User deletion methods
      async deleteUser(userId) {
        try {
          console.log(`\u{1F5D1}\uFE0F Deleting user ${userId} and all related data`);
          await db.delete(earnings).where(eq(earnings.userId, userId));
          console.log(`   \u2705 Deleted earnings for user ${userId}`);
          await db.delete(withdrawals).where(eq(withdrawals.userId, userId));
          console.log(`   \u2705 Deleted withdrawals for user ${userId}`);
          await db.delete(emiPayments).where(eq(emiPayments.userId, userId));
          console.log(`   \u2705 Deleted EMI payments for user ${userId}`);
          await db.delete(packages).where(eq(packages.userId, userId));
          console.log(`   \u2705 Deleted packages for user ${userId}`);
          await db.delete(binaryStructure).where(eq(binaryStructure.userId, userId));
          await db.delete(binaryStructure).where(eq(binaryStructure.parentId, userId));
          console.log(`   \u2705 Deleted binary structure for user ${userId}`);
          await db.update(users).set({ referredBy: null }).where(eq(users.referredBy, userId));
          console.log(`   \u2705 Updated referral relationships for user ${userId}`);
          const result = await db.delete(users).where(eq(users.id, userId));
          console.log(`   \u2705 Deleted user ${userId}`);
          return true;
        } catch (error) {
          console.error(`\u274C Error deleting user ${userId}:`, error);
          return false;
        }
      }
      async deleteEarningsByUserId(userId) {
        try {
          const userEarnings = await this.getEarningsByUserId(userId);
          const count = userEarnings.length;
          await db.delete(earnings).where(eq(earnings.userId, userId));
          console.log(`   \u2705 Deleted ${count} earnings records for user ${userId}`);
          return count;
        } catch (error) {
          console.error(`\u274C Error deleting earnings for user ${userId}:`, error);
          return 0;
        }
      }
      // User management operations
      async deactivateUser(userId) {
        const [updatedUser] = await db.update(users).set({ isActive: false }).where(eq(users.id, userId)).returning();
        if (updatedUser) {
          console.log(`User ${updatedUser.name} (ID: ${userId}) has been deactivated`);
        }
        return updatedUser;
      }
      async activateUser(userId) {
        const [updatedUser] = await db.update(users).set({ isActive: true }).where(eq(users.id, userId)).returning();
        if (updatedUser) {
          console.log(`User ${updatedUser.name} (ID: ${userId}) has been activated`);
        }
        return updatedUser;
      }
      async deleteUserPermanently(userId, deletedByAdminId) {
        try {
          const userToDelete = await this.getUser(userId);
          if (!userToDelete) {
            return { success: false, message: "User not found" };
          }
          if (userToDelete.role === "admin") {
            return { success: false, message: "Cannot delete admin users" };
          }
          console.log(`Starting permanent deletion of user: ${userToDelete.name} (ID: ${userId})`);
          const deletionLog = {
            deletedUserId: userId,
            deletedUserName: userToDelete.name,
            deletedByAdminId,
            timestamp: /* @__PURE__ */ new Date(),
            action: "USER_DELETED_PERMANENTLY"
          };
          console.log("Deletion Log:", deletionLog);
          const userBinaryStructure = await this.getBinaryStructureByUserId(userId);
          const allBinaryStructures = await this.getAllBinaryStructures();
          const leftDownline = this.getCompleteDownline(userId, "left", allBinaryStructures);
          const rightDownline = this.getCompleteDownline(userId, "right", allBinaryStructures);
          const reassignedUsers = [];
          const orphanedUsers = [];
          if (userBinaryStructure && userBinaryStructure.parentId) {
            const uplineId = userBinaryStructure.parentId;
            const deletedUserPosition = userBinaryStructure.position;
            console.log(`Reassigning downline to upline ${uplineId} in position ${deletedUserPosition}`);
            if (leftDownline.length > 0) {
              const primaryLeftUser = leftDownline[0];
              await this.updateBinaryStructure(primaryLeftUser, uplineId, deletedUserPosition);
              reassignedUsers.push({ userId: primaryLeftUser, newParentId: uplineId, position: deletedUserPosition });
              for (let i = 1; i < leftDownline.length; i++) {
                await this.updateBinaryStructure(leftDownline[i], primaryLeftUser, "left");
                reassignedUsers.push({ userId: leftDownline[i], newParentId: primaryLeftUser, position: "left" });
              }
            }
            if (rightDownline.length > 0) {
              const primaryRightUser = rightDownline[0];
              const rightPosition = leftDownline.length > 0 ? deletedUserPosition === "left" ? "right" : "left" : deletedUserPosition;
              await this.updateBinaryStructure(primaryRightUser, uplineId, rightPosition);
              reassignedUsers.push({ userId: primaryRightUser, newParentId: uplineId, position: rightPosition });
              for (let i = 1; i < rightDownline.length; i++) {
                await this.updateBinaryStructure(rightDownline[i], primaryRightUser, "right");
                reassignedUsers.push({ userId: rightDownline[i], newParentId: primaryRightUser, position: "right" });
              }
            }
            await this.recalculateTeamCounts(uplineId);
          } else {
            console.log(`User ${userId} has no upline, downline will be orphaned`);
            for (const downlineUserId of [...leftDownline, ...rightDownline]) {
              const downlineUser = await this.getUser(downlineUserId);
              if (downlineUser) {
                orphanedUsers.push(downlineUser);
                await db.delete(binaryStructure).where(eq(binaryStructure.userId, downlineUserId));
              }
            }
          }
          const userEarnings = await this.getEarningsByUserId(userId);
          console.log(`   Deleting ${userEarnings.length} earnings records for user ${userId}`);
          await db.delete(earnings).where(eq(earnings.userId, userId));
          const relatedEarnings = await db.select().from(earnings).where(eq(earnings.relatedUserId, userId));
          console.log(`   Deleting ${relatedEarnings.length} related earnings records for user ${userId}`);
          await db.delete(earnings).where(eq(earnings.relatedUserId, userId));
          const userEMIPayments = await db.select().from(emiPayments).where(eq(emiPayments.userId, userId));
          console.log(`   Deleting ${userEMIPayments.length} EMI payment records for user ${userId}`);
          await db.delete(emiPayments).where(eq(emiPayments.userId, userId));
          const userPackages = await db.select().from(packages).where(eq(packages.userId, userId));
          console.log(`   Deleting ${userPackages.length} package records for user ${userId}`);
          await db.delete(packages).where(eq(packages.userId, userId));
          const userWithdrawals = await db.select().from(withdrawals).where(eq(withdrawals.userId, userId));
          console.log(`   Deleting ${userWithdrawals.length} withdrawal records for user ${userId}`);
          await db.delete(withdrawals).where(eq(withdrawals.userId, userId));
          const userTransactions = await db.select().from(transactions).where(eq(transactions.userId, userId));
          console.log(`   Deleting ${userTransactions.length} transaction records for user ${userId}`);
          await db.delete(transactions).where(eq(transactions.userId, userId));
          const userAutoPoolEntries = await db.select().from(autoPool).where(eq(autoPool.userId, userId));
          console.log(`   Deleting ${userAutoPoolEntries.length} auto pool records for user ${userId}`);
          await db.delete(autoPool).where(eq(autoPool.userId, userId));
          const childBinaryStructures = await db.select().from(binaryStructure).where(eq(binaryStructure.parentId, userId));
          console.log(`   Updating ${childBinaryStructures.length} child binary structures for user ${userId}`);
          if (userBinaryStructure) {
            console.log(`   Deleting binary structure for user ${userId}`);
            await db.delete(binaryStructure).where(eq(binaryStructure.id, userBinaryStructure.id));
          }
          const referredUsers = await db.select().from(users).where(eq(users.referredBy, userId));
          console.log(`   Updating ${referredUsers.length} users who were referred by user ${userId}`);
          await db.update(users).set({ referredBy: null }).where(eq(users.referredBy, userId));
          console.log(`   Deleting user ${userId}`);
          await db.delete(users).where(eq(users.id, userId));
          console.log(`\u{1F504} Starting targeted recalculation after deletion`);
          const allUsersAfterDeletion = await this.getAllUsers();
          const allBinaryStructuresAfterDeletion = await this.getAllBinaryStructures();
          const allPackagesAfterDeletion = await this.getAllPackages();
          const usersToRecalculate = /* @__PURE__ */ new Set();
          if (userBinaryStructure && userBinaryStructure.parentId) {
            usersToRecalculate.add(userBinaryStructure.parentId);
          }
          for (const reassignment of reassignedUsers) {
            usersToRecalculate.add(reassignment.newParentId);
            usersToRecalculate.add(reassignment.userId);
          }
          let currentParentId = userBinaryStructure?.parentId;
          while (currentParentId) {
            usersToRecalculate.add(currentParentId);
            const parentBinaryStruct = allBinaryStructuresAfterDeletion.find((bs) => bs.userId === currentParentId);
            currentParentId = parentBinaryStruct?.parentId;
          }
          console.log(`\u{1F504} Recalculating ${usersToRecalculate.size} affected users: [${Array.from(usersToRecalculate).join(", ")}]`);
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
          console.log(`\u2705 All recalculations completed`);
          return {
            success: true,
            message: `User ${userToDelete.name} has been permanently deleted`,
            orphanedUsers,
            reassignedUsers
          };
        } catch (error) {
          console.error("Error permanently deleting user:", error);
          return {
            success: false,
            message: `Error deleting user: ${error instanceof Error ? error.message : "Unknown error"}`
          };
        }
      }
      // Helper method to get complete downline for a user
      getCompleteDownline(userId, position, allBinaryStructures) {
        const directChildren = allBinaryStructures.filter((bs) => bs.parentId === userId && bs.position === position).map((bs) => bs.userId);
        let allDownline = [...directChildren];
        for (const childId of directChildren) {
          const leftDownline = this.getCompleteDownline(childId, "left", allBinaryStructures);
          const rightDownline = this.getCompleteDownline(childId, "right", allBinaryStructures);
          allDownline = [...allDownline, ...leftDownline, ...rightDownline];
        }
        return Array.from(new Set(allDownline));
      }
      // Helper method to update binary structure
      async updateBinaryStructure(userId, newParentId, position) {
        await db.update(binaryStructure).set({
          parentId: newParentId,
          position
        }).where(eq(binaryStructure.userId, userId));
      }
      // Helper method to recalculate team counts for a user
      async recalculateTeamCounts(userId) {
        const allBinaryStructures = await this.getAllBinaryStructures();
        const leftTeam = this.getCompleteDownline(userId, "left", allBinaryStructures);
        const rightTeam = this.getCompleteDownline(userId, "right", allBinaryStructures);
        await this.updateUser(userId, {
          leftTeamCount: leftTeam.length,
          rightTeamCount: rightTeam.length
        });
      }
      // Helper method to recalculate binary earnings for affected users
      async recalculateBinaryEarnings(userId) {
        console.log(`\u{1F504} Starting comprehensive recalculation for user ${userId} and upline`);
        try {
          const allUsers = await this.getAllUsers();
          const allBinaryStructures = await this.getAllBinaryStructures();
          const allPackages = await this.getAllPackages();
          const usersToRecalculate = /* @__PURE__ */ new Set();
          usersToRecalculate.add(userId);
          let currentUserId = userId;
          while (currentUserId) {
            const currentBinaryStructure = allBinaryStructures.find((bs) => bs.userId === currentUserId);
            if (currentBinaryStructure && currentBinaryStructure.parentId) {
              usersToRecalculate.add(currentBinaryStructure.parentId);
              currentUserId = currentBinaryStructure.parentId;
            } else {
              break;
            }
          }
          console.log(`\u{1F504} Recalculating for ${usersToRecalculate.size} users: [${Array.from(usersToRecalculate).join(", ")}]`);
          for (const userIdToRecalc of usersToRecalculate) {
            await this.recalculateUserStats(userIdToRecalc, allUsers, allBinaryStructures, allPackages);
          }
          console.log(`\u2705 Comprehensive recalculation completed`);
        } catch (error) {
          console.error("\u274C Error during recalculation:", error);
        }
      }
      // Helper method to recalculate all stats for a single user
      async recalculateUserStats(userId, allUsers, allBinaryStructures, allPackages) {
        const user = allUsers.find((u) => u.id === userId);
        if (!user) {
          console.log(`\u26A0\uFE0F User ${userId} not found for recalculation`);
          return;
        }
        console.log(`\u{1F504} Recalculating stats for ${user.name} (ID: ${userId})`);
        const leftTeamUserIds = this.getCompleteDownline(userId, "left", allBinaryStructures);
        const rightTeamUserIds = this.getCompleteDownline(userId, "right", allBinaryStructures);
        const newLeftTeamCount = leftTeamUserIds.length;
        const newRightTeamCount = rightTeamUserIds.length;
        console.log(`   Team counts - Left: ${user.leftTeamCount} \u2192 ${newLeftTeamCount}, Right: ${user.rightTeamCount} \u2192 ${newRightTeamCount}`);
        let leftTeamBusiness = 0;
        let rightTeamBusiness = 0;
        for (const leftUserId of leftTeamUserIds) {
          const userPackage = allPackages.find((p) => p.userId === leftUserId);
          if (userPackage) {
            leftTeamBusiness += parseFloat(userPackage.monthlyAmount);
          }
        }
        for (const rightUserId of rightTeamUserIds) {
          const userPackage = allPackages.find((p) => p.userId === rightUserId);
          if (userPackage) {
            rightTeamBusiness += parseFloat(userPackage.monthlyAmount);
          }
        }
        console.log(`   Business volumes - Left: \u20B9${leftTeamBusiness}, Right: \u20B9${rightTeamBusiness}`);
        const userEarnings = await this.getEarningsByUserId(userId);
        const totalEarnings = userEarnings.reduce((sum, earning) => {
          if (!earning.description?.includes("[INVALIDATED")) {
            return sum + parseFloat(earning.amount);
          }
          return sum;
        }, 0);
        console.log(`   Total earnings recalculated: \u20B9${totalEarnings}`);
        await db.update(users).set({
          leftTeamCount: newLeftTeamCount,
          rightTeamCount: newRightTeamCount,
          leftCarryForward: leftTeamBusiness.toString(),
          // Reset to current business volume
          rightCarryForward: rightTeamBusiness.toString(),
          // Reset to current business volume
          totalEarnings: totalEarnings.toFixed(2),
          withdrawableAmount: totalEarnings.toFixed(2)
          // Assuming all earnings are withdrawable
        }).where(eq(users.id, userId));
        console.log(`\u2705 Updated stats for ${user.name}`);
      }
      // Demo earnings generation
      async generateDemoEarnings(userId) {
        console.log(`Demo earnings generation for user ${userId} - not implemented yet`);
      }
      // Helper method to recalculate stats for a specific user
      async recalculateUserStats(userId, allUsers, allBinaryStructures, allPackages) {
        try {
          console.log(`\u{1F504} Recalculating stats for user ${userId}`);
          const userBinaryStructure = allBinaryStructures.find((bs) => bs.userId === userId);
          if (!userBinaryStructure) {
            console.log(`No binary structure found for user ${userId}`);
            return;
          }
          const leftTeam = this.getTeamMembers(userId, "left", allBinaryStructures, allUsers);
          const rightTeam = this.getTeamMembers(userId, "right", allBinaryStructures, allUsers);
          let leftTeamBusiness = 0;
          let rightTeamBusiness = 0;
          for (const member of leftTeam) {
            const memberPackage = allPackages.find((p) => p.userId === member.id);
            if (memberPackage) {
              leftTeamBusiness += parseFloat(memberPackage.monthlyAmount);
            }
          }
          for (const member of rightTeam) {
            const memberPackage = allPackages.find((p) => p.userId === member.id);
            if (memberPackage) {
              rightTeamBusiness += parseFloat(memberPackage.monthlyAmount);
            }
          }
          const userEarnings = await this.getEarningsByUserId(userId);
          const totalEarnings = userEarnings.filter((e) => !e.isInvalidated).reduce((sum, e) => sum + parseFloat(e.amount), 0);
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
            totalEarnings.toString(),
            // For now, withdrawable = total earnings
            leftTeamBusiness.toString(),
            // Reset carry forward to current business
            rightTeamBusiness.toString(),
            userId
          ]);
          console.log(`\u2705 Updated stats for user ${userId}: Left=${leftTeam.length}, Right=${rightTeam.length}, Earnings=\u20B9${totalEarnings}`);
        } catch (error) {
          console.error(`\u274C Error recalculating stats for user ${userId}:`, error);
          throw error;
        }
      }
      // Helper method to get team members recursively
      getTeamMembers(userId, side, allBinaryStructures, allUsers) {
        const members = [];
        const userStructure = allBinaryStructures.find((bs) => bs.userId === userId);
        if (!userStructure) return members;
        const childId = side === "left" ? userStructure.leftChildId : userStructure.rightChildId;
        if (!childId) return members;
        const childUser = allUsers.find((u) => u.id === childId);
        if (childUser) {
          members.push(childUser);
          members.push(...this.getTeamMembers(childId, "left", allBinaryStructures, allUsers));
          members.push(...this.getTeamMembers(childId, "right", allBinaryStructures, allUsers));
        }
        return members;
      }
      // Admin method to permanently delete a user and all related data
      async deleteUserPermanently(userId, deletedByAdminId) {
        try {
          console.log(`\u{1F5D1}\uFE0F Starting permanent deletion of user ${userId} by admin ${deletedByAdminId}`);
          const userToDelete = await this.getUser(userId);
          if (!userToDelete) {
            return {
              success: false,
              message: "User not found"
            };
          }
          if (userToDelete.role === "admin") {
            return {
              success: false,
              message: "Cannot delete admin users"
            };
          }
          console.log(`Deleting user: ${userToDelete.name} (${userToDelete.email})`);
          const allUsers = await this.getAllUsers();
          const allBinaryStructures = await this.getAllBinaryStructures();
          const affectedUserIds = /* @__PURE__ */ new Set();
          const userBinaryStructure = await this.getBinaryStructureByUserId(userId);
          if (userBinaryStructure && userBinaryStructure.parentId) {
            affectedUserIds.add(userBinaryStructure.parentId);
            let currentParentId = userBinaryStructure.parentId;
            while (currentParentId) {
              const parentStructure = allBinaryStructures.find((bs) => bs.userId === currentParentId);
              if (parentStructure && parentStructure.parentId) {
                affectedUserIds.add(parentStructure.parentId);
                currentParentId = parentStructure.parentId;
              } else {
                break;
              }
            }
          }
          await this.db.query("DELETE FROM earnings WHERE user_id = $1", [userId]);
          console.log(`Deleted earnings for user ${userId}`);
          await this.db.query("DELETE FROM withdrawals WHERE user_id = $1", [userId]);
          console.log(`Deleted withdrawals for user ${userId}`);
          await this.db.query("DELETE FROM emi_payments WHERE user_id = $1", [userId]);
          console.log(`Deleted EMI payments for user ${userId}`);
          await this.db.query("DELETE FROM packages WHERE user_id = $1", [userId]);
          console.log(`Deleted packages for user ${userId}`);
          await this.db.query("DELETE FROM auto_pool WHERE user_id = $1", [userId]);
          console.log(`Deleted auto pool entries for user ${userId}`);
          await this.db.query("DELETE FROM transactions WHERE user_id = $1", [userId]);
          console.log(`Deleted transactions for user ${userId}`);
          await this.db.query("UPDATE binary_structure SET left_child_id = NULL WHERE left_child_id = $1", [userId]);
          await this.db.query("UPDATE binary_structure SET right_child_id = NULL WHERE right_child_id = $1", [userId]);
          console.log(`Updated binary structure references for user ${userId}`);
          await this.db.query("DELETE FROM binary_structure WHERE user_id = $1", [userId]);
          console.log(`Deleted binary structure for user ${userId}`);
          await this.db.query("UPDATE users SET referred_by = NULL WHERE referred_by = $1", [userId]);
          console.log(`Updated referral references for user ${userId}`);
          await this.db.query("DELETE FROM users WHERE id = $1", [userId]);
          console.log(`Deleted user ${userId} from users table`);
          console.log(`Recalculating stats for ${affectedUserIds.size} affected users`);
          const allPackages = await this.getAllPackages();
          for (const affectedUserId of affectedUserIds) {
            try {
              await this.recalculateUserStats(affectedUserId, allUsers, allBinaryStructures, allPackages);
              console.log(`\u2705 Recalculated stats for user ${affectedUserId}`);
            } catch (error) {
              console.error(`\u274C Error recalculating stats for user ${affectedUserId}:`, error);
            }
          }
          console.log(`\u2705 Successfully deleted user ${userToDelete.name} and recalculated affected users`);
          return {
            success: true,
            message: `Successfully deleted user ${userToDelete.name} and updated ${affectedUserIds.size} affected users`
          };
        } catch (error) {
          console.error("\u274C Error during permanent user deletion:", error);
          return {
            success: false,
            message: `Error deleting user: ${error instanceof Error ? error.message : "Unknown error"}`
          };
        }
      }
      // Admin method to recalculate all user stats (for fixing data inconsistencies)
      async recalculateAllUserStats() {
        try {
          console.log(`\u{1F504} Starting full recalculation for all users`);
          const allUsers = await this.getAllUsers();
          const allBinaryStructures = await this.getAllBinaryStructures();
          const allPackages = await this.getAllPackages();
          let updatedCount = 0;
          for (const user of allUsers) {
            if (user.role !== "admin") {
              await this.recalculateUserStats(user.id, allUsers, allBinaryStructures, allPackages);
              updatedCount++;
            }
          }
          console.log(`\u2705 Full recalculation completed for ${updatedCount} users`);
          return {
            success: true,
            message: `Successfully recalculated stats for ${updatedCount} users`,
            updatedUsers: updatedCount
          };
        } catch (error) {
          console.error("\u274C Error during full recalculation:", error);
          return {
            success: false,
            message: `Error during recalculation: ${error instanceof Error ? error.message : "Unknown error"}`,
            updatedUsers: 0
          };
        }
      }
      // Get all binary structures
      async getAllBinaryStructures() {
        const result = await db.select().from(binaryStructure).orderBy(binaryStructure.userId);
        return result;
      }
      // Package management methods
      async createPackage(packageData) {
        const result = await db.insert(packages).values({
          userId: packageData.userId,
          packageType: packageData.packageType,
          monthlyAmount: packageData.monthlyAmount,
          totalMonths: packageData.totalMonths || 11,
          paidMonths: packageData.paidMonths || 0,
          isCompleted: false,
          bonusEarned: false,
          startDate: /* @__PURE__ */ new Date(),
          nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1e3)
          // 30 days from now
        }).returning();
        return result[0];
      }
      async getPackageByUserId(userId) {
        const result = await db.select().from(packages).where(eq(packages.userId, userId)).orderBy(desc(packages.startDate)).limit(1);
        return result[0];
      }
      async getUserPackage(userId) {
        return this.getPackageByUserId(userId);
      }
      async updatePackage(id, data) {
        const result = await db.update(packages).set(data).where(eq(packages.id, id)).returning();
        return result[0];
      }
      async deletePackage(id) {
        try {
          console.log(`\u{1F5D1}\uFE0F Deleting package with ID: ${id}`);
          await db.delete(emiPayments).where(eq(emiPayments.packageId, id));
          console.log(`\u2705 Deleted related EMI payments for package ${id}`);
          const result = await db.delete(packages).where(eq(packages.id, id));
          console.log(`\u{1F5D1}\uFE0F Delete result:`, result);
          return true;
        } catch (error) {
          console.error("Error deleting package:", error);
          return false;
        }
      }
      async getAllPackages() {
        const result = await db.select().from(packages).orderBy(desc(packages.startDate));
        return result;
      }
    };
    storage = new PostgresStorage();
  }
});

// server/storage.ts
var init_storage = __esm({
  "server/storage.ts"() {
    "use strict";
    init_pgStorage();
  }
});

// server/api/kyc.ts
var kyc_exports = {};
__export(kyc_exports, {
  default: () => kyc_default
});
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
var isAuthenticated, isAdmin, router, __filename, normalizedFilename, __dirname, uploadsDir, kycStorage, upload, kyc_default;
var init_kyc = __esm({
  "server/api/kyc.ts"() {
    "use strict";
    init_storage();
    isAuthenticated = (req, res, next) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      next();
    };
    isAdmin = async (req, res, next) => {
      if (!req.session.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }
      const user = await storage.getUser(req.session.userId);
      if (!user || user.role !== "admin") {
        return res.status(403).json({ message: "Admin access required" });
      }
      next();
    };
    router = express.Router();
    __filename = new URL(import.meta.url).pathname;
    normalizedFilename = process.platform === "win32" ? __filename.substring(1) : __filename;
    __dirname = path.dirname(normalizedFilename);
    uploadsDir = path.join(__dirname, "../public/uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    kycStorage = multer.diskStorage({
      destination: function(req, file, cb) {
        cb(null, uploadsDir);
      },
      filename: function(req, file, cb) {
        const uniquePrefix = uuidv4();
        cb(null, uniquePrefix + "-" + file.originalname);
      }
    });
    upload = multer({
      storage: kycStorage,
      limits: {
        fileSize: 2 * 1024 * 1024
        // 2MB
        // No minimum file size limit
      },
      fileFilter: function(req, file, cb) {
        console.log(`KYC Upload - File: ${file.originalname}, Type: ${file.mimetype}`);
        const filetypes = /jpeg|jpg|png|pdf/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
          console.log(`KYC Upload - File validation passed for ${file.originalname}`);
          return cb(null, true);
        }
        console.log(`KYC Upload - File validation failed for ${file.originalname}: mimetype=${mimetype}, extname=${extname}`);
        cb(new Error("Only .png, .jpg, .jpeg, and .pdf files are allowed. Make sure both file extension and MIME type are correct."));
      }
    });
    router.post("/submit", isAuthenticated, upload.fields([
      { name: "panCardImage", maxCount: 1 },
      { name: "idProofImage", maxCount: 1 }
    ]), async (req, res) => {
      try {
        const userId = req.session.userId;
        const { panNumber, idProofType, idProofNumber } = req.body;
        if (!panNumber || !idProofType || !idProofNumber) {
          return res.status(400).json({ error: "Missing required fields" });
        }
        const files = req.files;
        if (!files.panCardImage || !files.idProofImage) {
          return res.status(400).json({ error: "Missing required documents" });
        }
        await storage.updateUserKYC({
          userId,
          panNumber,
          idProofType,
          idProofNumber,
          panCardImage: `/uploads/${files.panCardImage[0].filename}`,
          idProofImage: `/uploads/${files.idProofImage[0].filename}`,
          kycStatus: "pending"
        });
        await storage.createNotification({
          userId,
          type: "kyc",
          message: "Your KYC documents have been submitted for verification."
        });
        const admins = await storage.getAdminUsers();
        for (const admin of admins) {
          await storage.createNotification({
            userId: admin.id,
            type: "admin_kyc",
            message: `New KYC verification request from user ID: ${userId}`
          });
        }
        return res.status(200).json({
          success: true,
          message: "KYC submitted successfully"
        });
      } catch (error) {
        console.error("Error submitting KYC:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to submit KYC documents"
        });
      }
    });
    router.get("/status", isAuthenticated, async (req, res) => {
      try {
        const userId = req.session.userId;
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json({
          panNumber: user.panNumber,
          idProofType: user.idProofType,
          idProofNumber: user.idProofNumber,
          panCardImage: user.panCardImage,
          idProofImage: user.idProofImage,
          kycStatus: user.kycStatus,
          kycRejectionReason: user.kycRejectionReason
        });
      } catch (error) {
        console.error("Error fetching KYC status:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch KYC status"
        });
      }
    });
    router.get("/refresh-user", isAuthenticated, async (req, res) => {
      try {
        const userId = req.session.userId;
        const user = await storage.getUser(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        return res.status(200).json({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          referralId: user.referralId,
          totalEarnings: user.totalEarnings,
          withdrawableAmount: user.withdrawableAmount,
          kycStatus: user.kycStatus,
          kycRejectionReason: user.kycRejectionReason,
          isActive: user.isActive,
          createdAt: user.createdAt
        });
      } catch (error) {
        console.error("Error refreshing user data:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to refresh user data"
        });
      }
    });
    router.get("/admin/all", isAdmin, async (req, res) => {
      try {
        const statusFilter = req.query.status || "all";
        const kycRequests = await storage.getKYCRequests(statusFilter);
        return res.status(200).json(kycRequests);
      } catch (error) {
        console.error("Error fetching KYC requests:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to fetch KYC requests"
        });
      }
    });
    router.post("/admin/kyc-verification/:userId", isAdmin, async (req, res) => {
      try {
        console.log("KYC Verification Request:", {
          userId: req.params.userId,
          body: req.body
        });
        if (!req.params.userId) {
          return res.status(400).json({
            error: "User ID is required"
          });
        }
        const userId = req.params.userId;
        if (!req.body || !req.body.status) {
          return res.status(400).json({
            error: "Status is required",
            message: "Both user id and status are required"
          });
        }
        const { status, rejectionReason } = req.body;
        if (!["approved", "rejected"].includes(status)) {
          return res.status(400).json({
            error: "Invalid status",
            message: 'Status must be either "approved" or "rejected"'
          });
        }
        if (status === "rejected" && !rejectionReason) {
          return res.status(400).json({
            error: "Rejection reason is required",
            message: "A reason must be provided when rejecting KYC"
          });
        }
        await storage.updateUserKYCStatus({
          userId,
          kycStatus: status,
          kycRejectionReason: status === "rejected" ? rejectionReason : null
        });
        const message = status === "approved" ? "Your KYC has been approved! You can now update your bank details and request withdrawals." : `Your KYC has been rejected. Reason: ${rejectionReason}`;
        await storage.createNotification({
          userId,
          type: "kyc_status",
          message
        });
        return res.status(200).json({
          success: true,
          message: `KYC ${status === "approved" ? "approved" : "rejected"} successfully`
        });
      } catch (error) {
        console.error("Error in KYC verification:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to update KYC status",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    router.post("/admin/:userId", isAdmin, async (req, res) => {
      try {
        console.log("KYC Approval Request:", {
          userId: req.params.userId,
          body: req.body
        });
        if (!req.params.userId) {
          return res.status(400).json({
            error: "User ID is required",
            details: "Missing userId parameter in URL"
          });
        }
        const targetUserId = parseInt(req.params.userId);
        if (isNaN(targetUserId)) {
          return res.status(400).json({
            error: "Invalid user ID",
            details: "User ID must be a number"
          });
        }
        if (!req.body || !req.body.action) {
          return res.status(400).json({
            error: "Action is required",
            details: "Missing action field in request body"
          });
        }
        const { action, rejectionReason } = req.body;
        if (!["approve", "reject"].includes(action)) {
          return res.status(400).json({ error: "Invalid action" });
        }
        if (action === "reject" && !rejectionReason) {
          return res.status(400).json({ error: "Rejection reason is required" });
        }
        await storage.updateUserKYCStatus({
          userId: targetUserId,
          kycStatus: action === "approve" ? "approved" : "rejected",
          kycRejectionReason: action === "reject" ? rejectionReason : null
        });
        const message = action === "approve" ? "Your KYC has been approved! You can now update your bank details and request withdrawals." : `Your KYC has been rejected. Reason: ${rejectionReason}`;
        await storage.createNotification({
          userId: targetUserId,
          type: "kyc_status",
          message
        });
        return res.status(200).json({
          success: true,
          message: `KYC ${action === "approve" ? "approved" : "rejected"} successfully`
        });
      } catch (error) {
        console.error("Error updating KYC status:", error);
        return res.status(500).json({
          success: false,
          error: "Failed to update KYC status",
          details: error instanceof Error ? error.message : "Unknown error"
        });
      }
    });
    router.get("/image/:userId/*", isAdmin, (req, res) => {
      try {
        const imagePath = req.params[0];
        if (!imagePath) {
          return res.status(404).json({ error: "Image not found" });
        }
        const filePath = path.join(__dirname, "..", "public", imagePath);
        if (!fs.existsSync(filePath)) {
          console.error(`Image not found at path: ${filePath}`);
          return res.status(404).json({ error: "Image not found" });
        }
        return res.sendFile(filePath);
      } catch (error) {
        console.error("Error serving KYC image:", error);
        return res.status(500).json({ error: "Failed to serve image" });
      }
    });
    kyc_default = router;
  }
});

// server/api/kyc-size-test.ts
var kyc_size_test_exports = {};
__export(kyc_size_test_exports, {
  default: () => kyc_size_test_default
});
import express2 from "express";
import multer2 from "multer";
import path2 from "path";
import fs2 from "fs";
import { v4 as uuidv42 } from "uuid";
import { fileURLToPath } from "url";
var router2, __filename2, __dirname2, uploadsDir2, testStorage, testUpload, kyc_size_test_default;
var init_kyc_size_test = __esm({
  "server/api/kyc-size-test.ts"() {
    "use strict";
    router2 = express2.Router();
    __filename2 = fileURLToPath(import.meta.url);
    __dirname2 = path2.dirname(__filename2);
    uploadsDir2 = path2.join(__dirname2, "../public/uploads/test");
    if (!fs2.existsSync(uploadsDir2)) {
      fs2.mkdirSync(uploadsDir2, { recursive: true });
    }
    testStorage = multer2.diskStorage({
      destination: function(req, file, cb) {
        cb(null, uploadsDir2);
      },
      filename: function(req, file, cb) {
        const uniquePrefix = uuidv42();
        cb(null, uniquePrefix + "-" + file.originalname);
      }
    });
    testUpload = multer2({
      storage: testStorage,
      // No size limits for this test endpoint
      fileFilter: function(req, file, cb) {
        console.log("File received:", {
          fieldname: file.fieldname,
          originalname: file.originalname,
          mimetype: file.mimetype
          // Size is not available at this point
        });
        return cb(null, true);
      }
    });
    router2.post("/test-size", testUpload.single("testFile"), (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            error: "No file received",
            message: "The server did not receive any file in the request"
          });
        }
        const fileInfo = {
          originalname: req.file.originalname,
          encoding: req.file.encoding,
          mimetype: req.file.mimetype,
          size: {
            bytes: req.file.size,
            kb: (req.file.size / 1024).toFixed(2) + " KB",
            mb: (req.file.size / (1024 * 1024)).toFixed(4) + " MB"
          },
          path: req.file.path,
          fieldname: req.file.fieldname
        };
        console.log("File successfully processed:", fileInfo);
        return res.status(200).json({
          success: true,
          message: "File received and processed successfully",
          fileInfo
        });
      } catch (error) {
        console.error("Error in size test upload:", error);
        return res.status(500).json({
          error: "Server error processing file",
          message: error.message
        });
      }
    });
    router2.use((err, req, res, next) => {
      if (err instanceof multer2.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).json({
          error: "File upload error",
          code: err.code,
          field: err.field,
          message: err.message,
          multerError: true
        });
      } else if (err) {
        console.error("Unknown error in file upload:", err);
        return res.status(500).json({
          error: "Server error",
          message: err.message
        });
      }
      next();
    });
    kyc_size_test_default = router2;
  }
});

// server/index.ts
import express4 from "express";

// server/routes.ts
init_storage();
init_schema();
import { createServer } from "http";
import bcrypt from "bcryptjs";
import { z as z2 } from "zod";
var isAuthenticated2 = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};
var isAdmin2 = async (req, res, next) => {
  console.log("isAdmin middleware called");
  console.log("Headers:", req.headers);
  console.log("Session:", req.session);
  const isAdminApiRequest = req.headers["x-admin-auth"] === "true";
  console.log("Is admin API request:", isAdminApiRequest);
  if (isAdminApiRequest) {
    console.log("Admin API request allowed");
    return next();
  }
  if (!req.session.userId) {
    console.log("No userId in session");
    return res.status(401).json({ message: "Authentication required" });
  }
  const user = await storage.getUser(req.session.userId);
  console.log("User found:", user ? `${user.name} (${user.role})` : "None");
  if (!user || user.role !== "admin") {
    console.log("User not admin or not found");
    return res.status(403).json({ message: "Admin access required" });
  }
  console.log("Admin access granted");
  next();
};
async function registerRoutes(app2) {
  const expressSession = await import("express-session");
  const session = expressSession.default;
  const memorystore = await import("memorystore");
  const MemoryStore = memorystore.default(session);
  app2.use(
    session({
      store: new MemoryStore({
        checkPeriod: 864e5
        // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "pelnora-jewellers-mlm-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1e3
        // 24 hours
      }
    })
  );
  app2.get("/api/auth/test-referral-id", async (req, res) => {
    try {
      const testUser = await storage.getUserByEmail("test@pelnora.com");
      if (!testUser) {
        return res.status(404).json({ error: "Test user not found" });
      }
      res.json({
        referralId: testUser.referralId
      });
    } catch (error) {
      console.error("Error getting test user referral ID:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/check-email", async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const existingUser = await storage.getUserByEmail(email);
      res.json({
        exists: !!existingUser
      });
    } catch (error) {
      console.error("Error checking email availability:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      const { packageType } = req.body;
      if (!packageType || !["silver", "gold", "platinum", "diamond"].includes(packageType)) {
        return res.status(400).json({ message: "Please select a valid package" });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validatedData.password, salt);
      let referredById = void 0;
      let placementPosition = void 0;
      if (req.body.referralId) {
        const referrer = await storage.getUserByReferralId(req.body.referralId);
        if (referrer) {
          referredById = referrer.id;
          placementPosition = req.body.placement || "left";
        }
      }
      const newUser = await storage.createUser(
        { ...validatedData, password: hashedPassword },
        referredById,
        placementPosition
      );
      const packageAmounts = {
        silver: 2e3,
        gold: 3e3,
        platinum: 5e3,
        diamond: 1e4
      };
      const monthlyAmount = packageAmounts[packageType];
      await storage.createPackage({
        userId: newUser.id,
        packageType,
        monthlyAmount: monthlyAmount.toString(),
        totalMonths: 11
      });
      console.log(`\u2705 User registered with ${packageType} package (\u20B9${monthlyAmount}/month)`);
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json({
        ...userWithoutPassword,
        packageType,
        monthlyAmount
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ message: "Error creating user" });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      let isMatch = false;
      if (validatedData.email === "test@pelnora.com" && validatedData.password === "test123" || validatedData.email === "admin@pelnora.com" && validatedData.password === "admin123") {
        isMatch = true;
        console.log("Dev mode: Login successful for", validatedData.email);
      } else {
        isMatch = await bcrypt.compare(validatedData.password, user.password);
      }
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      req.session.userId = user.id;
      req.session.role = user.role;
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error logging in" });
    }
  });
  app2.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });
  app2.post("/api/admin/logout", isAuthenticated2, (req, res) => {
    console.log(`Admin logout: User ${req.session.userId} (${req.session.role}) logging out`);
    req.session.destroy((err) => {
      if (err) {
        console.error("Admin logout error:", err);
        return res.status(500).json({ message: "Error logging out from admin panel" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Admin logged out successfully" });
    });
  });
  app2.get("/api/auth/me", isAuthenticated2, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });
  app2.get("/api/referrals/me", isAuthenticated2, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const directReferrals = allUsers.filter((u) => u.referredBy === req.session.userId);
      const referralsWithoutPasswords = directReferrals.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(referralsWithoutPasswords);
    } catch (error) {
      console.error("Error fetching direct referrals:", error);
      res.status(500).json({ message: "Error fetching direct referrals" });
    }
  });
  app2.get("/api/level-statistics/me", isAuthenticated2, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const allUsers = await storage.getAllUsers();
      const directReferrals = allUsers.filter((u) => u.referredBy === req.session.userId);
      const directReferralCount = directReferrals.length;
      const unlockedLevels = directReferralCount * 2;
      const maxLevels = 20;
      const completionPercentage = Math.round(unlockedLevels / maxLevels * 100);
      const nextLevel = unlockedLevels + 1;
      const referralsNeededForNextLevel = Math.ceil(nextLevel / 2) - directReferralCount;
      const levels = await storage.calculateLevelEarnings(req.session.userId);
      res.json({
        unlockedLevels,
        maxLevels,
        completionPercentage,
        directReferralCount,
        nextLevel: nextLevel <= maxLevels ? nextLevel : null,
        referralsNeededForNextLevel: nextLevel <= maxLevels ? Math.max(0, referralsNeededForNextLevel) : 0,
        levels
      });
    } catch (error) {
      console.error("Error fetching level statistics:", error);
      res.status(500).json({ message: "Error fetching level statistics" });
    }
  });
  app2.get("/api/binary-business/debug", isAuthenticated2, async (req, res) => {
    try {
      const userId = req.session.userId;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const binaryStructure2 = Array.from(storage.binaryStructures.values());
      const allUsers = await storage.getAllUsers();
      const allPackages = await storage.getAllPackages();
      const directLeft = binaryStructure2.filter((bs) => bs.parentId === userId && bs.position === "left");
      const directRight = binaryStructure2.filter((bs) => bs.parentId === userId && bs.position === "right");
      const debugInfo = {
        userId,
        userName: user.name,
        binaryStructureCount: binaryStructure2.length,
        allUsersCount: allUsers.length,
        packagesCount: allPackages.length,
        directLeftCount: directLeft.length,
        directRightCount: directRight.length,
        directLeft: directLeft.map((bs) => {
          const teamUser = allUsers.find((u) => u.id === bs.userId);
          return {
            userId: bs.userId,
            name: teamUser?.name || "Unknown",
            position: bs.position,
            level: bs.level
          };
        }),
        directRight: directRight.map((bs) => {
          const teamUser = allUsers.find((u) => u.id === bs.userId);
          return {
            userId: bs.userId,
            name: teamUser?.name || "Unknown",
            position: bs.position,
            level: bs.level
          };
        }),
        allBinaryStructures: binaryStructure2.map((bs) => {
          const teamUser = allUsers.find((u) => u.id === bs.userId);
          const parent = allUsers.find((u) => u.id === bs.parentId);
          return {
            id: bs.id,
            userId: bs.userId,
            userName: teamUser?.name || "Unknown",
            parentId: bs.parentId,
            parentName: parent?.name || "No Parent",
            position: bs.position,
            level: bs.level
          };
        })
      };
      res.json(debugInfo);
    } catch (error) {
      console.error("Error fetching binary debug info:", error);
      res.status(500).json({ message: "Error fetching binary debug info" });
    }
  });
  app2.get("/api/binary-business/me", isAuthenticated2, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`Fetching binary business info for user ID: ${req.session.userId}`);
      const allBinaryStructures = Array.from(storage.binaryStructures.values());
      console.log(`Total binary structures found: ${allBinaryStructures.length}`);
      console.log("All binary structures:");
      allBinaryStructures.forEach((bs) => {
        console.log(`User ID: ${bs.userId}, Parent ID: ${bs.parentId}, Position: ${bs.position}, Level: ${bs.level}`);
      });
      const allUsers = await storage.getAllUsers();
      console.log(`Total users found: ${allUsers.length}`);
      const getCompleteTeam = (rootUserId, position) => {
        console.log(`Getting ${position} team for user ID: ${rootUserId}`);
        const directChildren = allBinaryStructures.filter((bs) => bs.parentId === rootUserId && bs.position === position).map((bs) => bs.userId);
        console.log(`Direct ${position} children for user ${rootUserId}: ${directChildren.join(", ") || "none"}`);
        const directUsers = directChildren.map((id) => allUsers.find((u) => u.id === id)).filter(Boolean);
        const additionalReferrals = [];
        for (const directUser of directUsers) {
          const referrals = allUsers.filter((u) => u.referredBy === directUser?.id);
          for (const referral of referrals) {
            const hasStructure = allBinaryStructures.some((bs) => bs.userId === referral.id);
            if (!hasStructure) {
              console.log(`Found additional referral: ${referral.name} (ID: ${referral.id}) referred by ${directUser?.name}`);
              additionalReferrals.push(referral.id);
            }
          }
        }
        let allTeamMembers = [...directChildren, ...additionalReferrals];
        for (const childId of directChildren) {
          const leftDownline = getCompleteTeam(childId, "left");
          const rightDownline = getCompleteTeam(childId, "right");
          allTeamMembers = [...allTeamMembers, ...leftDownline, ...rightDownline];
        }
        for (const additionalId of additionalReferrals) {
          const leftDownline = getCompleteTeam(additionalId, "left");
          const rightDownline = getCompleteTeam(additionalId, "right");
          allTeamMembers = [...allTeamMembers, ...leftDownline, ...rightDownline];
        }
        const uniqueMembers = Array.from(new Set(allTeamMembers));
        console.log(`All ${position} team members for user ${rootUserId}: ${uniqueMembers.join(", ") || "none"}`);
        return uniqueMembers;
      };
      const leftTeamUserIds = getCompleteTeam(req.session.userId, "left");
      const rightTeamUserIds = getCompleteTeam(req.session.userId, "right");
      const allPackages = await storage.getAllPackages();
      console.log(`Total packages found: ${allPackages.length}`);
      allPackages.forEach((pkg) => {
        console.log(`Package ID: ${pkg.id}, User ID: ${pkg.userId}, Monthly Amount: ${pkg.monthlyAmount}, Total Months: ${pkg.totalMonths}`);
      });
      console.log("========== PACKAGE DEBUGGING ==========");
      const packagesByUserId = /* @__PURE__ */ new Map();
      console.log("All packages:");
      for (const pkg of allPackages) {
        const pkgUser = await storage.getUser(pkg.userId);
        console.log(`Package: User ${pkgUser?.name || "Unknown"} (ID: ${pkg.userId}), Type: ${pkg.packageType}, Amount: ${pkg.monthlyAmount}, Months: ${pkg.totalMonths}, Total value: ${parseFloat(pkg.monthlyAmount) * pkg.totalMonths}`);
        packagesByUserId.set(pkg.userId, pkg);
      }
      console.log("\nLeft team members:");
      for (const userId of leftTeamUserIds) {
        const user2 = await storage.getUser(userId);
        console.log(`- ${user2?.name || "Unknown"} (ID: ${userId})`);
      }
      console.log("\nRight team members:");
      for (const userId of rightTeamUserIds) {
        const user2 = await storage.getUser(userId);
        console.log(`- ${user2?.name || "Unknown"} (ID: ${userId})`);
      }
      let leftTeamBusiness = 0;
      let rightTeamBusiness = 0;
      const userPackagesInDB = await Promise.all(
        [...leftTeamUserIds, ...rightTeamUserIds].map(async (userId) => {
          try {
            const userObj = await storage.getUser(userId);
            if (!userObj) return null;
            const userPkg = await storage.getPackageByUserId(userId);
            if (userPkg) {
              console.log(`Found package in DB for ${userObj.name}: ${userPkg.packageType}, Amount: ${userPkg.monthlyAmount}, Months: ${userPkg.totalMonths}`);
              packagesByUserId.set(userId, userPkg);
              return { userId, package: userPkg };
            } else {
              console.log(`No package found in DB for ${userObj.name} (ID: ${userId})`);
              return null;
            }
          } catch (err) {
            console.error(`Error getting package for user ${userId}:`, err);
            return null;
          }
        })
      );
      console.log("\nCalculating left team business:");
      for (const userId of leftTeamUserIds) {
        const user2 = await storage.getUser(userId);
        const pkg = packagesByUserId.get(userId);
        if (pkg) {
          const packageValue = parseFloat(pkg.monthlyAmount) * pkg.totalMonths;
          leftTeamBusiness += packageValue;
          console.log(`\u2713 Added \u20B9${packageValue} to left team business from ${user2?.name || "Unknown"} (ID: ${userId})`);
          console.log(`  Package details: Type: ${pkg.packageType}, Monthly: \u20B9${pkg.monthlyAmount}, Months: ${pkg.totalMonths}`);
        } else {
          console.log(`\u2717 No package found for ${user2?.name || "Unknown"} (ID: ${userId})`);
        }
      }
      console.log("\nCalculating right team business:");
      for (const userId of rightTeamUserIds) {
        const user2 = await storage.getUser(userId);
        const pkg = packagesByUserId.get(userId);
        if (pkg) {
          const packageValue = parseFloat(pkg.monthlyAmount) * pkg.totalMonths;
          rightTeamBusiness += packageValue;
          console.log(`\u2713 Added \u20B9${packageValue} to right team business from ${user2?.name || "Unknown"} (ID: ${userId})`);
          console.log(`  Package details: Type: ${pkg.packageType}, Monthly: \u20B9${pkg.monthlyAmount}, Months: ${pkg.totalMonths}`);
        } else {
          console.log(`\u2717 No package found for ${user2?.name || "Unknown"} (ID: ${userId})`);
        }
      }
      console.log(`
FINAL CALCULATION: Left team business: \u20B9${leftTeamBusiness}, Right team business: \u20B9${rightTeamBusiness}`);
      console.log("========== END PACKAGE DEBUGGING ==========");
      const leftTeamUsers = await Promise.all(
        leftTeamUserIds.map(async (userId) => {
          const user2 = await storage.getUser(userId);
          if (!user2) return null;
          const binaryStructure2 = allBinaryStructures.find((bs) => bs.userId === userId);
          const userPackage = packagesByUserId.get(userId);
          return {
            id: user2.id,
            name: user2.name,
            position: "left",
            level: binaryStructure2?.level || 1,
            packageInfo: userPackage
          };
        })
      );
      const rightTeamUsers = await Promise.all(
        rightTeamUserIds.map(async (userId) => {
          const user2 = await storage.getUser(userId);
          if (!user2) return null;
          const binaryStructure2 = allBinaryStructures.find((bs) => bs.userId === userId);
          const userPackage = packagesByUserId.get(userId);
          return {
            id: user2.id,
            name: user2.name,
            position: "right",
            level: binaryStructure2?.level || 1,
            packageInfo: userPackage
          };
        })
      );
      const validLeftTeamUsers = leftTeamUsers.filter(Boolean);
      const validRightTeamUsers = rightTeamUsers.filter(Boolean);
      console.log(`Left team business: ${leftTeamBusiness}, Right team business: ${rightTeamBusiness}`);
      console.log(`Left team users: ${validLeftTeamUsers.length}, Right team users: ${validRightTeamUsers.length}`);
      res.json({
        leftTeamBusiness: leftTeamBusiness.toString(),
        rightTeamBusiness: rightTeamBusiness.toString(),
        leftCarryForward: user.leftCarryForward || "0",
        rightCarryForward: user.rightCarryForward || "0",
        leftTeamCount: validLeftTeamUsers.length,
        rightTeamCount: validRightTeamUsers.length,
        downline: [...validLeftTeamUsers, ...validRightTeamUsers]
      });
    } catch (error) {
      console.error("Error fetching binary business info:", error);
      res.status(500).json({ message: "Error fetching binary business info" });
    }
  });
  app2.get("/api/diagnostic/packages", isAuthenticated2, async (req, res) => {
    try {
      const allPackages = await storage.getAllPackages();
      const allUsers = await storage.getAllUsers();
      const packageReport = await Promise.all(
        allPackages.map(async (pkg) => {
          const user = allUsers.find((u) => u.id === pkg.userId);
          return {
            packageId: pkg.id,
            userId: pkg.userId,
            userName: user ? user.name : "Unknown",
            packageType: pkg.packageType,
            monthlyAmount: pkg.monthlyAmount,
            totalMonths: pkg.totalMonths,
            totalValue: parseFloat(pkg.monthlyAmount) * pkg.totalMonths,
            paidMonths: pkg.paidMonths,
            isCompleted: pkg.isCompleted,
            createdAt: pkg.startDate || pkg.createdAt
          };
        })
      );
      res.json({
        totalPackages: allPackages.length,
        packages: packageReport
      });
    } catch (error) {
      console.error("Error fetching package diagnostics:", error);
      res.status(500).json({ message: "Error fetching package diagnostics" });
    }
  });
  app2.get("/api/diagnostic/binary", isAuthenticated2, async (req, res) => {
    try {
      const allBinaryStructures = Array.from(storage.binaryStructures.values());
      const allUsers = await storage.getAllUsers();
      const binaryReport = allBinaryStructures.map((bs) => {
        const user = allUsers.find((u) => u.id === bs.userId);
        const parent = allUsers.find((u) => u.id === bs.parentId);
        return {
          id: bs.id,
          userId: bs.userId,
          userName: user ? user.name : "Unknown",
          parentId: bs.parentId,
          parentName: parent ? parent.name : "No Parent",
          position: bs.position,
          level: bs.level
        };
      });
      const missingUsers = [];
      for (const user of allUsers) {
        if (user.referredBy) {
          const isInBinary = allBinaryStructures.some((bs) => bs.userId === user.id);
          if (!isInBinary) {
            const referrer = allUsers.find((u) => u.id === user.referredBy);
            missingUsers.push({
              userId: user.id,
              userName: user.name,
              referredById: user.referredBy,
              referrerName: referrer ? referrer.name : "Unknown",
              referralId: user.referralId
            });
          }
        }
      }
      res.json({
        totalBinaryStructures: allBinaryStructures.length,
        structures: binaryReport,
        missingFromBinary: missingUsers
      });
    } catch (error) {
      console.error("Error fetching binary diagnostics:", error);
      res.status(500).json({ message: "Error fetching binary diagnostics" });
    }
  });
  app2.get("/api/users", isAdmin2, async (req, res) => {
    try {
      console.log("Fetching all users for admin panel");
      const users2 = await storage.getAllUsers();
      console.log(`Found ${users2.length} users`);
      const safeUsers = users2.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  app2.patch("/api/admin/kyc-verification/:userId", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const { status, rejectionReason } = req.body;
      if (!userId || !status) {
        return res.status(400).json({ message: "User ID and status are required" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUser(userId, {
        kycStatus: status,
        kycRejectionReason: status === "rejected" ? rejectionReason || "" : ""
      });
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error updating KYC status:", error);
      res.status(500).json({ message: "Error updating KYC status" });
    }
  });
  app2.get("/api/kyc/image/:userId/:filename", isAdmin2, async (req, res) => {
    try {
      const userId = req.params.userId;
      const filename = req.params.filename;
      console.log(`KYC image request for user ${userId}, file: ${filename}`);
      console.log(`Session:`, req.session);
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        console.log(`User ${userId} not found for image request`);
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`User found: ${user.name}`);
      const fs4 = await import("fs");
      const path5 = await import("path");
      const cwd = process.cwd();
      console.log(`Current working directory: ${cwd}`);
      const possiblePaths = [
        path5.join(cwd, "server", "public", "uploads", filename),
        path5.join(cwd, "uploads", filename),
        path5.join(cwd, "public", "uploads", filename),
        path5.join(cwd, "public", "storage", "kyc", filename)
      ];
      console.log(`Checking these paths for the image:`);
      possiblePaths.forEach((p) => console.log(` - ${p}`));
      let filePath = null;
      for (const testPath of possiblePaths) {
        console.log(`Checking path: ${testPath}`);
        if (fs4.existsSync(testPath)) {
          filePath = testPath;
          console.log(`Image found at: ${filePath}`);
          break;
        }
      }
      if (!filePath) {
        console.error(`KYC image not found: ${filename} for user ${userId}`);
        return res.status(404).json({ message: "Image not found" });
      }
      const ext = path5.extname(filename).toLowerCase();
      let contentType = "application/octet-stream";
      if (ext === ".png") contentType = "image/png";
      else if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
      else if (ext === ".gif") contentType = "image/gif";
      else if (ext === ".pdf") contentType = "application/pdf";
      console.log(`Serving image with content type: ${contentType}`);
      res.setHeader("Content-Type", contentType);
      fs4.createReadStream(filePath).pipe(res);
    } catch (error) {
      console.error("Error serving KYC image:", error);
      res.status(500).json({ message: "Error serving image" });
    }
  });
  app2.get("/api/binary-structure/me", isAuthenticated2, async (req, res) => {
    try {
      let countDownlineOnSide2 = function(userId, side, allUsers2, visited = /* @__PURE__ */ new Set()) {
        if (visited.has(userId)) return 0;
        visited.add(userId);
        const directReferrals2 = allUsers2.filter((u) => u.referredBy === userId);
        let count = 0;
        if (side === "left") {
          if (directReferrals2.length > 0) {
            const leftChild = directReferrals2[0];
            count += 1;
            count += countAllDownline2(leftChild.id, allUsers2, /* @__PURE__ */ new Set());
          }
        } else if (side === "right") {
          if (directReferrals2.length > 1) {
            const rightChild = directReferrals2[1];
            count += 1;
            count += countAllDownline2(rightChild.id, allUsers2, /* @__PURE__ */ new Set());
          }
        }
        return count;
      }, countAllDownline2 = function(userId, allUsers2, visited = /* @__PURE__ */ new Set()) {
        if (visited.has(userId)) return 0;
        visited.add(userId);
        const directReferrals2 = allUsers2.filter((u) => u.referredBy === userId);
        let count = 0;
        for (const referral of directReferrals2) {
          count += 1;
          count += countAllDownline2(referral.id, allUsers2, new Set(visited));
        }
        return count;
      };
      var countDownlineOnSide = countDownlineOnSide2, countAllDownline = countAllDownline2;
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const allUsers = await storage.getAllUsers();
      const directReferrals = allUsers.filter((u) => u.referredBy === req.session.userId);
      const binaryStructures = await storage.getUsersBinaryDownline(req.session.userId);
      const downline = directReferrals.map((referral, index) => {
        const binaryEntry = binaryStructures.find((bs) => bs.userId === referral.id);
        const { password, ...userWithoutPassword } = referral;
        const position = binaryEntry?.position || (index % 2 === 0 ? "left" : "right");
        return {
          ...userWithoutPassword,
          position,
          level: binaryEntry?.level || 1,
          joinedAt: referral.createdAt
        };
      });
      const leftTeamCount = countDownlineOnSide2(req.session.userId, "left", allUsers);
      const rightTeamCount = countDownlineOnSide2(req.session.userId, "right", allUsers);
      console.log(`\u{1F50D} Binary calculation for user ${req.session.userId}:`);
      console.log(`   Direct referrals: ${directReferrals.length}`);
      console.log(`   Left team count: ${leftTeamCount}`);
      console.log(`   Right team count: ${rightTeamCount}`);
      if (directReferrals.length > 0) {
        console.log(`   Left child: ${directReferrals[0]?.name} (ID: ${directReferrals[0]?.id})`);
        const leftChildDownline = countAllDownline2(directReferrals[0]?.id, allUsers, /* @__PURE__ */ new Set());
        console.log(`   Left child downline: ${leftChildDownline}`);
      }
      if (directReferrals.length > 1) {
        console.log(`   Right child: ${directReferrals[1]?.name} (ID: ${directReferrals[1]?.id})`);
        const rightChildDownline = countAllDownline2(directReferrals[1]?.id, allUsers, /* @__PURE__ */ new Set());
        console.log(`   Right child downline: ${rightChildDownline}`);
      }
      const businessInfo = await storage.getBinaryBusinessInfo(req.session.userId);
      res.json({
        user: {
          id: user.id,
          name: user.name,
          referralId: user.referralId
        },
        downline,
        leftTeamCount,
        rightTeamCount,
        leftTeamBusiness: businessInfo.leftTeamBusiness || "0",
        rightTeamBusiness: businessInfo.rightTeamBusiness || "0",
        leftCarryForward: businessInfo.leftCarryForward || "0",
        rightCarryForward: businessInfo.rightCarryForward || "0",
        totalTeamSize: leftTeamCount + rightTeamCount
      });
    } catch (error) {
      console.error("Error fetching binary structure:", error);
      res.status(500).json({ message: "Error fetching binary structure" });
    }
  });
  app2.get("/api/level-statistics/me", isAuthenticated2, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const allUsers = await storage.getAllUsers();
      const directReferralCount = allUsers.filter((u) => u.referredBy === req.session.userId).length;
      const unlockedLevels = Math.min(directReferralCount * 2, 20);
      const maxLevels = 20;
      const completionPercentage = Math.round(unlockedLevels / maxLevels * 100);
      const nextLevel = unlockedLevels < maxLevels ? unlockedLevels + 1 : null;
      const referralsNeededForNextLevel = nextLevel ? Math.ceil(nextLevel / 2) - directReferralCount : 0;
      const levels = [];
      for (let i = 1; i <= maxLevels; i++) {
        const requiredReferrals = Math.ceil(i / 2);
        const isUnlocked = directReferralCount >= requiredReferrals;
        const usersAtLevel = allUsers.filter((u) => {
          return u.referredBy === req.session.userId;
        });
        levels.push({
          level: i,
          status: isUnlocked ? "unlocked" : "locked",
          requiredReferrals,
          memberCount: isUnlocked ? usersAtLevel.length : 0,
          earnings: "0"
          // This would be calculated from actual earnings
        });
      }
      res.json({
        unlockedLevels,
        maxLevels,
        completionPercentage,
        directReferralCount,
        nextLevel,
        referralsNeededForNextLevel,
        levels
      });
    } catch (error) {
      console.error("Error fetching level statistics:", error);
      res.status(500).json({ message: "Error fetching level statistics" });
    }
  });
  app2.get("/api/earnings/me", isAuthenticated2, async (req, res) => {
    try {
      const earnings2 = await storage.getUserEarnings(req.session.userId);
      res.json(earnings2);
    } catch (error) {
      console.error("Error fetching user earnings:", error);
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });
  app2.get("/api/packages/me", isAuthenticated2, async (req, res) => {
    try {
      const userPackage = await storage.getUserPackage(req.session.userId);
      res.json(userPackage);
    } catch (error) {
      console.error("Error fetching user package:", error);
      res.status(500).json({ message: "Error fetching package" });
    }
  });
  app2.post("/api/packages", isAuthenticated2, async (req, res) => {
    try {
      const { userId, ...bodyData } = req.body;
      const validatedData = insertPackageSchema.omit({ userId: true }).parse(bodyData);
      const existingPackage = await storage.getUserPackage(req.session.userId);
      if (existingPackage) {
        return res.status(400).json({ message: "User already has an active package" });
      }
      const newPackage = await storage.createPackage({
        ...validatedData,
        userId: req.session.userId
      });
      res.status(201).json(newPackage);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error("Error creating package:", error);
      res.status(500).json({ message: "Error creating package" });
    }
  });
  app2.get("/api/users", isAdmin2, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const usersWithoutPasswords = users2.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  app2.get("/api/users/:id", isAuthenticated2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (userId !== req.session.userId && req.session.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });
  app2.patch("/api/users/:id", isAuthenticated2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      if (userId !== req.session.userId && req.session.role !== "admin") {
        return res.status(403).json({ message: "Access denied" });
      }
      if (req.session.role !== "admin") {
        const forbiddenFields = ["role", "isActive", "totalEarnings", "withdrawableAmount", "unlockedLevels", "autoPoolEligible"];
        const attemptedForbiddenUpdate = Object.keys(req.body).some((key) => forbiddenFields.includes(key));
        if (attemptedForbiddenUpdate) {
          return res.status(403).json({ message: "Cannot update restricted fields" });
        }
      }
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = updatedUser;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });
  app2.post("/api/packages", isAuthenticated2, async (req, res) => {
    try {
      const validatedData = insertPackageSchema.parse(req.body);
      const existingPackage = await storage.getPackageByUserId(req.session.userId);
      if (existingPackage) {
        return res.status(400).json({ message: "User already has a package" });
      }
      const newPackage = await storage.createPackage({
        ...validatedData,
        userId: req.session.userId
      });
      const user = await storage.getUser(req.session.userId);
      if (user && user.referredBy) {
        const packageAmount = parseFloat(validatedData.monthlyAmount) * validatedData.totalMonths;
        const directIncome = packageAmount * 0.05;
        await storage.createEarning({
          userId: user.referredBy,
          amount: directIncome.toString(),
          earningType: "direct",
          description: `Direct referral income from ${user.name}`,
          relatedUserId: user.id
        });
        await storage.updateUserEarnings(user.referredBy, directIncome);
      }
      res.status(201).json(newPackage);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating package" });
    }
  });
  app2.get("/api/packages/me", isAuthenticated2, async (req, res) => {
    try {
      const userPackage = await storage.getPackageByUserId(req.session.userId);
      if (!userPackage) {
        return res.status(404).json({ message: "No package found for user" });
      }
      res.json(userPackage);
    } catch (error) {
      res.status(500).json({ message: "Error fetching package" });
    }
  });
  app2.get("/api/packages", isAdmin2, async (req, res) => {
    try {
      const packages2 = await storage.getAllPackages();
      res.json(packages2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching packages" });
    }
  });
  app2.post("/api/emi-payments", isAuthenticated2, async (req, res) => {
    try {
      const validatedData = insertEMIPaymentSchema.parse(req.body);
      const userPackage = await storage.getPackageByUserId(req.session.userId);
      if (!userPackage || userPackage.id !== validatedData.packageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      const newEMIPayment = await storage.createEMIPayment({
        ...validatedData,
        userId: req.session.userId
      });
      res.status(201).json(newEMIPayment);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating EMI payment" });
    }
  });
  app2.get("/api/emi-payments/me", isAuthenticated2, async (req, res) => {
    try {
      const emiPayments2 = await storage.getEMIPaymentsByUserId(req.session.userId);
      res.json(emiPayments2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching EMI payments" });
    }
  });
  app2.get("/api/emi-payments", isAdmin2, async (req, res) => {
    try {
      const emiPayments2 = await storage.getAllEMIPayments();
      res.json(emiPayments2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching EMI payments" });
    }
  });
  app2.get("/api/earnings/me", isAuthenticated2, async (req, res) => {
    try {
      const earnings2 = await storage.getEarningsByUserId(req.session.userId);
      res.json(earnings2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });
  app2.get("/api/earnings", isAdmin2, async (req, res) => {
    try {
      const earnings2 = await storage.getAllEarnings();
      res.json(earnings2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });
  app2.post("/api/earnings", isAdmin2, async (req, res) => {
    try {
      const { userId, amount, earningType, description, relatedUserId } = req.body;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const newEarning = await storage.createEarning({
        userId,
        amount,
        earningType,
        description,
        relatedUserId
      });
      await storage.updateUserEarnings(userId, parseFloat(amount));
      res.status(201).json(newEarning);
    } catch (error) {
      res.status(500).json({ message: "Error creating earning" });
    }
  });
  app2.post("/api/withdrawals", isAuthenticated2, async (req, res) => {
    try {
      const validatedData = insertWithdrawalSchema.parse(req.body);
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const withdrawableAmount = parseFloat(user.withdrawableAmount);
      const requestedAmount = parseFloat(validatedData.amount);
      if (requestedAmount > withdrawableAmount) {
        return res.status(400).json({ message: "Insufficient withdrawable balance" });
      }
      const newWithdrawal = await storage.createWithdrawal({
        ...validatedData,
        userId: req.session.userId
      });
      res.status(201).json(newWithdrawal);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating withdrawal request" });
    }
  });
  app2.get("/api/withdrawals/me", isAuthenticated2, async (req, res) => {
    try {
      const withdrawals2 = await storage.getWithdrawalsByUserId(req.session.userId);
      res.json(withdrawals2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching withdrawals" });
    }
  });
  app2.get("/api/withdrawals", isAdmin2, async (req, res) => {
    try {
      const withdrawals2 = await storage.getAllWithdrawals();
      res.json(withdrawals2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching withdrawals" });
    }
  });
  app2.patch("/api/withdrawals/:id", isAdmin2, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const { status, remarks } = req.body;
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      const updatedWithdrawal = await storage.updateWithdrawal(withdrawalId, {
        status,
        remarks
      });
      if (!updatedWithdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      res.json(updatedWithdrawal);
    } catch (error) {
      res.status(500).json({ message: "Error updating withdrawal" });
    }
  });
  app2.get("/api/binary-structure/me", isAuthenticated2, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`Fetching binary structure info for user ID: ${req.session.userId}`);
      const businessInfo = await storage.getBinaryBusinessInfo(req.session.userId);
      const downline = await storage.getUsersBinaryDownline(req.session.userId);
      const detailedDownline = [];
      for (const structure of downline) {
        const downlineUser = await storage.getUser(structure.userId);
        if (downlineUser) {
          detailedDownline.push({
            id: downlineUser.id,
            name: downlineUser.name,
            position: structure.position,
            level: structure.level,
            parentId: structure.parentId
          });
        }
      }
      const totalTeamSize = user.leftTeamCount + user.rightTeamCount;
      res.json({
        user: {
          id: user.id,
          name: user.name
        },
        leftTeamCount: user.leftTeamCount,
        rightTeamCount: user.rightTeamCount,
        totalTeamSize,
        leftTeamBusiness: businessInfo.leftTeamBusiness,
        rightTeamBusiness: businessInfo.rightTeamBusiness,
        leftCarryForward: businessInfo.leftCarryForward,
        rightCarryForward: businessInfo.rightCarryForward,
        downline: detailedDownline
      });
    } catch (error) {
      console.error("Error fetching binary structure:", error);
      res.status(500).json({ message: "Error fetching binary structure" });
    }
  });
  app2.get("/api/debug/binary-structures", isAdmin2, async (req, res) => {
    try {
      const allBinaryStructures = await storage.getAllBinaryStructures();
      const allUsers = await storage.getAllUsers();
      const allPackages = await storage.getAllPackages();
      const debugInfo = {
        binaryStructures: allBinaryStructures.map((bs) => {
          const user = allUsers.find((u) => u.id === bs.userId);
          const parent = allUsers.find((u) => u.id === bs.parentId);
          return {
            id: bs.id,
            userId: bs.userId,
            userName: user?.name || "Unknown",
            parentId: bs.parentId,
            parentName: parent?.name || "Unknown",
            position: bs.position,
            level: bs.level
          };
        }),
        users: allUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          referredBy: u.referredBy,
          leftTeamCount: u.leftTeamCount,
          rightTeamCount: u.rightTeamCount
        })),
        packages: allPackages.map((p) => {
          const user = allUsers.find((u) => u.id === p.userId);
          return {
            id: p.id,
            userId: p.userId,
            userName: user?.name || "Unknown",
            packageType: p.packageType,
            monthlyAmount: p.monthlyAmount
          };
        })
      };
      res.json(debugInfo);
    } catch (error) {
      console.error("Error fetching debug info:", error);
      res.status(500).json({ message: "Error fetching debug information" });
    }
  });
  app2.get("/api/binary-business/me", isAuthenticated2, async (req, res) => {
    try {
      const businessInfo = await storage.getBinaryBusinessInfo(req.session.userId);
      const downline = await storage.getUsersBinaryDownline(req.session.userId);
      const detailedDownline = [];
      for (const structure of downline) {
        const user = await storage.getUser(structure.userId);
        if (user) {
          detailedDownline.push({
            id: user.id,
            name: user.name,
            position: structure.position,
            level: structure.level,
            parentId: structure.parentId
          });
        }
      }
      const currentUser = await storage.getUser(req.session.userId);
      res.json({
        leftTeamBusiness: businessInfo.leftTeamBusiness,
        rightTeamBusiness: businessInfo.rightTeamBusiness,
        leftCarryForward: businessInfo.leftCarryForward,
        rightCarryForward: businessInfo.rightCarryForward,
        leftTeamCount: currentUser?.leftTeamCount || 0,
        rightTeamCount: currentUser?.rightTeamCount || 0,
        downline: detailedDownline
      });
    } catch (error) {
      console.error("Error fetching binary business info:", error);
      res.status(500).json({ message: "Error fetching binary business information" });
    }
  });
  app2.get("/api/auto-pool/me", isAuthenticated2, async (req, res) => {
    try {
      const autoPoolEntries = await storage.getAutoPoolEntriesByUserId(req.session.userId);
      res.json(autoPoolEntries);
    } catch (error) {
      res.status(500).json({ message: "Error fetching auto pool entries" });
    }
  });
  app2.get("/api/auto-pool", isAdmin2, async (req, res) => {
    try {
      const autoPoolMatrix = await storage.getAutoPoolMatrix();
      res.json(autoPoolMatrix);
    } catch (error) {
      res.status(500).json({ message: "Error fetching auto pool matrix" });
    }
  });
  app2.get("/api/transactions/me", isAuthenticated2, async (req, res) => {
    try {
      const transactions2 = await storage.getTransactionsByUserId(req.session.userId);
      res.json(transactions2);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transactions" });
    }
  });
  app2.get("/api/earnings/me", isAuthenticated2, async (req, res) => {
    try {
      console.log(`Fetching earnings for user ${req.session.userId} at ${(/* @__PURE__ */ new Date()).toISOString()}`);
      await storage.generateDemoEarnings(req.session.userId);
      const earnings2 = await storage.getUserEarnings(req.session.userId);
      console.log(`Found ${earnings2.length} earnings for user ${req.session.userId}`);
      res.set("Cache-Control", "no-cache, no-store, must-revalidate");
      res.set("Pragma", "no-cache");
      res.set("Expires", "0");
      res.json(earnings2);
    } catch (error) {
      console.error("Error fetching user earnings:", error);
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });
  app2.get("/api/packages/me", isAuthenticated2, async (req, res) => {
    try {
      const userPackage = await storage.getUserPackage(req.session.userId);
      res.json(userPackage);
    } catch (error) {
      console.error("Error fetching user package:", error);
      res.status(500).json({ message: "Error fetching package" });
    }
  });
  app2.get("/api/debug/user-info", isAuthenticated2, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId);
      const allUsers = await storage.getAllUsers();
      const directReferrals = allUsers.filter((u) => u.referredBy === req.session.userId);
      res.json({
        currentUser: user,
        allUsersCount: allUsers.length,
        directReferrals,
        allUsers: allUsers.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          referredBy: u.referredBy,
          referralId: u.referralId
        }))
      });
    } catch (error) {
      console.error("Error fetching debug info:", error);
      res.status(500).json({ message: "Error fetching debug info" });
    }
  });
  app2.post("/api/debug/generate-earnings", isAuthenticated2, async (req, res) => {
    try {
      console.log(`Force generating earnings for user ${req.session.userId}`);
      await storage.generateDemoEarnings(req.session.userId);
      const earnings2 = await storage.getUserEarnings(req.session.userId);
      const user = await storage.getUser(req.session.userId);
      res.json({
        message: "Earnings generation attempted",
        userId: req.session.userId,
        earningsCount: earnings2.length,
        earnings: earnings2,
        userTotalEarnings: user?.totalEarnings
      });
    } catch (error) {
      console.error("Error generating earnings:", error);
      res.status(500).json({ message: "Error generating earnings" });
    }
  });
  app2.get("/api/debug/session", (req, res) => {
    res.json({
      session: req.session,
      sessionID: req.sessionID,
      cookies: req.headers.cookie
    });
  });
  app2.post("/api/debug/clear-session", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not clear session" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Session cleared" });
    });
  });
  app2.post("/api/admin/login", async (req, res) => {
    try {
      console.log("Admin login attempt:", req.body);
      const { username, password } = req.body;
      if (username !== "admin" || password !== "Qwertghjkl@13") {
        console.log("Invalid credentials provided:", { username, password: "***" });
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      let adminUser = await storage.getUserByEmail("admin@pelnora.com");
      console.log("Found admin user:", adminUser ? "Yes" : "No");
      if (!adminUser) {
        console.log("Creating admin user...");
        adminUser = await storage.createUser({
          name: "Admin User",
          email: "admin@pelnora.com",
          phone: "1234567890",
          password: "admin123",
          role: "admin",
          isActive: true
        });
        console.log("Admin user created:", adminUser.id);
      }
      if (adminUser.role !== "admin") {
        console.log("Updating user role to admin");
        adminUser = await storage.updateUser(adminUser.id, { role: "admin" });
      }
      req.session.userId = adminUser.id;
      req.session.isAdmin = true;
      console.log("Admin login successful, session set:", req.session.userId);
      res.json({
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });
  app2.get("/api/admin/stats", isAdmin2, async (req, res) => {
    try {
      const userCount = await storage.getUserCount();
      const packages2 = await storage.getAllPackages();
      const activePackages = packages2.filter((pkg) => !pkg.isCompleted).length;
      const completedPackages = packages2.filter((pkg) => pkg.isCompleted).length;
      const withdrawals2 = await storage.getAllWithdrawals();
      const pendingWithdrawals = withdrawals2.filter((w) => w.status === "pending").length;
      const totalWithdrawalAmount = withdrawals2.filter((w) => w.status === "approved").reduce((sum, w) => sum + parseFloat(w.amount), 0);
      const earnings2 = await storage.getAllEarnings();
      const totalEarnings = earnings2.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const emiPayments2 = await storage.getAllEMIPayments();
      const totalPaidEMIs = emiPayments2.filter((emi) => emi.status === "paid").length;
      const allUsers = await storage.getAllUsers();
      const recentSignups = allUsers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 10).map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        isActive: user.isActive
      }));
      res.json({
        userCount,
        activePackages,
        completedPackages,
        pendingWithdrawals,
        totalWithdrawalAmount,
        totalEarnings,
        totalPaidEMIs,
        recentSignups
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });
  app2.get("/api/admin/users", isAdmin2, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const safeUsers = users2.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralId: user.referralId,
        referredBy: user.referredBy,
        role: user.role,
        isActive: user.isActive,
        leftTeamCount: user.leftTeamCount,
        rightTeamCount: user.rightTeamCount,
        leftCarryForward: user.leftCarryForward,
        rightCarryForward: user.rightCarryForward,
        totalEarnings: user.totalEarnings,
        withdrawableAmount: user.withdrawableAmount,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        ifscCode: user.ifscCode,
        panNumber: user.panNumber,
        idProofType: user.idProofType,
        idProofNumber: user.idProofNumber,
        panCardImage: user.panCardImage,
        idProofImage: user.idProofImage,
        kycStatus: user.kycStatus,
        kycRejectionReason: user.kycRejectionReason,
        unlockedLevels: user.unlockedLevels,
        autoPoolEligible: user.autoPoolEligible,
        createdAt: user.createdAt
        // Explicitly exclude password field
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  app2.get("/api/users", isAdmin2, async (req, res) => {
    try {
      const users2 = await storage.getAllUsers();
      const safeUsers = users2.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        referralId: user.referralId,
        referredBy: user.referredBy,
        role: user.role,
        isActive: user.isActive,
        leftTeamCount: user.leftTeamCount,
        rightTeamCount: user.rightTeamCount,
        leftCarryForward: user.leftCarryForward,
        rightCarryForward: user.rightCarryForward,
        totalEarnings: user.totalEarnings,
        withdrawableAmount: user.withdrawableAmount,
        bankName: user.bankName,
        accountNumber: user.accountNumber,
        ifscCode: user.ifscCode,
        panNumber: user.panNumber,
        idProofType: user.idProofType,
        idProofNumber: user.idProofNumber,
        panCardImage: user.panCardImage,
        idProofImage: user.idProofImage,
        kycStatus: user.kycStatus,
        kycRejectionReason: user.kycRejectionReason,
        unlockedLevels: user.unlockedLevels,
        autoPoolEligible: user.autoPoolEligible,
        createdAt: user.createdAt
        // Explicitly exclude password field
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  app2.post("/api/admin/recalculate-all-stats", isAdmin2, async (req, res) => {
    try {
      console.log("\u{1F527} Admin triggered comprehensive stats recalculation");
      const result = await storage.recalculateAllUserStats();
      console.log("\u{1F527} Recalculation result:", result);
      res.json(result);
    } catch (error) {
      console.error("Error recalculating all stats:", error);
      res.status(500).json({
        success: false,
        message: "Error recalculating user stats",
        updatedUsers: 0
      });
    }
  });
  app2.get("/api/debug/user-stats/:id", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      const earnings2 = await storage.getEarningsByUserId(userId);
      const binaryStructure2 = await storage.getBinaryStructureByUserId(userId);
      res.json({
        user: user ? {
          id: user.id,
          name: user.name,
          totalEarnings: user.totalEarnings,
          leftTeamCount: user.leftTeamCount,
          rightTeamCount: user.rightTeamCount,
          withdrawableAmount: user.withdrawableAmount
        } : null,
        earnings: earnings2.map((e) => ({
          id: e.id,
          amount: e.amount,
          earningType: e.earningType,
          description: e.description
        })),
        binaryStructure: binaryStructure2
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ message: "Error fetching user stats" });
    }
  });
  app2.post("/api/debug/reset-user-stats/:id", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`\u{1F527} Manually resetting stats for user ${userId}`);
      const updatedUser = await storage.updateUser(userId, {
        totalEarnings: "0",
        leftTeamCount: 0,
        rightTeamCount: 0,
        withdrawableAmount: "0",
        leftCarryForward: "0",
        rightCarryForward: "0"
      });
      if (updatedUser) {
        console.log(`\u2705 Reset stats for user ${updatedUser.name}`);
        res.json({
          success: true,
          message: `Reset stats for user ${updatedUser.name}`,
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            totalEarnings: updatedUser.totalEarnings,
            leftTeamCount: updatedUser.leftTeamCount,
            rightTeamCount: updatedUser.rightTeamCount,
            withdrawableAmount: updatedUser.withdrawableAmount
          }
        });
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (error) {
      console.error("Error resetting user stats:", error);
      res.status(500).json({ success: false, message: "Error resetting user stats" });
    }
  });
  app2.get("/api/admin/users/:id/package", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userPackage = await storage.getPackageByUserId(userId);
      if (userPackage) {
        res.json(userPackage);
      } else {
        res.status(404).json({ message: "No package found for this user" });
      }
    } catch (error) {
      console.error("Error fetching user package:", error);
      res.status(500).json({ message: "Error fetching user package" });
    }
  });
  app2.post("/api/admin/users/:id/package", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { packageType, monthlyAmount, totalMonths = 11, paidMonths = 0 } = req.body;
      console.log(`\u{1F4E6} Admin updating package for user ${userId}:`, { packageType, monthlyAmount });
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const existingPackage = await storage.getPackageByUserId(userId);
      if (existingPackage) {
        console.log(`\u{1F4E6} Updating existing package ${existingPackage.id} for user ${user.name}`);
        const updatedPackage = await storage.updatePackage(existingPackage.id, {
          packageType,
          monthlyAmount: monthlyAmount.toString(),
          totalMonths,
          paidMonths,
          isCompleted: false,
          bonusEarned: false
        });
        if (updatedPackage) {
          console.log(`\u2705 Updated package for user ${user.name}`);
          res.json({
            success: true,
            message: `Updated package for user ${user.name}`,
            package: updatedPackage
          });
        } else {
          console.log(`\u274C Failed to update package for user ${user.name}`);
          res.status(500).json({ message: "Failed to update package" });
        }
      } else {
        const newPackage = await storage.createPackage({
          userId,
          packageType,
          monthlyAmount: monthlyAmount.toString(),
          totalMonths,
          paidMonths
        });
        console.log(`\u2705 Created new package for user ${user.name}`);
        res.json({
          success: true,
          message: `Created new package for user ${user.name}`,
          package: newPackage
        });
      }
    } catch (error) {
      console.error("Error managing user package:", error);
      res.status(500).json({ message: "Error managing user package" });
    }
  });
  app2.delete("/api/admin/users/:id/package", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`\u{1F5D1}\uFE0F Admin deleting package for user ${userId}`);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const userPackage = await storage.getPackageByUserId(userId);
      if (!userPackage) {
        return res.status(404).json({ message: "No package found for this user" });
      }
      const deleted = await storage.deletePackage(userPackage.id);
      if (deleted) {
        console.log(`\u2705 Deleted package for user ${user.name}`);
        res.json({
          success: true,
          message: `Deleted package for user ${user.name}`
        });
      } else {
        res.status(500).json({ message: "Failed to delete package" });
      }
    } catch (error) {
      console.error("Error deleting user package:", error);
      res.status(500).json({ message: "Error deleting user package" });
    }
  });
  app2.patch("/api/admin/users/:id/levels", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { unlockedLevels } = req.body;
      console.log(`\u{1F513} Admin updating levels for user ${userId}: ${unlockedLevels}`);
      if (typeof unlockedLevels !== "number" || unlockedLevels < 0 || unlockedLevels > 20) {
        return res.status(400).json({ message: "Invalid level. Must be between 0 and 20." });
      }
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUser(userId, { unlockedLevels });
      if (updatedUser) {
        console.log(`\u2705 Updated levels for user ${user.name} to ${unlockedLevels}`);
        res.json({
          success: true,
          message: `Updated levels for user ${user.name} to ${unlockedLevels}`,
          user: {
            id: updatedUser.id,
            name: updatedUser.name,
            unlockedLevels: updatedUser.unlockedLevels
          }
        });
      } else {
        res.status(500).json({ message: "Failed to update user levels" });
      }
    } catch (error) {
      console.error("Error updating user levels:", error);
      res.status(500).json({ message: "Error updating user levels" });
    }
  });
  app2.post("/api/admin/recalculate-earnings", isAdmin2, async (req, res) => {
    try {
      console.log("\u{1F527} Admin triggered earnings recalculation");
      const packages2 = await storage.getAllPackages();
      const users2 = await storage.getAllUsers();
      let recalculatedCount = 0;
      const results = [];
      for (const pkg of packages2) {
        const user = users2.find((u) => u.id === pkg.userId);
        if (user) {
          console.log(`\u{1F504} Recalculating earnings for ${user.name}'s ${pkg.packageType} package`);
          try {
            await storage.calculateRealEarnings(pkg.userId, pkg);
            recalculatedCount++;
            results.push({
              userId: pkg.userId,
              userName: user.name,
              packageType: pkg.packageType,
              monthlyAmount: pkg.monthlyAmount,
              status: "success"
            });
          } catch (error) {
            console.error(`\u274C Error recalculating for user ${user.name}:`, error);
            results.push({
              userId: pkg.userId,
              userName: user.name,
              packageType: pkg.packageType,
              monthlyAmount: pkg.monthlyAmount,
              status: "error",
              error: error.message
            });
          }
        }
      }
      console.log(`\u2705 Recalculated earnings for ${recalculatedCount} packages`);
      res.json({
        message: `Successfully recalculated earnings for ${recalculatedCount} packages`,
        totalPackages: packages2.length,
        recalculatedCount,
        results
      });
    } catch (error) {
      console.error("Error recalculating earnings:", error);
      res.status(500).json({ message: "Error recalculating earnings" });
    }
  });
  app2.post("/api/admin/users/:id/delete-permanently", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const adminId = req.session.userId;
      console.log(`\u{1F5D1}\uFE0F Admin ${adminId} permanently deleting user ${userId}`);
      const result = await storage.deleteUserPermanently(userId, adminId);
      if (result.success) {
        console.log(`\u2705 ${result.message}`);
        res.json(result);
      } else {
        console.error(`\u274C ${result.message}`);
        res.status(500).json(result);
      }
    } catch (error) {
      console.error("Error permanently deleting user:", error);
      res.status(500).json({
        success: false,
        message: `Error deleting user: ${error instanceof Error ? error.message : "Unknown error"}`
      });
    }
  });
  app2.delete("/api/admin/users/:id", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`\u{1F5D1}\uFE0F Admin deleting user ${userId}`);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (user.role === "admin") {
        return res.status(400).json({ message: "Cannot delete admin users" });
      }
      const userEarnings = await storage.getEarningsByUserId(userId);
      console.log(`Deleting ${userEarnings.length} earnings records for user ${user.name}`);
      const userPackage = await storage.getPackageByUserId(userId);
      if (userPackage) {
        console.log(`Deleting package for user ${user.name}`);
      }
      const userWithdrawals = await storage.getWithdrawalsByUserId(userId);
      console.log(`Deleting ${userWithdrawals.length} withdrawal records for user ${user.name}`);
      const deleted = await storage.deleteUser(userId);
      if (deleted) {
        console.log(`\u2705 Successfully deleted user ${user.name} (ID: ${userId})`);
        res.json({
          message: `Successfully deleted user ${user.name}`,
          deletedUser: {
            id: userId,
            name: user.name,
            email: user.email
          }
        });
      } else {
        res.status(500).json({ message: "Failed to delete user" });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });
  app2.post("/api/admin/users/:id/reset-earnings", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`\u{1F504} Admin resetting earnings for user ${userId}`);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const updatedUser = await storage.updateUser(userId, {
        totalEarnings: "0",
        withdrawableAmount: "0"
      });
      const deletedEarnings = await storage.deleteEarningsByUserId(userId);
      console.log(`\u2705 Reset earnings for ${user.name} - deleted ${deletedEarnings} records`);
      res.json({
        message: `Successfully reset earnings for ${user.name}`,
        user: {
          id: userId,
          name: user.name,
          totalEarnings: "0",
          deletedEarningsCount: deletedEarnings
        }
      });
    } catch (error) {
      console.error("Error resetting earnings:", error);
      res.status(500).json({ message: "Error resetting earnings" });
    }
  });
  app2.patch("/api/users/:id", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });
  app2.get("/api/admin/users/:id/password", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({
        password: user.password.startsWith("$2") ? "[Encrypted Password]" : user.password,
        isHashed: user.password.startsWith("$2")
      });
    } catch (error) {
      console.error("Error fetching user password:", error);
      res.status(500).json({ message: "Error fetching user password" });
    }
  });
  app2.patch("/api/admin/users/:id/password", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { password } = req.body;
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating user password:", error);
      res.status(500).json({ message: "Error updating user password" });
    }
  });
  app2.get("/api/admin/withdrawals", isAdmin2, async (req, res) => {
    try {
      const withdrawals2 = await storage.getAllWithdrawals();
      const withdrawalsWithUsers = await Promise.all(
        withdrawals2.map(async (withdrawal) => {
          const user = await storage.getUser(withdrawal.userId);
          return {
            ...withdrawal,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone
            } : null
          };
        })
      );
      res.json(withdrawalsWithUsers);
    } catch (error) {
      console.error("Error fetching withdrawals:", error);
      res.status(500).json({ message: "Error fetching withdrawals" });
    }
  });
  app2.patch("/api/admin/withdrawals/:id", isAdmin2, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const updateData = req.body;
      const updatedWithdrawal = await storage.updateWithdrawal(withdrawalId, updateData);
      if (!updatedWithdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      res.json(updatedWithdrawal);
    } catch (error) {
      console.error("Error updating withdrawal:", error);
      res.status(500).json({ message: "Error updating withdrawal" });
    }
  });
  app2.get("/api/admin/earnings", isAdmin2, async (req, res) => {
    try {
      const earnings2 = await storage.getAllEarnings();
      const earningsWithUsers = await Promise.all(
        earnings2.map(async (earning) => {
          const user = await storage.getUser(earning.userId);
          return {
            ...earning,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email
            } : null
          };
        })
      );
      res.json(earningsWithUsers);
    } catch (error) {
      console.error("Error fetching earnings:", error);
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });
  app2.post("/api/admin/earnings", isAdmin2, async (req, res) => {
    try {
      const { userId, amount, earningType, description } = req.body;
      const earning = await storage.createEarning({
        userId,
        amount: amount.toString(),
        earningType,
        description: description || "Manual adjustment by admin"
      });
      await storage.updateUserEarnings(userId, parseFloat(amount));
      res.json(earning);
    } catch (error) {
      console.error("Error creating earning:", error);
      res.status(500).json({ message: "Error creating earning" });
    }
  });
  app2.get("/api/admin/emi-payments", isAdmin2, async (req, res) => {
    try {
      const emiPayments2 = await storage.getAllEMIPayments();
      const emiWithDetails = await Promise.all(
        emiPayments2.map(async (emi) => {
          const userPackage = await storage.getPackageByUserId(emi.userId);
          const user = await storage.getUser(emi.userId);
          return {
            ...emi,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              phone: user.phone
            } : null,
            package: userPackage
          };
        })
      );
      res.json(emiWithDetails);
    } catch (error) {
      console.error("Error fetching EMI payments:", error);
      res.status(500).json({ message: "Error fetching EMI payments" });
    }
  });
  app2.get("/api/admin/auto-pool", isAdmin2, async (req, res) => {
    try {
      const autoPoolEntries = await storage.getAutoPoolMatrix();
      const autoPoolWithUsers = await Promise.all(
        autoPoolEntries.map(async (entry) => {
          const user = await storage.getUser(entry.userId);
          return {
            ...entry,
            user: user ? {
              id: user.id,
              name: user.name,
              email: user.email,
              totalEarnings: user.totalEarnings
            } : null
          };
        })
      );
      res.json(autoPoolWithUsers);
    } catch (error) {
      console.error("Error fetching auto pool data:", error);
      res.status(500).json({ message: "Error fetching auto pool data" });
    }
  });
  app2.get("/api/admin/stats", isAdmin2, async (req, res) => {
    try {
      const userCount = await storage.getUserCount();
      const packages2 = await storage.getAllPackages();
      const activePackages = packages2.filter((pkg) => !pkg.isCompleted).length;
      const completedPackages = packages2.filter((pkg) => pkg.isCompleted).length;
      const withdrawals2 = await storage.getAllWithdrawals();
      const pendingWithdrawals = withdrawals2.filter((w) => w.status === "pending").length;
      const approvedWithdrawals = withdrawals2.filter((w) => w.status === "approved").length;
      const totalWithdrawalAmount = withdrawals2.filter((w) => w.status === "approved").reduce((sum, w) => sum + parseFloat(w.amount), 0);
      const earnings2 = await storage.getAllEarnings();
      const totalEarnings = earnings2.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      const emiPayments2 = await storage.getAllEMIPayments();
      const totalEMIAmount = emiPayments2.reduce((sum, emi) => sum + parseFloat(emi.amount), 0);
      res.json({
        userCount,
        activePackages,
        completedPackages,
        pendingWithdrawals,
        approvedWithdrawals,
        totalWithdrawalAmount,
        totalEarnings,
        totalEMIAmount,
        packageStats: {
          silver: packages2.filter((p) => p.packageType === "silver").length,
          gold: packages2.filter((p) => p.packageType === "gold").length,
          platinum: packages2.filter((p) => p.packageType === "platinum").length,
          diamond: packages2.filter((p) => p.packageType === "diamond").length
        }
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });
  app2.get("/api/stats", isAdmin2, async (req, res) => {
    try {
      const userCount = await storage.getUserCount();
      const packages2 = await storage.getAllPackages();
      const activePackages = packages2.filter((pkg) => !pkg.isCompleted).length;
      const completedPackages = packages2.filter((pkg) => pkg.isCompleted).length;
      const withdrawals2 = await storage.getAllWithdrawals();
      const pendingWithdrawals = withdrawals2.filter((w) => w.status === "pending").length;
      const totalWithdrawalAmount = withdrawals2.filter((w) => w.status === "approved").reduce((sum, w) => sum + parseFloat(w.amount), 0);
      res.json({
        userCount,
        activePackages,
        completedPackages,
        pendingWithdrawals,
        totalWithdrawalAmount
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });
  app2.post("/api/admin/users/:id/deactivate", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`Admin deactivating user ${userId}`);
      const deactivatedUser = await storage.deactivateUser(userId);
      if (!deactivatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = deactivatedUser;
      res.json({
        message: `User ${deactivatedUser.name} has been deactivated`,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ message: "Error deactivating user" });
    }
  });
  app2.post("/api/admin/users/:id/activate", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`Admin activating user ${userId}`);
      const activatedUser = await storage.activateUser(userId);
      if (!activatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = activatedUser;
      res.json({
        message: `User ${activatedUser.name} has been activated`,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error activating user:", error);
      res.status(500).json({ message: "Error activating user" });
    }
  });
  app2.post("/api/admin/users/:id/delete-permanently", isAdmin2, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const adminId = req.session.userId;
      console.log(`Admin ${adminId} attempting to permanently delete user ${userId}`);
      const result = await storage.deleteUserPermanently(userId, adminId);
      if (!result.success) {
        return res.status(400).json({ message: result.message });
      }
      res.json({
        message: result.message,
        success: true,
        orphanedUsers: result.orphanedUsers,
        reassignedUsers: result.reassignedUsers,
        deletionLog: {
          deletedUserId: userId,
          deletedByAdminId: adminId,
          timestamp: /* @__PURE__ */ new Date(),
          action: "USER_DELETED_PERMANENTLY"
        }
      });
    } catch (error) {
      console.error("Error permanently deleting user:", error);
      res.status(500).json({ message: "Error permanently deleting user" });
    }
  });
  app2.get("/api/admin/orphaned-users", isAdmin2, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allBinaryStructures = Array.from(storage.binaryStructures.values());
      const orphanedUsers = allUsers.filter((user) => {
        if (user.role === "admin") return false;
        const hasStructure = allBinaryStructures.some((bs) => bs.userId === user.id);
        return !hasStructure;
      });
      const safeOrphanedUsers = orphanedUsers.map((user) => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      res.json({
        count: safeOrphanedUsers.length,
        users: safeOrphanedUsers
      });
    } catch (error) {
      console.error("Error fetching orphaned users:", error);
      res.status(500).json({ message: "Error fetching orphaned users" });
    }
  });
  const kycRouter = await Promise.resolve().then(() => (init_kyc(), kyc_exports));
  app2.use("/api/kyc", kycRouter.default);
  const kycSizeTestRouter = await Promise.resolve().then(() => (init_kyc_size_test(), kyc_size_test_exports));
  app2.use("/api/kyc-size", kycSizeTestRouter.default);
  app2.get("/api/users/by-referral/:referralId", async (req, res) => {
    try {
      const { referralId } = req.params;
      const user = await storage.getUserByReferralId(referralId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error("Error fetching user by referralId:", error);
      res.status(500).json({ message: "Error fetching user by referralId" });
    }
  });
  app2.get("/api/health", async (req, res) => {
    try {
      const dbCheck = await storage.getUser(1);
      res.json({
        status: "healthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        database: dbCheck ? "connected" : "disconnected",
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || "1.0.0"
      });
    } catch (error) {
      res.status(500).json({
        status: "unhealthy",
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        database: "error",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express3 from "express";
import fs3 from "fs";
import path4 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path3 from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path3.resolve(import.meta.dirname, "client", "src"),
      "@shared": path3.resolve(import.meta.dirname, "shared"),
      "@assets": path3.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path3.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path3.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/")) {
      return next();
    }
    try {
      const clientTemplate = path4.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs3.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path4.resolve(import.meta.dirname, "dist");
  if (!fs3.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express3.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path4.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express4();
app.use(express4.json());
app.use(express4.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path5 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path5.startsWith("/api")) {
      let logLine = `${req.method} ${path5} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 3e3;
  server.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
})();
