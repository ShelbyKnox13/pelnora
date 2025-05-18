import { pgTable, text, serial, integer, boolean, numeric, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['user', 'admin']);
export const packageTypeEnum = pgEnum('package_type', ['silver', 'gold', 'platinum', 'diamond']);
export const emiStatusEnum = pgEnum('emi_status', ['pending', 'paid', 'late', 'bonus_earned']);
export const withdrawalStatusEnum = pgEnum('withdrawal_status', ['pending', 'approved', 'rejected']);
export const earningTypeEnum = pgEnum('earning_type', ['direct', 'binary', 'level', 'autopool', 'emi_bonus']);
export const transactionTypeEnum = pgEnum('transaction_type', ['emi_payment', 'earning', 'withdrawal', 'deduction']);

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  password: text("password").notNull(),
  referralId: text("referral_id").notNull().unique(),
  referredBy: integer("referred_by").references(() => users.id),
  role: userRoleEnum("role").default('user').notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  leftTeamCount: integer("left_team_count").default(0).notNull(),
  rightTeamCount: integer("right_team_count").default(0).notNull(),
  totalEarnings: numeric("total_earnings").default("0").notNull(),
  withdrawableAmount: numeric("withdrawable_amount").default("0").notNull(),
  bankName: text("bank_name"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  kycStatus: boolean("kyc_status").default(false).notNull(),
  unlockedLevels: integer("unlocked_levels").default(0).notNull(),
  autoPoolEligible: boolean("auto_pool_eligible").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Packages table
export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  packageType: packageTypeEnum("package_type").notNull(),
  monthlyAmount: numeric("monthly_amount").notNull(),
  totalMonths: integer("total_months").default(11).notNull(),
  paidMonths: integer("paid_months").default(0).notNull(),
  isCompleted: boolean("is_completed").default(false).notNull(),
  bonusEarned: boolean("bonus_earned").default(false).notNull(),
  startDate: timestamp("start_date").defaultNow().notNull(),
  nextPaymentDue: timestamp("next_payment_due"),
});

// EMI Payments table
export const emiPayments = pgTable("emi_payments", {
  id: serial("id").primaryKey(),
  packageId: integer("package_id").notNull().references(() => packages.id),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount").notNull(),
  paymentDate: timestamp("payment_date").defaultNow().notNull(),
  status: emiStatusEnum("status").default('paid').notNull(),
  month: integer("month").notNull(),
});

// Binary Structure table
export const binaryStructure = pgTable("binary_structure", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  parentId: integer("parent_id").references(() => users.id),
  position: text("position").notNull(), // 'left' or 'right'
  level: integer("level").notNull(),
});

// Earnings table
export const earnings = pgTable("earnings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount").notNull(),
  earningType: earningTypeEnum("earning_type").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  relatedUserId: integer("related_user_id").references(() => users.id),
});

// Withdrawals table
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount").notNull(),
  status: withdrawalStatusEnum("status").default('pending').notNull(),
  requestDate: timestamp("request_date").defaultNow().notNull(),
  processedDate: timestamp("processed_date"),
  remarks: text("remarks"),
});

// Auto Pool table
export const autoPool = pgTable("auto_pool", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  position: integer("position").notNull(),
  level: integer("level").notNull(), // 1, 2, or 3 for the 1:3:9 structure
  parentId: integer("parent_id").references(() => autoPool.id),
  joinDate: timestamp("join_date").defaultNow().notNull(),
});

// Transactions table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: numeric("amount").notNull(),
  type: transactionTypeEnum("type").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  relatedId: integer("related_id"), // Could be a package_id, earning_id, etc.
});

// Insert Schemas
export const insertUserSchema = createInsertSchema(users)
  .omit({ 
    id: true, 
    referralId: true, 
    leftTeamCount: true, 
    rightTeamCount: true, 
    totalEarnings: true,
    withdrawableAmount: true,
    unlockedLevels: true,
    autoPoolEligible: true,
    createdAt: true,
    kycStatus: true,
    isActive: true
  });

export const insertPackageSchema = createInsertSchema(packages)
  .omit({ 
    id: true, 
    paidMonths: true, 
    isCompleted: true, 
    bonusEarned: true, 
    startDate: true
  });

export const insertEMIPaymentSchema = createInsertSchema(emiPayments)
  .omit({ 
    id: true, 
    paymentDate: true 
  });

export const insertBinaryStructureSchema = createInsertSchema(binaryStructure)
  .omit({ 
    id: true 
  });

export const insertEarningSchema = createInsertSchema(earnings)
  .omit({ 
    id: true, 
    createdAt: true 
  });

export const insertWithdrawalSchema = createInsertSchema(withdrawals)
  .omit({ 
    id: true, 
    requestDate: true, 
    processedDate: true,
    status: true
  });

export const insertAutoPoolSchema = createInsertSchema(autoPool)
  .omit({ 
    id: true, 
    joinDate: true 
  });

export const insertTransactionSchema = createInsertSchema(transactions)
  .omit({ 
    id: true, 
    createdAt: true 
  });

// Types for insert and select operations
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packages.$inferSelect;

export type InsertEMIPayment = z.infer<typeof insertEMIPaymentSchema>;
export type EMIPayment = typeof emiPayments.$inferSelect;

export type InsertBinaryStructure = z.infer<typeof insertBinaryStructureSchema>;
export type BinaryStructure = typeof binaryStructure.$inferSelect;

export type InsertEarning = z.infer<typeof insertEarningSchema>;
export type Earning = typeof earnings.$inferSelect;

export type InsertWithdrawal = z.infer<typeof insertWithdrawalSchema>;
export type Withdrawal = typeof withdrawals.$inferSelect;

export type InsertAutoPool = z.infer<typeof insertAutoPoolSchema>;
export type AutoPool = typeof autoPool.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;

// Custom login schema
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export type LoginData = z.infer<typeof loginSchema>;
