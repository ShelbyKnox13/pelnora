"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.PostgresStorage = void 0;
const db_1 = require("./db");
const schema_1 = require("../shared/schema");
const drizzle_orm_1 = require("drizzle-orm");
const crypto_1 = __importDefault(require("crypto"));
class PostgresStorage {
    // Generate a unique referral ID
    generateReferralId() {
        return 'PEL' + crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
    }
    // User operations
    async getUser(id) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return result[0];
    }
    async getUserByEmail(email) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
        return result[0];
    }
    async getUserByReferralId(referralId) {
        const result = await db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.referralId, referralId));
        return result[0];
    }
    async createUser(userData) {
        try {
            console.log('Starting user creation in storage');
            const referralId = this.generateReferralId();
            const userId = 'USR' + crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
            const now = new Date();
            // Compose the full user object for insertion
            const insertObj = {
                id: userId,
                name: userData.name,
                email: userData.email,
                phone: userData.phone,
                password: userData.password,
                referralId: referralId,
                referredBy: userData.referredBy ?? null,
                role: 'user',
                isActive: true,
                isEmailVerified: false,
                leftTeamCount: 0,
                rightTeamCount: 0,
                totalEarnings: '0',
                withdrawableAmount: '0',
                bankName: null,
                accountNumber: null,
                ifscCode: null,
                kycStatus: 'pending',
                panNumber: null,
                idProofType: null,
                idProofNumber: null,
                unlockedLevels: 0,
                autoPoolEligible: false,
                lastLogin: null,
                createdAt: now,
                updatedAt: now,
                accountHolderName: null,
                isPhoneVerified: false,
                walletBalance: '0',
                totalWithdrawals: '0',
                lastLoginAt: null,
                panCardImage: null,
                kycSubmittedAt: null,
                kycReviewedAt: null,
                kycReviewedBy: null,
                kycRejectionReason: null,
                // Optional fields for email verification/reset tokens
                isEmailVerified: false,
                emailVerificationToken: null,
                emailVerificationExpires: null,
                resetPasswordToken: null,
                resetPasswordExpires: null
            };
            const [user] = await db_1.db.insert(schema_1.users).values(insertObj).returning();
            if (!user) {
                throw new Error('Failed to create user - no user returned from database');
            }
            console.log('User created successfully in storage:', { id: user.id, email: user.email });
            return user;
        }
        catch (error) {
            console.error('Error in createUser:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to create user: ${error.message}`);
            }
            throw new Error('Failed to create user: Unknown error');
        }
    }
    async updateUser(id, data) {
        const [updatedUser] = await db_1.db.update(schema_1.users)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
            .returning();
        return updatedUser;
    }
    async getAllUsers() {
        return await db_1.db.select().from(schema_1.users);
    }
    async getUserCount() {
        const result = await db_1.db.select({ count: (0, drizzle_orm_1.sql) `count(*)` }).from(schema_1.users);
        return Number(result[0].count);
    }
    async updateUserEarnings(id, amount) {
        const user = await this.getUser(id);
        if (!user)
            return undefined;
        const currentEarnings = parseFloat(user.totalEarnings);
        const updatedEarnings = (currentEarnings + amount).toFixed(2);
        // If total earnings exceed 10,000, make user eligible for auto pool
        const autoPoolEligible = parseFloat(updatedEarnings) >= 10000;
        const [updatedUser] = await db_1.db.update(schema_1.users)
            .set({
            totalEarnings: updatedEarnings,
            withdrawableAmount: (parseFloat(user.withdrawableAmount) + amount).toFixed(2),
            autoPoolEligible: user.autoPoolEligible || autoPoolEligible
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
            .returning();
        return updatedUser;
    }
    // Package operations
    async createPackage(packageData) {
        try {
            console.log('Starting package creation in storage with data:', packageData);
            const result = await db_1.db.execute((0, drizzle_orm_1.sql) `
        INSERT INTO packages (
          user_id, package_type, monthly_amount, total_months,
          direct_referrals, unlocked_levels, total_earnings,
          auto_pool_eligible, auto_pool_level, auto_pool_wallet,
          auto_pool_reward_claimed, auto_pool_assured_reward_claimed,
          emi_waiver_eligible, timely_payments_count, level_earnings,
          binary_earnings, direct_earnings, start_date, next_payment_due
        ) VALUES (
          ${packageData.userId}, ${packageData.packageType}, ${packageData.monthlyAmount}, ${packageData.totalMonths},
          0, 0, '0',
          false, 0, '0',
          false, false,
          false, 0, '0',
          '0', '0', NOW(), ${packageData.nextPaymentDue}
        ) RETURNING *
      `);
            const rows = result.rows;
            if (!rows || rows.length === 0) {
                throw new Error('Failed to create package - no package returned from database');
            }
            // Use type assertion since we know the structure matches
            const pkg = rows[0];
            if (!pkg) {
                throw new Error('Failed to create package - no package returned from database');
            }
            console.log('Package created successfully in storage:', { id: pkg.id, userId: pkg.userId });
            return pkg;
        }
        catch (error) {
            console.error('Error in createPackage:', error);
            if (error instanceof Error) {
                throw new Error(`Failed to create package: ${error.message}`);
            }
            throw new Error('Failed to create package: Unknown error');
        }
    }
    async getPackageByUserId(userId) {
        const result = await db_1.db.select().from(schema_1.packages).where((0, drizzle_orm_1.eq)(schema_1.packages.userId, userId));
        return result[0];
    }
    async updatePackage(id, data) {
        const [updatedPackage] = await db_1.db.update(schema_1.packages)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.packages.id, id))
            .returning();
        return updatedPackage;
    }
    async getAllPackages() {
        return await db_1.db.select().from(schema_1.packages);
    }
    // EMI operations
    async createEMIPayment(emiData) {
        const [newEMIPayment] = await db_1.db.insert(schema_1.emiPayments).values({
            ...emiData,
            paymentDate: new Date(),
        }).returning();
        return newEMIPayment;
    }
    async getEMIPaymentsByUserId(userId) {
        return await db_1.db.select().from(schema_1.emiPayments).where((0, drizzle_orm_1.eq)(schema_1.emiPayments.userId, userId));
    }
    async getEMIPaymentsByPackageId(packageId) {
        return await db_1.db.select().from(schema_1.emiPayments).where((0, drizzle_orm_1.eq)(schema_1.emiPayments.packageId, packageId));
    }
    async getAllEMIPayments() {
        return await db_1.db.select().from(schema_1.emiPayments);
    }
    // Binary structure operations
    async createBinaryStructure(data) {
        const [newBinaryStructure] = await db_1.db.insert(schema_1.binaryStructure).values(data).returning();
        return newBinaryStructure;
    }
    async getBinaryStructureByUserId(userId) {
        const result = await db_1.db.select().from(schema_1.binaryStructure).where((0, drizzle_orm_1.eq)(schema_1.binaryStructure.userId, userId));
        return result[0];
    }
    async getUsersBinaryDownline(userId) {
        return await db_1.db.select().from(schema_1.binaryStructure).where((0, drizzle_orm_1.eq)(schema_1.binaryStructure.parentId, userId));
    }
    // Earnings operations
    async createEarning(earningData) {
        const [newEarning] = await db_1.db.insert(schema_1.earnings).values({
            ...earningData,
            createdAt: new Date(),
        }).returning();
        return newEarning;
    }
    async getEarningsByUserId(userId) {
        return await db_1.db.select()
            .from(schema_1.earnings)
            .where((0, drizzle_orm_1.eq)(schema_1.earnings.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.earnings.createdAt));
    }
    async getAllEarnings() {
        return await db_1.db.select().from(schema_1.earnings);
    }
    // Withdrawal operations
    async createWithdrawal(withdrawalData) {
        const [newWithdrawal] = await db_1.db.insert(schema_1.withdrawals).values({
            ...withdrawalData,
            status: 'pending',
            requestDate: new Date(),
            processedDate: undefined,
            remarks: '',
        }).returning();
        return newWithdrawal;
    }
    async getWithdrawalsByUserId(userId) {
        return await db_1.db.select()
            .from(schema_1.withdrawals)
            .where((0, drizzle_orm_1.eq)(schema_1.withdrawals.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.withdrawals.requestDate));
    }
    async updateWithdrawal(id, data) {
        const [updatedWithdrawal] = await db_1.db.update(schema_1.withdrawals)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.withdrawals.id, id))
            .returning();
        return updatedWithdrawal;
    }
    async getAllWithdrawals() {
        return await db_1.db.select().from(schema_1.withdrawals);
    }
    // Auto pool operations
    async createAutoPoolEntry(data) {
        const [newAutoPool] = await db_1.db.insert(schema_1.autoPool).values(data).returning();
        return newAutoPool;
    }
    async getAutoPoolEntriesByUserId(userId) {
        return await db_1.db.select().from(schema_1.autoPool).where((0, drizzle_orm_1.eq)(schema_1.autoPool.userId, userId));
    }
    async getAutoPoolMatrix() {
        return await db_1.db.select().from(schema_1.autoPool);
    }
    // Transaction operations
    async createTransaction(data) {
        const [newTransaction] = await db_1.db.insert(schema_1.transactions).values(data).returning();
        return newTransaction;
    }
    async getTransactionsByUserId(userId) {
        return await db_1.db.select()
            .from(schema_1.transactions)
            .where((0, drizzle_orm_1.eq)(schema_1.transactions.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt));
    }
    // KYC operations
    async getKYCSubmissions() {
        const submissions = await db_1.db
            .select({
            id: schema_1.kycSubmissions.id,
            userId: schema_1.kycSubmissions.userId,
            userName: schema_1.users.name,
            userEmail: schema_1.users.email,
            panNumber: schema_1.kycSubmissions.panNumber,
            idProofType: schema_1.kycSubmissions.idProofType,
            idProofNumber: schema_1.kycSubmissions.idProofNumber,
            panCardImage: schema_1.kycSubmissions.panCardImage,
            idProofImage: schema_1.kycSubmissions.idProofImage,
            status: schema_1.kycSubmissions.status,
            submittedAt: schema_1.kycSubmissions.submittedAt,
            reviewedAt: schema_1.kycSubmissions.reviewedAt,
        })
            .from(schema_1.kycSubmissions)
            .innerJoin(schema_1.users, (0, drizzle_orm_1.eq)(schema_1.kycSubmissions.userId, schema_1.users.id))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.kycSubmissions.submittedAt));
        return submissions;
    }
    async approveKYCSubmission(submissionId, reviewerId) {
        const submission = await db_1.db
            .select()
            .from(schema_1.kycSubmissions)
            .where((0, drizzle_orm_1.eq)(schema_1.kycSubmissions.id, submissionId))
            .limit(1);
        if (!submission.length) {
            return null;
        }
        const now = new Date();
        // Update KYC submission
        await db_1.db
            .update(schema_1.kycSubmissions)
            .set({
            status: 'approved',
            reviewedAt: now,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.kycSubmissions.id, submissionId));
        // Update user's KYC status
        const [updatedUser] = await db_1.db
            .update(schema_1.users)
            .set({
            kycStatus: 'approved',
            kycReviewedAt: now,
            kycReviewedBy: reviewerId,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, submission[0].userId))
            .returning();
        return updatedUser || null;
    }
    async rejectKYCSubmission(submissionId, reviewerId) {
        const submission = await db_1.db
            .select()
            .from(schema_1.kycSubmissions)
            .where((0, drizzle_orm_1.eq)(schema_1.kycSubmissions.id, submissionId))
            .limit(1);
        if (!submission.length) {
            return null;
        }
        const now = new Date();
        // Update KYC submission
        await db_1.db
            .update(schema_1.kycSubmissions)
            .set({
            status: 'rejected',
            reviewedAt: now,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.kycSubmissions.id, submissionId));
        // Update user's KYC status
        const [updatedUser] = await db_1.db
            .update(schema_1.users)
            .set({
            kycStatus: 'rejected',
            kycReviewedAt: now,
            kycReviewedBy: reviewerId,
        })
            .where((0, drizzle_orm_1.eq)(schema_1.users.id, submission[0].userId))
            .returning();
        return updatedUser || null;
    }
    // Ticket operations
    async createTicket(ticketData) {
        const ticketId = 'TKT-' + crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
        const [newTicket] = await db_1.db.insert(schema_1.tickets).values({
            ...ticketData,
            id: ticketId,
            status: 'open',
            createdAt: new Date(),
            updatedAt: new Date(),
        }).returning();
        return newTicket;
    }
    async getTicketById(id) {
        const result = await db_1.db.select().from(schema_1.tickets).where((0, drizzle_orm_1.eq)(schema_1.tickets.id, id));
        return result[0];
    }
    async getAllTickets() {
        return await db_1.db.select()
            .from(schema_1.tickets)
            .orderBy((0, drizzle_orm_1.desc)(schema_1.tickets.createdAt));
    }
    async getTicketsByStatus(status) {
        return await db_1.db.select()
            .from(schema_1.tickets)
            .where((0, drizzle_orm_1.eq)(schema_1.tickets.status, status))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.tickets.createdAt));
    }
    async getTicketsByUser(userId) {
        return await db_1.db.select()
            .from(schema_1.tickets)
            .where((0, drizzle_orm_1.eq)(schema_1.tickets.createdBy, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.tickets.createdAt));
    }
    async updateTicket(id, data) {
        const [updatedTicket] = await db_1.db.update(schema_1.tickets)
            .set({
            ...data,
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tickets.id, id))
            .returning();
        return updatedTicket;
    }
    async closeTicket(id) {
        const [closedTicket] = await db_1.db.update(schema_1.tickets)
            .set({
            status: 'closed',
            closedAt: new Date(),
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tickets.id, id))
            .returning();
        return closedTicket;
    }
    async assignTicket(id, assignedTo) {
        const [assignedTicket] = await db_1.db.update(schema_1.tickets)
            .set({
            assignedTo,
            status: 'in-progress',
            updatedAt: new Date()
        })
            .where((0, drizzle_orm_1.eq)(schema_1.tickets.id, id))
            .returning();
        return assignedTicket;
    }
    // Ticket Reply operations
    async createTicketReply(replyData) {
        const [newReply] = await db_1.db.insert(schema_1.ticketReplies).values({
            ...replyData,
            createdAt: new Date(),
        }).returning();
        return newReply;
    }
    // Level statistics operations
    async initializeLevelStatistics(userId) {
        console.log('Initializing level statistics for user:', userId);
        try {
            // Create level statistics entries for levels 1-20
            const levelEntries = [];
            for (let level = 1; level <= 20; level++) {
                levelEntries.push({
                    userId,
                    level,
                    status: level === 1 ? 'unlocked' : 'locked',
                    memberCount: 0,
                    earnings: "0",
                    lastUpdated: new Date()
                });
            }
            await db_1.db.insert(schema_1.levelStatistics).values(levelEntries);
            console.log('Level statistics initialized successfully for user:', userId);
        }
        catch (error) {
            console.error('Error initializing level statistics:', error);
            throw error;
        }
    }
    async updateLevelStatistics(userId, level) {
        console.log(`Updating level statistics for user: ${userId}, level: ${level}`);
        try {
            await db_1.db.update(schema_1.levelStatistics)
                .set({
                status: 'unlocked',
                lastUpdated: new Date()
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.levelStatistics.userId, userId), (0, drizzle_orm_1.eq)(schema_1.levelStatistics.level, level)));
            console.log('Level statistics updated successfully');
        }
        catch (error) {
            console.error('Error updating level statistics:', error);
            throw error;
        }
    }
    async getTicketReplies(ticketId) {
        return await db_1.db.select()
            .from(schema_1.ticketReplies)
            .where((0, drizzle_orm_1.eq)(schema_1.ticketReplies.ticketId, ticketId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.ticketReplies.createdAt));
    }
    // Binary structure operations
    async createBinaryStructure(data) {
        const [newBinaryStructure] = await db_1.db.insert(schema_1.binaryStructure).values(data).returning();
        return newBinaryStructure;
    }
    async getBinaryStructureByUserId(userId) {
        const result = await db_1.db.select().from(schema_1.binaryStructure).where((0, drizzle_orm_1.eq)(schema_1.binaryStructure.userId, userId));
        return result[0];
    }
    async getUsersBinaryDownline(userId) {
        return await db_1.db.select().from(schema_1.binaryStructure).where((0, drizzle_orm_1.eq)(schema_1.binaryStructure.parentId, userId));
    }
    async getBinaryBusinessInfo(userId) {
        const user = await this.getUser(userId);
        if (!user) {
            console.log(`User ${userId} not found`);
            return {
                leftTeamBusiness: "0",
                rightTeamBusiness: "0",
                leftCarryForward: "0",
                rightCarryForward: "0"
            };
        }
        console.log(`\n=== Binary Business Info Calculation for ${user.name} (ID: ${userId}) ===`);
        console.log(`User team counts - Left: ${user.leftTeamCount}, Right: ${user.rightTeamCount}`);
        // Get all binary structures to calculate the complete downline
        const allBinaryStructures = await db_1.db.select().from(schema_1.binaryStructure);
        const allUsers = await db_1.db.select().from(schema_1.users);
        // Recursively find all users in a position (left or right) including their downlines
        const getCompleteTeam = (rootUserId, position) => {
            // Get direct children first
            const directChildren = allBinaryStructures
                .filter(bs => bs.parentId === rootUserId && bs.position === position)
                .map(bs => bs.userId);
            console.log(`Direct ${position} children for user ${rootUserId}:`, directChildren);
            // Then recursively get all of their children (regardless of position)
            let allTeamMembers = [...directChildren];
            for (const childId of directChildren) {
                // For each direct child, get their entire downline
                const leftDownline = getCompleteTeam(childId, 'left');
                const rightDownline = getCompleteTeam(childId, 'right');
                allTeamMembers = [...allTeamMembers, ...leftDownline, ...rightDownline];
            }
            return allTeamMembers;
        };
        // Get complete left and right teams
        const leftTeamUserIds = getCompleteTeam(userId, 'left');
        const rightTeamUserIds = getCompleteTeam(userId, 'right');
        console.log(`\nLeft team user IDs: [${leftTeamUserIds.join(', ')}]`);
        console.log(`Right team user IDs: [${rightTeamUserIds.join(', ')}]`);
        const leftTeamUsers = allUsers.filter(u => leftTeamUserIds.includes(u.id));
        const rightTeamUsers = allUsers.filter(u => rightTeamUserIds.includes(u.id));
        console.log(`\nLeft team users: ${leftTeamUsers.map(u => `${u.name} (ID: ${u.id})`).join(', ')}`);
        console.log(`Right team users: ${rightTeamUsers.map(u => `${u.name} (ID: ${u.id})`).join(', ')}`);
        // Calculate total business volume for each team
        let leftTeamBusiness = 0;
        let rightTeamBusiness = 0;
        // Calculate left team business
        console.log('\nCalculating left team business:');
        for (const leftUser of leftTeamUsers) {
            const userPackage = await this.getPackageByUserId(leftUser.id);
            console.log(`\nLeft user ${leftUser.name} (ID: ${leftUser.id}) package:`, userPackage);
            if (userPackage) {
                const packageValue = parseFloat(userPackage.monthlyAmount) * userPackage.totalMonths;
                leftTeamBusiness += packageValue;
                console.log(`Added ₹${packageValue} to left team business (${userPackage.monthlyAmount} x ${userPackage.totalMonths})`);
            }
            else {
                console.log(`No package found for left user ${leftUser.name} (ID: ${leftUser.id})`);
            }
        }
        // Calculate right team business
        console.log('\nCalculating right team business:');
        for (const rightUser of rightTeamUsers) {
            const userPackage = await this.getPackageByUserId(rightUser.id);
            console.log(`\nRight user ${rightUser.name} (ID: ${rightUser.id}) package:`, userPackage);
            if (userPackage) {
                const packageValue = parseFloat(userPackage.monthlyAmount) * userPackage.totalMonths;
                rightTeamBusiness += packageValue;
                console.log(`Added ₹${packageValue} to right team business (${userPackage.monthlyAmount} x ${userPackage.totalMonths})`);
            }
            else {
                console.log(`No package found for right user ${rightUser.name} (ID: ${rightUser.id})`);
            }
        }
        console.log(`\nFinal business volumes - Left: ₹${leftTeamBusiness}, Right: ₹${rightTeamBusiness}`);
        console.log(`Carry forward - Left: ₹${user.leftCarryForward || '0'}, Right: ₹${user.rightCarryForward || '0'}`);
        return {
            leftTeamBusiness: leftTeamBusiness.toString(),
            rightTeamBusiness: rightTeamBusiness.toString(),
            leftCarryForward: user.leftCarryForward || "0",
            rightCarryForward: user.rightCarryForward || "0"
        };
    }
    // Earnings operations
    async createEarning(earningData) {
        const [newEarning] = await db_1.db.insert(schema_1.earnings).values({
            ...earningData,
            createdAt: new Date(),
        }).returning();
        // Create a transaction record for this earning
        await this.createTransaction({
            userId: earningData.userId,
            amount: earningData.amount,
            type: 'earning',
            description: `${earningData.earningType} income: ${earningData.description || ''}`,
            relatedId: newEarning.id,
        });
        return newEarning;
    }
    async getEarningsByUserId(userId) {
        return await db_1.db.select()
            .from(schema_1.earnings)
            .where((0, drizzle_orm_1.eq)(schema_1.earnings.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.earnings.createdAt));
    }
    async getUserEarnings(userId) {
        return this.getEarningsByUserId(userId);
    }
    async getAllEarnings() {
        return await db_1.db.select().from(schema_1.earnings);
    }
    // Withdrawal operations
    async createWithdrawal(withdrawalData) {
        const [newWithdrawal] = await db_1.db.insert(schema_1.withdrawals).values({
            ...withdrawalData,
            status: 'pending',
            requestDate: new Date(),
        }).returning();
        // Reduce withdrawable amount from user
        const user = await this.getUser(withdrawalData.userId);
        if (user) {
            const withdrawable = Math.max(0, parseFloat(user.withdrawableAmount) - parseFloat(withdrawalData.amount));
            await this.updateUser(withdrawalData.userId, {
                withdrawableAmount: withdrawable.toFixed(2)
            });
        }
        return newWithdrawal;
    }
    async getWithdrawalsByUserId(userId) {
        return await db_1.db.select()
            .from(schema_1.withdrawals)
            .where((0, drizzle_orm_1.eq)(schema_1.withdrawals.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.withdrawals.requestDate));
    }
    async updateWithdrawal(id, data) {
        const [updatedWithdrawal] = await db_1.db.update(schema_1.withdrawals)
            .set(data)
            .where((0, drizzle_orm_1.eq)(schema_1.withdrawals.id, id))
            .returning();
        return updatedWithdrawal;
    }
    async getAllWithdrawals() {
        return await db_1.db.select().from(schema_1.withdrawals);
    }
    // Auto pool operations
    async createAutoPoolEntry(data) {
        const [newAutoPool] = await db_1.db.insert(schema_1.autoPool).values(data).returning();
        return newAutoPool;
    }
    async getAutoPoolEntriesByUserId(userId) {
        return await db_1.db.select().from(schema_1.autoPool).where((0, drizzle_orm_1.eq)(schema_1.autoPool.userId, userId));
    }
    async getAutoPoolMatrix() {
        return await db_1.db.select().from(schema_1.autoPool);
    }
    // Transaction operations
    async createTransaction(data) {
        const [newTransaction] = await db_1.db.insert(schema_1.transactions).values({
            ...data,
            createdAt: new Date(),
        }).returning();
        return newTransaction;
    }
    async getTransactionsByUserId(userId) {
        return await db_1.db.select()
            .from(schema_1.transactions)
            .where((0, drizzle_orm_1.eq)(schema_1.transactions.userId, userId))
            .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt));
    }
    // Level structure operations
    async getUsersAtLevel(userId, level) {
        // This is a placeholder implementation
        // In a real implementation, you would need to traverse the referral tree
        return [];
    }
    async calculateLevelEarnings(userId) {
        // This is a placeholder implementation
        return [];
    }
    // Demo earnings generation
    async generateDemoEarnings(userId) {
        // This is a placeholder method to prevent errors
        console.log(`Demo earnings generation called for user ${userId}`);
    }
}
exports.PostgresStorage = PostgresStorage;
exports.storage = new PostgresStorage();
