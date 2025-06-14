"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.insertTicketReplySchema = exports.insertTicketSchema = exports.insertKYCSubmissionSchema = exports.insertLevelStatisticsSchema = exports.insertTransactionSchema = exports.insertAutoPoolSchema = exports.insertWithdrawalSchema = exports.insertEarningSchema = exports.insertBinaryStructureSchema = exports.insertEMIPaymentSchema = exports.insertPackageSchema = exports.insertUserSchema = exports.ticketReplies = exports.tickets = exports.kycSubmissions = exports.notifications = exports.levelStatistics = exports.transactions = exports.autoPool = exports.withdrawals = exports.earnings = exports.binaryStructure = exports.emiPayments = exports.packages = exports.users = exports.ticketPriorityEnum = exports.ticketStatusEnum = exports.kycStatusEnum = exports.transactionTypeEnum = exports.earningTypeEnum = exports.withdrawalStatusEnum = exports.emiStatusEnum = exports.packageTypeEnum = exports.userRoleEnum = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
var zod_1 = require("zod");
// Enums
exports.userRoleEnum = (0, pg_core_1.pgEnum)('user_role', ['user', 'admin']);
exports.packageTypeEnum = (0, pg_core_1.pgEnum)('package_type', ['basic', 'silver', 'gold', 'platinum', 'diamond']);
exports.emiStatusEnum = (0, pg_core_1.pgEnum)('emi_status', ['pending', 'paid', 'late', 'bonus_earned']);
exports.withdrawalStatusEnum = (0, pg_core_1.pgEnum)('withdrawal_status', ['pending', 'approved', 'rejected']);
exports.earningTypeEnum = (0, pg_core_1.pgEnum)('earning_type', ['direct', 'binary', 'level', 'autopool', 'emi_bonus']);
exports.transactionTypeEnum = (0, pg_core_1.pgEnum)('transaction_type', ['emi_payment', 'earning', 'withdrawal', 'deduction']);
exports.kycStatusEnum = (0, pg_core_1.pgEnum)('kyc_status', ['pending', 'approved', 'rejected']);
exports.ticketStatusEnum = (0, pg_core_1.pgEnum)('ticket_status', ['open', 'in-progress', 'closed']);
exports.ticketPriorityEnum = (0, pg_core_1.pgEnum)('ticket_priority', ['low', 'medium', 'high']);
// Users table
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.text)('id').primaryKey(),
    name: (0, pg_core_1.varchar)('name', { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)('email', { length: 255 }).notNull().unique(),
    phone: (0, pg_core_1.text)("phone").notNull(),
    password: (0, pg_core_1.text)("password").notNull(),
    referralId: (0, pg_core_1.text)("referral_id").notNull().unique(),
    referredBy: (0, pg_core_1.text)("referred_by").references(function () { return exports.users.id; }),
    role: (0, exports.userRoleEnum)("role").default('user').notNull(),
    isActive: (0, pg_core_1.boolean)("is_active").default(true).notNull(),
    isEmailVerified: (0, pg_core_1.boolean)("is_email_verified").default(false).notNull(),
    emailVerificationToken: (0, pg_core_1.text)("email_verification_token"),
    emailVerificationExpires: (0, pg_core_1.timestamp)("email_verification_expires"),
    resetPasswordToken: (0, pg_core_1.text)("reset_password_token"),
    resetPasswordExpires: (0, pg_core_1.timestamp)("reset_password_expires"),
    leftTeamCount: (0, pg_core_1.integer)("left_team_count").default(0).notNull(),
    rightTeamCount: (0, pg_core_1.integer)("right_team_count").default(0).notNull(),
    totalEarnings: (0, pg_core_1.numeric)("total_earnings").default("0").notNull(),
    withdrawableAmount: (0, pg_core_1.numeric)("withdrawable_amount").default("0").notNull(),
    bankName: (0, pg_core_1.text)("bank_name"),
    accountNumber: (0, pg_core_1.text)("account_number"),
    ifscCode: (0, pg_core_1.text)("ifsc_code"),
    kycStatus: (0, pg_core_1.varchar)('kyc_status', { length: 20 }).default('pending'),
    panNumber: (0, pg_core_1.text)("pan_number"),
    idProofType: (0, pg_core_1.text)("id_proof_type"),
    idProofNumber: (0, pg_core_1.text)("id_proof_number"),
    unlockedLevels: (0, pg_core_1.integer)("unlocked_levels").default(0).notNull(),
    autoPoolEligible: (0, pg_core_1.boolean)("auto_pool_eligible").default(false).notNull(),
    lastLogin: (0, pg_core_1.timestamp)("last_login"),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
    accountHolderName: (0, pg_core_1.text)("account_holder_name"),
    isPhoneVerified: (0, pg_core_1.boolean)("is_phone_verified").default(false).notNull(),
    walletBalance: (0, pg_core_1.numeric)("wallet_balance").default("0").notNull(),
    totalWithdrawals: (0, pg_core_1.numeric)("total_withdrawals").default("0").notNull(),
    lastLoginAt: (0, pg_core_1.timestamp)("last_login_at"),
    panCardImage: (0, pg_core_1.text)("pan_card_image"),
    kycSubmittedAt: (0, pg_core_1.timestamp)("kyc_submitted_at"),
    kycReviewedAt: (0, pg_core_1.timestamp)("kyc_reviewed_at"),
    kycReviewedBy: (0, pg_core_1.text)("kyc_reviewed_by").references(function () { return exports.users.id; }),
    kycRejectionReason: (0, pg_core_1.text)("kyc_rejection_reason"),
});
// Packages table
exports.packages = (0, pg_core_1.pgTable)("packages", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull().references(function () { return exports.users.id; }),
    packageType: (0, exports.packageTypeEnum)("package_type").notNull(),
    monthlyAmount: (0, pg_core_1.numeric)("monthly_amount").notNull(),
    totalMonths: (0, pg_core_1.integer)("total_months").default(12).notNull(),
    paidMonths: (0, pg_core_1.integer)("paid_months").default(0).notNull(),
    isCompleted: (0, pg_core_1.boolean)("is_completed").default(false).notNull(),
    bonusEarned: (0, pg_core_1.boolean)("bonus_earned").default(false).notNull(),
    startDate: (0, pg_core_1.timestamp)("start_date").defaultNow().notNull(),
    nextPaymentDue: (0, pg_core_1.timestamp)("next_payment_due"),
    lastPaymentDate: (0, pg_core_1.timestamp)("last_payment_date"),
    directReferrals: (0, pg_core_1.integer)("direct_referrals").default(0).notNull(),
    unlockedLevels: (0, pg_core_1.integer)("unlocked_levels").default(0).notNull(),
    totalEarnings: (0, pg_core_1.numeric)("total_earnings").default("0").notNull(),
    autoPoolEligible: (0, pg_core_1.boolean)("auto_pool_eligible").default(false).notNull(),
    autoPoolLevel: (0, pg_core_1.integer)("auto_pool_level").default(0).notNull(),
    autoPoolWallet: (0, pg_core_1.numeric)("auto_pool_wallet").default("0").notNull(),
    autoPoolRewardClaimed: (0, pg_core_1.boolean)("auto_pool_reward_claimed").default(false).notNull(),
    autoPoolAssuredRewardClaimed: (0, pg_core_1.boolean)("auto_pool_assured_reward_claimed").default(false).notNull(),
    emiWaiverEligible: (0, pg_core_1.boolean)("emi_waiver_eligible").default(false).notNull(),
    timelyPaymentsCount: (0, pg_core_1.integer)("timely_payments_count").default(0).notNull(),
    levelEarnings: (0, pg_core_1.numeric)("level_earnings").default("0").notNull(),
    binaryEarnings: (0, pg_core_1.numeric)("binary_earnings").default("0").notNull(),
    directEarnings: (0, pg_core_1.numeric)("direct_earnings").default("0").notNull(),
});
// EMI Payments table
exports.emiPayments = (0, pg_core_1.pgTable)("emi_payments", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    packageId: (0, pg_core_1.integer)("package_id").notNull().references(function () { return exports.packages.id; }),
    userId: (0, pg_core_1.text)("user_id").notNull().references(function () { return exports.users.id; }),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    paymentDate: (0, pg_core_1.timestamp)("payment_date").defaultNow().notNull(),
    status: (0, exports.emiStatusEnum)("status").default('paid').notNull(),
    month: (0, pg_core_1.integer)("month").notNull(),
    isOnTime: (0, pg_core_1.boolean)("is_on_time").default(true).notNull(),
    paymentDay: (0, pg_core_1.integer)("payment_day").notNull(),
});
// Binary Structure table
exports.binaryStructure = (0, pg_core_1.pgTable)("binary_structure", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull().references(function () { return exports.users.id; }),
    parentId: (0, pg_core_1.text)("parent_id").references(function () { return exports.users.id; }),
    position: (0, pg_core_1.text)("position").notNull(), // 'left' or 'right'
    level: (0, pg_core_1.integer)("level").notNull(),
});
// Earnings table
exports.earnings = (0, pg_core_1.pgTable)("earnings", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull().references(function () { return exports.users.id; }),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    earningType: (0, exports.earningTypeEnum)("earning_type").notNull(),
    description: (0, pg_core_1.text)("description"),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    relatedUserId: (0, pg_core_1.text)("related_user_id").references(function () { return exports.users.id; }),
});
// Withdrawals table
exports.withdrawals = (0, pg_core_1.pgTable)("withdrawals", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull().references(function () { return exports.users.id; }),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    status: (0, exports.withdrawalStatusEnum)("status").default('pending').notNull(),
    requestDate: (0, pg_core_1.timestamp)("request_date").defaultNow().notNull(),
    processedDate: (0, pg_core_1.timestamp)("processed_date"),
    remarks: (0, pg_core_1.text)("remarks"),
});
// Auto Pool table
exports.autoPool = (0, pg_core_1.pgTable)("auto_pool", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull().references(function () { return exports.users.id; }),
    position: (0, pg_core_1.integer)("position").notNull(),
    level: (0, pg_core_1.integer)("level").notNull(), // 1, 2, or 3 for the 1:3:9 structure
    parentId: (0, pg_core_1.text)("parent_id").references(function () { return exports.autoPool.id; }),
    joinDate: (0, pg_core_1.timestamp)("join_date").defaultNow().notNull(),
});
// Transactions table
exports.transactions = (0, pg_core_1.pgTable)("transactions", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull().references(function () { return exports.users.id; }),
    amount: (0, pg_core_1.numeric)("amount").notNull(),
    type: (0, exports.transactionTypeEnum)("type").notNull(),
    description: (0, pg_core_1.text)("description").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow().notNull(),
    relatedId: (0, pg_core_1.text)("related_id"), // Could be a package_id, earning_id, etc.
});
// Level Statistics table
exports.levelStatistics = (0, pg_core_1.pgTable)("level_statistics", {
    id: (0, pg_core_1.serial)("id").primaryKey(),
    userId: (0, pg_core_1.text)("user_id").notNull().references(function () { return exports.users.id; }),
    level: (0, pg_core_1.integer)("level").notNull(),
    status: (0, pg_core_1.text)("status").notNull().default('locked'), // 'locked' or 'unlocked'
    memberCount: (0, pg_core_1.integer)("member_count").default(0).notNull(),
    earnings: (0, pg_core_1.numeric)("earnings").default("0").notNull(),
    lastUpdated: (0, pg_core_1.timestamp)("last_updated").defaultNow().notNull(),
});
// Notifications table
exports.notifications = (0, pg_core_1.pgTable)('notifications', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    userId: (0, pg_core_1.text)('userId').notNull().references(function () { return exports.users.id; }, { onDelete: 'cascade' }),
    type: (0, pg_core_1.varchar)('type', { length: 50 }).notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    isRead: (0, pg_core_1.boolean)('isRead').default(false),
    createdAt: (0, pg_core_1.timestamp)('createdAt', { withTimezone: true }).defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updatedAt', { withTimezone: true }).defaultNow(),
});
// KYC Submissions table
exports.kycSubmissions = (0, pg_core_1.pgTable)('kyc_submissions', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    userId: (0, pg_core_1.text)('user_id').references(function () { return exports.users.id; }).notNull(),
    panNumber: (0, pg_core_1.varchar)('pan_number', { length: 10 }).notNull(),
    idProofType: (0, pg_core_1.varchar)('id_proof_type', { length: 50 }).notNull(),
    idProofNumber: (0, pg_core_1.varchar)('id_proof_number', { length: 50 }).notNull(),
    panCardImage: (0, pg_core_1.text)('pan_card_image').notNull(),
    idProofImage: (0, pg_core_1.text)('id_proof_image').notNull(),
    status: (0, pg_core_1.varchar)('status', { length: 20 }).default('pending'),
    submittedAt: (0, pg_core_1.timestamp)('submitted_at').defaultNow(),
    reviewedAt: (0, pg_core_1.timestamp)('reviewed_at'),
});
// Support Tickets table
exports.tickets = (0, pg_core_1.pgTable)('tickets', {
    id: (0, pg_core_1.text)('id').primaryKey(),
    subject: (0, pg_core_1.text)('subject').notNull(),
    description: (0, pg_core_1.text)('description').notNull(),
    status: (0, exports.ticketStatusEnum)('status').default('open').notNull(),
    priority: (0, exports.ticketPriorityEnum)('priority').default('medium').notNull(),
    createdBy: (0, pg_core_1.text)('created_by').references(function () { return exports.users.id; }).notNull(),
    assignedTo: (0, pg_core_1.text)('assigned_to').references(function () { return exports.users.id; }),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow().notNull(),
    closedAt: (0, pg_core_1.timestamp)('closed_at'),
});
// Ticket Replies table
exports.ticketReplies = (0, pg_core_1.pgTable)('ticket_replies', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    ticketId: (0, pg_core_1.text)('ticket_id').references(function () { return exports.tickets.id; }).notNull(),
    userId: (0, pg_core_1.text)('user_id').references(function () { return exports.users.id; }).notNull(),
    message: (0, pg_core_1.text)('message').notNull(),
    createdAt: (0, pg_core_1.timestamp)('created_at').defaultNow().notNull(),
});
// Insert Schemas
exports.insertUserSchema = (0, drizzle_zod_1.createInsertSchema)(exports.users)
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
exports.insertLevelStatisticsSchema = (0, drizzle_zod_1.createInsertSchema)(exports.levelStatistics)
    .omit({
    id: true,
    lastUpdated: true
});
exports.insertKYCSubmissionSchema = (0, drizzle_zod_1.createInsertSchema)(exports.kycSubmissions)
    .omit({
    id: true,
    status: true,
    submittedAt: true,
    reviewedAt: true,
    reviewedBy: true,
    rejectionReason: true
});
exports.insertTicketSchema = (0, drizzle_zod_1.createInsertSchema)(exports.tickets)
    .omit({
    id: true,
    status: true,
    createdAt: true,
    updatedAt: true,
    closedAt: true,
    assignedTo: true
});
exports.insertTicketReplySchema = (0, drizzle_zod_1.createInsertSchema)(exports.ticketReplies)
    .omit({
    id: true,
    createdAt: true
});
// Custom login schema
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6),
});
