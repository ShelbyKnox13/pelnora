"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.insertTransactionSchema = exports.insertAutoPoolSchema = exports.insertWithdrawalSchema = exports.insertEarningSchema = exports.insertBinaryStructureSchema = exports.insertEMIPaymentSchema = exports.insertPackageSchema = exports.insertUserSchema = exports.transactions = exports.autoPool = exports.withdrawals = exports.earnings = exports.binaryStructure = exports.emiPayments = exports.packages = exports.users = exports.kycStatusEnum = exports.transactionTypeEnum = exports.earningTypeEnum = exports.withdrawalStatusEnum = exports.emiStatusEnum = exports.packageTypeEnum = exports.userRoleEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
const drizzle_zod_1 = require("drizzle-zod");
const zod_1 = require("zod");
// Enums
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['user', 'admin']);
exports.packageTypeEnum = (0, pg_core_1.pgEnum)('package_type', ['silver', 'gold', 'platinum', 'diamond']);
exports.emiStatusEnum = (0, pg_core_1.pgEnum)('emi_status', ['pending', 'paid', 'late', 'bonus_earned']);
exports.withdrawalStatusEnum = (0, pg_core_1.pgEnum)('withdrawal_status', ['pending', 'approved', 'rejected']);
exports.earningTypeEnum = (0, pg_core_1.pgEnum)('earning_type', ['direct', 'binary', 'level', 'autopool', 'emi_bonus']);
exports.transactionTypeEnum = (0, pg_core_1.pgEnum)('transaction_type', ['emi_payment', 'earning', 'withdrawal', 'deduction']);
exports.kycStatusEnum = (0, pg_core_1.pgEnum)('kyc_status', ['not_submitted', 'pending', 'approved', 'rejected']);
// Users table
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    name: (0, pg_core_1.text)("name").notNull(),
    email: (0, pg_core_1.text)("email").notNull().unique(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    password: (0, pg_core_1.text)("password").notNull(),
    referralId: (0, pg_core_1.text)("referral_id").notNull().unique(),
    referredBy: (0, pg_core_1.integer)("referred_by").references(() => exports.users.id),
    role: (0, exports.userRoleEnum)("role").default('user').notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    leftTeamCount: (0, pg_core_1.integer)("left_team_count").default(0).notNull(),
    rightTeamCount: (0, pg_core_1.integer)("right_team_count").default(0).notNull(),
    leftCarryForward: (0, pg_core_1.numeric)("left_carry_forward").default("0").notNull(),
    rightCarryForward: (0, pg_core_1.numeric)("right_carry_forward").default("0").notNull(),
    totalEarnings: (0, pg_core_1.numeric)("total_earnings").default("0").notNull(),
    withdrawableAmount: (0, pg_core_1.numeric)("withdrawable_amount").default("0").notNull(),
    bankName: (0, pg_core_1.text)("bank_name"),
    accountNumber: (0, pg_core_1.text)("account_number"),
    ifscCode: (0, pg_core_1.text)("ifsc_code"),
    panNumber: (0, pg_core_1.text)("pan_number"),
    idProofType: (0, pg_core_1.text)("id_proof_type"),
    idProofNumber: (0, pg_core_1.text)("id_proof_number"),
    panCardImage: (0, pg_core_1.text)("pan_card_image"),
    idProofImage: (0, pg_core_1.text)("id_proof_image"),
    kycStatus: (0, exports.kycStatusEnum)("kyc_status").default('not_submitted').notNull(),
    kycRejectionReason: (0, pg_core_1.text)("kyc_rejection_reason"),
    unlockedLevels: (0, pg_core_1.integer)("unlocked_levels").default(0).notNull(),
    autoPoolEligible: (0, pg_core_1.boolean)("auto_pool_eligible").default(false).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
});
// Packages table
exports.packages = (0, pg_core_1.pgTable)("packages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    packageType: (0, exports.packageTypeEnum)("package_type").notNull(),
    monthlyAmount: (0, pg_core_1.numeric)("monthly_amount").notNull(),
    totalMonths: (0, pg_core_1.integer)("total_months").default(11).notNull(),
    paidMonths: (0, pg_core_1.integer)("paid_months").default(0).notNull(),
    isCompleted: (0, pg_core_1.boolean)("is_completed").default(false).notNull(),
    bonusEarned: (0, pg_core_1.boolean)("bonus_earned").default(false).notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date").defaultNow().notNull(),
    nextPaymentDue: (0, pg_core_1.timestamp)("next_payment_due"),
});
// EMI Payments table
exports.emiPayments = (0, pg_core_1.pgTable)("emi_payments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    packageId: (0, pg_core_1.integer)("package_id").notNull().references(() => exports.packages.id),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    paymentDate: (0, pg_core_1.timestamp)("payment_date").defaultNow().notNull(),
    status: (0, exports.emiStatusEnum)("status").default('paid').notNull(),
    month: (0, pg_core_1.integer)("month").notNull(),
});
// Binary Structure table
exports.binaryStructure = (0, pg_core_1.pgTable)("binary_structure", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    parentId: (0, pg_core_1.integer)("parent_id").references(() => exports.users.id),
    position: (0, pg_core_1.text)("position").notNull(), // 'left' or 'right'
    level: (0, pg_core_1.integer)("level").notNull(),
});
// Earnings table
exports.earnings = (0, pg_core_1.pgTable)("earnings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    earningType: (0, exports.earningTypeEnum)("earning_type").notNull(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    relatedUserId: (0, pg_core_1.integer)("related_user_id").references(() => exports.users.id),
});
// Withdrawals table
exports.withdrawals = (0, pg_core_1.pgTable)("withdrawals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    status: (0, exports.withdrawalStatusEnum)("status").default('pending').notNull(),
    requestDate: (0, pg_core_1.timestamp)("request_date").defaultNow().notNull(),
    processedDate: (0, pg_core_1.timestamp)("processed_date"),
    remarks: (0, pg_core_1.text)("remarks"),
});
// Auto Pool table
exports.autoPool = (0, pg_core_1.pgTable)("auto_pool", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    position: (0, pg_core_1.integer)("position").notNull(),
    level: (0, pg_core_1.integer)("level").notNull(), // 1, 2, or 3 for the 1:3:9 structure
    parentId: (0, pg_core_1.integer)("parent_id").references(() => exports.autoPool.id),
    joinDate: (0, pg_core_1.timestamp)("join_date").defaultNow().notNull(),
});
// Transactions table
exports.transactions = (0, pg_core_1.pgTable)("transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.integer)("user_id").notNull().references(() => exports.users.id),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    type: (0, exports.transactionTypeEnum)("type").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    relatedId: (0, pg_core_1.integer)("related_id"), // Could be a package_id, earning_id, etc.
});
// Insert Schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users)
    .omit({
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
exports.insertPackageSchema = (0, drizzle_zod_1.createInsertSchema)(exports.packages)
    .omit({
    id: true,
    paidMonths: true,
    isCompleted: true,
    bonusEarned: true,
    startDate: true
});
exports.insertEMIPaymentSchema = (0, drizzle_zod_1.createInsertSchema)(exports.emiPayments)
    .omit({
    id: true,
    paymentDate: true
});
exports.insertBinaryStructureSchema = (0, drizzle_zod_1.createInsertSchema)(exports.binaryStructure)
    .omit({
    id: true
});
exports.insertEarningSchema = (0, drizzle_zod_1.createInsertSchema)(exports.earnings)
    .omit({
    id: true,
    createdAt: true
});
exports.insertWithdrawalSchema = (0, drizzle_zod_1.createInsertSchema)(exports.withdrawals)
    .omit({
    id: true,
    requestDate: true,
    processedDate: true,
    status: true
});
exports.insertAutoPoolSchema = (0, drizzle_zod_1.createInsertSchema)(exports.autoPool)
    .omit({
    id: true,
    joinDate: true
});
exports.insertTransactionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.transactions)
    .omit({
    id: true,
    createdAt: true
});
// Custom login schema
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
