"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.MemStorage = void 0;
const crypto = __importStar(require("crypto"));
// Memory storage implementation
class MemStorage {
    constructor() {
        // Notifications
        this.notificationIdCounter = 1;
        this.notifications = new Map();
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
        // Create Pelnora user for testing
        this.createUser({
            name: "Pelnora",
            email: "test@pelnora.com",
            phone: ["9876543210"],
            password: "test123",
            role: "user",
            isActive: true,
        }).then(async (pelnoraUser) => {
            // Create a Diamond package (₹10,000/month) for Pelnora user
            await this.createPackage({
                userId: pelnoraUser.id,
                packageType: "diamond",
                monthlyAmount: "10000",
                totalMonths: 11,
            });
        });
    }
    // Generate a unique referral ID
    generateReferralId() {
        return 'PEL' + crypto.randomBytes(4).toString('hex').toUpperCase();
    }
    // User operations
    async getUser(id) {
        return this.users.get(id);
    }
    async getUserByEmail(email) {
        return Array.from(this.users.values()).find((user) => user.email.toLowerCase() === email.toLowerCase());
    }
    async getUserByReferralId(referralId) {
        return Array.from(this.users.values()).find((user) => user.referralId === referralId);
    }
    async createUser(userData, referredById, placementPosition) {
        const id = this.userIdCounter++;
        const referralId = this.generateReferralId();
        const user = {
            ...userData,
            id,
            referralId,
            referredBy: referredById,
            leftTeamCount: 0,
            rightTeamCount: 0,
            leftCarryForward: "0",
            rightCarryForward: "0",
            totalEarnings: "0",
            withdrawableAmount: "0",
            unlockedLevels: 0, // Start with 0 levels, unlock based on referrals
            autoPoolEligible: false,
            kycStatus: false,
            isActive: true,
            createdAt: new Date(),
        };
        this.users.set(id, user);
        console.log(`Created user: ${user.name} (ID: ${id})`);
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
                    userId: id,
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
                }
                else {
                    await this.updateUser(referredById, {
                        rightTeamCount: referrer.rightTeamCount + 1
                    });
                    console.log(`Updated ${referrer.name}'s right team count to ${referrer.rightTeamCount + 1}`);
                }
            }
        }
        return user;
    }
    async updateUser(id, data) {
        const user = await this.getUser(id);
        if (!user)
            return undefined;
        const updatedUser = { ...user, ...data };
        this.users.set(id, updatedUser);
        return updatedUser;
    }
    async getAllUsers() {
        return Array.from(this.users.values());
    }
    async updateUserEarnings(id, amount) {
        const user = await this.getUser(id);
        if (!user)
            return undefined;
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
    async getUserCount() {
        return this.users.size;
    }
    // All earnings are now calculated in real-time when packages are purchased
    // Real earnings calculation when package is purchased
    async calculateRealEarnings(buyerUserId, packagePurchased) {
        console.log(`Calculating real earnings for package purchase by user ${buyerUserId}`);
        const buyer = await this.getUser(buyerUserId);
        if (!buyer) {
            console.log(`Buyer user ${buyerUserId} not found`);
            return;
        }
        const monthlyAmount = parseFloat(packagePurchased.monthlyAmount);
        const totalPackageValue = monthlyAmount * packagePurchased.totalMonths;
        console.log(`Package purchased: ${packagePurchased.packageType} - Monthly: ₹${monthlyAmount}, Total: ₹${totalPackageValue}`);
        // 1. DIRECT INCOME: 5% of monthly amount (one-time payment at signup)
        if (buyer.referredBy) {
            const referrer = await this.getUser(buyer.referredBy);
            if (referrer) {
                const directIncome = monthlyAmount * 0.05; // 5% of monthly amount only
                await this.createEarning({
                    userId: referrer.id,
                    amount: directIncome.toString(),
                    earningType: 'direct',
                    description: `Direct income: 5% of ${buyer.name}'s ${packagePurchased.packageType} package (₹${monthlyAmount}/month)`,
                    relatedUserId: buyer.id,
                });
                await this.updateUserEarnings(referrer.id, directIncome);
                console.log(`Direct income: ₹${directIncome} paid to ${referrer.name} (ID: ${referrer.id})`);
                // 2. BINARY INCOME: Calculate binary income for entire upline
                await this.calculateUplineBinaryIncome(referrer.id, totalPackageValue);
                // 3. LEVEL INCOME: Distribute to upline levels
                // The calculateLevelIncome function will now properly skip the direct referrer
                // and only distribute level income to the appropriate upline users
                await this.calculateLevelIncome(buyerUserId, monthlyAmount);
            }
        }
    }
    // Calculate binary income for a user with proper 2:1 or 1:2 matching and carry forward
    async calculateBinaryIncome(userId, newMemberPackageAmount) {
        const user = await this.getUser(userId);
        if (!user)
            return;
        console.log(`Calculating binary income for user ${userId} with new member package amount: ₹${newMemberPackageAmount}`);
        // Get all binary structures to calculate the complete downline (including team members' referrals)
        const allBinaryStructures = Array.from(this.binaryStructures.values());
        const allUsers = await this.getAllUsers();
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
        const leftTeamUsers = allUsers.filter(u => leftTeamUserIds.includes(u.id));
        const rightTeamUsers = allUsers.filter(u => rightTeamUserIds.includes(u.id));
        // Calculate actual business volumes based on package amounts
        let leftVolume = parseFloat(user.leftCarryForward || "0");
        let rightVolume = parseFloat(user.rightCarryForward || "0");
        console.log(`Initial volumes - Left: ₹${leftVolume}, Right: ₹${rightVolume}`);
        // Add volumes from left team members
        for (const leftUser of leftTeamUsers) {
            const userPackage = await this.getPackageByUserId(leftUser.id);
            if (userPackage) {
                // Use total package value (monthly amount * total months) for business volume
                const packageValue = parseFloat(userPackage.monthlyAmount) * userPackage.totalMonths;
                leftVolume += packageValue;
                console.log(`Added ₹${packageValue} to left volume from ${leftUser.name}'s package`);
            }
        }
        // Add volumes from right team members
        for (const rightUser of rightTeamUsers) {
            const userPackage = await this.getPackageByUserId(rightUser.id);
            if (userPackage) {
                // Use total package value (monthly amount * total months) for business volume
                const packageValue = parseFloat(userPackage.monthlyAmount) * userPackage.totalMonths;
                rightVolume += packageValue;
                console.log(`Added ₹${packageValue} to right volume from ${rightUser.name}'s package`);
            }
        }
        console.log(`Current volumes - Left: ₹${leftVolume}, Right: ₹${rightVolume}`);
        // Get previous earnings to check if this is the first binary or not
        const previousBinaryEarnings = (await this.getEarningsByUserId(userId))
            .filter(e => e.earningType === 'binary');
        let totalBinaryIncome = 0;
        let binaryMatches = 0;
        let matchRatio = '1:1';
        // For the first binary only, use 2:1 or 1:2 matching
        if (previousBinaryEarnings.length === 0) {
            console.log('First binary match - checking for 2:1 or 1:2 ratio');
            // Check if first binary matching is possible (need at least 2:1 or 1:2 ratio)
            if ((leftTeamUsers.length >= 2 && rightTeamUsers.length >= 1) ||
                (leftTeamUsers.length >= 1 && rightTeamUsers.length >= 2)) {
                const leftCount = leftTeamUsers.length;
                const rightCount = rightTeamUsers.length;
                // Special first binary matching with 2:1 or 1:2 ratio
                if (leftCount >= 2 * rightCount) {
                    // More left members: form 2:1 pairs for first binary
                    binaryMatches = rightCount; // Each right member can pair with 2 left members
                    matchRatio = '2:1';
                }
                else if (rightCount >= 2 * leftCount) {
                    // More right members: form 1:2 pairs for first binary
                    binaryMatches = leftCount; // Each left member can pair with 2 right members
                    matchRatio = '1:2';
                }
                else {
                    // Balanced teams: form 1:1 pairs
                    binaryMatches = Math.min(leftCount, rightCount);
                }
            }
        }
        else {
            console.log('Subsequent binary match - using 1:1 ratio');
            // For subsequent binaries, always use 1:1 matching
            if (leftTeamUsers.length >= 1 && rightTeamUsers.length >= 1) {
                binaryMatches = Math.min(leftTeamUsers.length, rightTeamUsers.length);
            }
        }
        console.log(`Binary matches possible: ${binaryMatches} (Left: ${leftTeamUsers.length}, Right: ${rightTeamUsers.length}, Ratio: ${matchRatio})`);
        if (binaryMatches > 0 && leftVolume > 0 && rightVolume > 0) {
            // Calculate binary income based on weaker side volume
            const weakerSideVolume = Math.min(leftVolume, rightVolume);
            totalBinaryIncome = weakerSideVolume * 0.05; // 5% of weaker side
            console.log(`Binary income calculation: Weaker side volume: ₹${weakerSideVolume}, Income: ₹${totalBinaryIncome}`);
            if (totalBinaryIncome > 0) {
                await this.createEarning({
                    userId: userId,
                    amount: totalBinaryIncome.toString(),
                    earningType: 'binary',
                    description: `Binary matching income: ${binaryMatches} pairs with ${matchRatio} ratio (Left: ₹${leftVolume}, Right: ₹${rightVolume})`,
                });
                await this.updateUserEarnings(userId, totalBinaryIncome);
                console.log(`Total binary income: ₹${totalBinaryIncome} paid to user ${userId}`);
            }
            // Calculate carry forward (unmatched volume)
            // The matched volume is consumed, remaining becomes carry forward
            const matchedVolume = Math.min(leftVolume, rightVolume);
            leftVolume = leftVolume - matchedVolume;
            rightVolume = rightVolume - matchedVolume;
        }
        // Update carry forward volumes (remaining unmatched volume)
        await this.updateUser(userId, {
            leftCarryForward: leftVolume.toString(),
            rightCarryForward: rightVolume.toString()
        });
        console.log(`Updated carry forward - Left: ₹${leftVolume}, Right: ₹${rightVolume}`);
    }
    // Calculate binary income for entire upline when a new member joins
    async calculateUplineBinaryIncome(startUserId, newMemberPackageAmount) {
        let currentUserId = startUserId;
        let level = 1;
        // Calculate binary income for up to 10 levels in the upline
        while (level <= 10 && currentUserId) {
            const currentUser = await this.getUser(currentUserId);
            if (!currentUser)
                break;
            console.log(`Calculating binary income for upline level ${level}, user ${currentUserId}`);
            // Calculate binary income for this user
            await this.calculateBinaryIncome(currentUserId, newMemberPackageAmount);
            // Move to next level (parent)
            if (currentUser.referredBy) {
                currentUserId = currentUser.referredBy;
                level++;
            }
            else {
                break; // Reached the top of the tree
            }
        }
    }
    // Calculate level income distribution based on actual percentages
    async calculateLevelIncome(buyerUserId, monthlyAmount) {
        console.log(`Calculating level income for buyer ${buyerUserId} with package amount: ₹${monthlyAmount}`);
        // Level income percentages (updated per requirements)
        const levelPercentages = [
            0.15, // Level 1: 15%
            0.10, // Level 2: 10%
            0.05, // Level 3: 5%
            0.03, 0.03, 0.03, 0.03, 0.03, // Levels 4-8: 3% each
            0.02, 0.02, 0.02, 0.02, 0.02, 0.02, // Levels 9-14: 2% each
            0.01, 0.01, 0.01, 0.01, 0.01, 0.01 // Levels 15-20: 1% each
        ];
        const directIncome = monthlyAmount * 0.05; // 5% direct income base
        const allUsers = await this.getAllUsers();
        // Find the buyer's direct referrer first
        const buyerUser = await this.getUser(buyerUserId);
        if (!buyerUser || !buyerUser.referredBy) {
            console.log(`No direct referrer found for user ${buyerUserId}. Skipping level income.`);
            return;
        }
        // Get the direct referrer
        const directReferrerId = buyerUser.referredBy;
        const directReferrer = await this.getUser(directReferrerId);
        if (!directReferrer) {
            console.log(`Direct referrer with ID ${directReferrerId} not found. Skipping level income.`);
            return;
        }
        console.log(`Buyer's direct referrer is ${directReferrer.name} (ID: ${directReferrerId})`);
        // Skip level income for direct referrer (they already got direct income)
        console.log(`Skipping level income for direct referrer ${directReferrer.name}`);
        // Calculate level income for everyone else in the upline chain starting from the direct referrer's referrer
        let currentReferrerId = directReferrer.referredBy;
        let currentLevel = 1; // Start at level 1 for the direct referrer's referrer
        while (currentReferrerId && currentLevel <= 20) {
            const uplineUser = await this.getUser(currentReferrerId);
            if (!uplineUser)
                break;
            // Check if this upline user has unlocked this level based on their direct referrals
            const directReferralCount = allUsers.filter(u => u.referredBy === uplineUser.id).length;
            const unlockedLevels = directReferralCount * 2;
            if (currentLevel <= unlockedLevels) {
                // Calculate level income
                const levelIncome = directIncome * levelPercentages[currentLevel - 1];
                if (levelIncome > 0) {
                    // Create level income for this upline user
                    await this.createEarning({
                        userId: uplineUser.id,
                        amount: levelIncome.toString(),
                        earningType: 'level',
                        description: `Level ${currentLevel} income: ${(levelPercentages[currentLevel - 1] * 100).toFixed(0)}% from ${buyerUser.name}'s package (₹${monthlyAmount})`,
                        relatedUserId: buyerUserId,
                    });
                    await this.updateUserEarnings(uplineUser.id, levelIncome);
                    console.log(`Level ${currentLevel} income: ₹${levelIncome.toFixed(2)} (${(levelPercentages[currentLevel - 1] * 100).toFixed(0)}%) paid to ${uplineUser.name} (ID: ${uplineUser.id})`);
                }
            }
            else {
                console.log(`Level ${currentLevel} locked for user ${uplineUser.id} (${uplineUser.name}). Needs ${Math.ceil(currentLevel / 2)} direct referrals, has ${directReferralCount}`);
            }
            // Move up to the next person in the upline
            currentReferrerId = uplineUser.referredBy;
            currentLevel++;
        }
    }
    // Package operations
    async createPackage(packageData) {
        const id = this.packageIdCounter++;
        const nextPaymentDate = new Date();
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
        const newPackage = {
            ...packageData,
            id,
            paidMonths: 0,
            isCompleted: false,
            bonusEarned: false,
            startDate: new Date(),
            nextPaymentDue: nextPaymentDate,
        };
        console.log(`📦 PACKAGE CREATED: User ID ${packageData.userId}, Package Type: ${packageData.packageType}, Amount: ${packageData.monthlyAmount}`);
        this.packages.set(id, newPackage);
        console.log(`Total packages in storage after creation: ${this.packages.size}`);
        // Calculate and distribute real earnings when package is purchased
        await this.calculateRealEarnings(packageData.userId, newPackage);
        return newPackage;
    }
    async getPackageByUserId(userId) {
        console.log(`Looking for package for user ID ${userId}`);
        const allPackages = Array.from(this.packages.values());
        // Find all packages for this user (should be just one, but let's check)
        const userPackages = allPackages.filter(pkg => pkg.userId === userId);
        console.log(`Found ${userPackages.length} packages for user ${userId}`);
        if (userPackages.length > 0) {
            // For debugging, let's log all packages found for this user
            userPackages.forEach(pkg => {
                console.log(`Package ID: ${pkg.id}, Type: ${pkg.packageType}, Amount: ${pkg.monthlyAmount}`);
            });
            // Return the most recently created package (should be the only one, but just in case)
            return userPackages.sort((a, b) => new Date(b.startDate || b.createdAt).getTime() - new Date(a.startDate || a.createdAt).getTime())[0];
        }
        else {
            console.log(`⚠️ No package found for user ${userId}`);
            return undefined;
        }
    }
    async getUserPackage(userId) {
        return this.getPackageByUserId(userId);
    }
    async updatePackage(id, data) {
        const pkg = this.packages.get(id);
        if (!pkg)
            return undefined;
        const updatedPackage = { ...pkg, ...data };
        this.packages.set(id, updatedPackage);
        return updatedPackage;
    }
    async getAllPackages() {
        return Array.from(this.packages.values());
    }
    // EMI operations
    async createEMIPayment(emiData) {
        const id = this.emiPaymentIdCounter++;
        const newEMIPayment = {
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
            const bonusEarned = isCompleted && Array.from(this.emiPayments.values())
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
    async getEMIPaymentsByUserId(userId) {
        return Array.from(this.emiPayments.values()).filter((payment) => payment.userId === userId);
    }
    async getEMIPaymentsByPackageId(packageId) {
        return Array.from(this.emiPayments.values()).filter((payment) => payment.packageId === packageId);
    }
    async getAllEMIPayments() {
        return Array.from(this.emiPayments.values());
    }
    // Binary structure operations
    async createBinaryStructure(data) {
        const id = this.binaryStructureIdCounter++;
        const newBinaryStructure = {
            ...data,
            id,
        };
        this.binaryStructures.set(id, newBinaryStructure);
        // Team counts are updated in createUser method to avoid double counting
        return newBinaryStructure;
    }
    async getBinaryStructureByUserId(userId) {
        return Array.from(this.binaryStructures.values()).find((structure) => structure.userId === userId);
    }
    async getUsersBinaryDownline(userId) {
        return Array.from(this.binaryStructures.values()).filter((structure) => structure.parentId === userId);
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
        // Get all binary structures to calculate the complete downline (including team members' referrals)
        const allBinaryStructures = Array.from(this.binaryStructures.values());
        const allUsers = await this.getAllUsers();
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
        console.log(`Carry forward - Left: ₹${user.leftCarryForward}, Right: ₹${user.rightCarryForward}`);
        return {
            leftTeamBusiness: leftTeamBusiness.toString(),
            rightTeamBusiness: rightTeamBusiness.toString(),
            leftCarryForward: user.leftCarryForward,
            rightCarryForward: user.rightCarryForward
        };
    }
    // Earnings operations
    async createEarning(earningData) {
        const id = this.earningIdCounter++;
        const newEarning = {
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
    async getEarningsByUserId(userId) {
        return Array.from(this.earnings.values())
            .filter(earning => earning.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    async getUserEarnings(userId) {
        return this.getEarningsByUserId(userId);
    }
    async getAllEarnings() {
        return Array.from(this.earnings.values());
    }
    // Withdrawal operations
    async createWithdrawal(withdrawalData) {
        const id = this.withdrawalIdCounter++;
        const newWithdrawal = {
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
    async getWithdrawalsByUserId(userId) {
        return Array.from(this.withdrawals.values())
            .filter(withdrawal => withdrawal.userId === userId)
            .sort((a, b) => b.requestDate.getTime() - a.requestDate.getTime());
    }
    async updateWithdrawal(id, data) {
        const withdrawal = this.withdrawals.get(id);
        if (!withdrawal)
            return undefined;
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
    async getAllWithdrawals() {
        return Array.from(this.withdrawals.values());
    }
    // Auto pool operations
    async createAutoPoolEntry(data) {
        const id = this.autoPoolIdCounter++;
        const newAutoPoolEntry = {
            ...data,
            id,
            joinDate: new Date(),
        };
        this.autoPools.set(id, newAutoPoolEntry);
        return newAutoPoolEntry;
    }
    async getAutoPoolEntriesByUserId(userId) {
        return Array.from(this.autoPools.values()).filter((entry) => entry.userId === userId);
    }
    async getAutoPoolMatrix() {
        return Array.from(this.autoPools.values());
    }
    // Transaction operations
    async createTransaction(data) {
        const id = this.transactionIdCounter++;
        const newTransaction = {
            ...data,
            id,
            createdAt: new Date(),
        };
        this.transactions.set(id, newTransaction);
        return newTransaction;
    }
    async getTransactionsByUserId(userId) {
        return Array.from(this.transactions.values())
            .filter(transaction => transaction.userId === userId)
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }
    // Get all users at a specific level for a given user
    async getUsersAtLevel(userId, level) {
        const allUsers = await this.getAllUsers();
        // Direct referrals of this user
        const directReferrals = allUsers.filter(u => u.referredBy === userId);
        if (level === 1) {
            // Level 1 = referrals of direct referrals
            const levelOneUsers = [];
            for (const directRef of directReferrals) {
                const refOfRef = allUsers.filter(u => u.referredBy === directRef.id);
                levelOneUsers.push(...refOfRef);
            }
            return levelOneUsers;
        }
        // For levels 2+, recursively find users starting from level 1
        let previousLevelUsers = await this.getUsersAtLevel(userId, 1); // Start with level 1
        let currentLevel = 2;
        while (currentLevel <= level) {
            const currentLevelUsers = [];
            for (const prevUser of previousLevelUsers) {
                const referrals = allUsers.filter(u => u.referredBy === prevUser.id);
                currentLevelUsers.push(...referrals);
            }
            if (currentLevel === level) {
                return currentLevelUsers;
            }
            previousLevelUsers = currentLevelUsers;
            currentLevel++;
        }
        return [];
    }
    // Calculate level earnings based on actual users and packages
    async calculateLevelEarnings(userId) {
        const user = await this.getUser(userId);
        if (!user)
            return [];
        // Level income percentages (updated per requirements)
        const levelPercentages = [
            0.15, // Level 1: 15%
            0.10, // Level 2: 10%
            0.05, // Level 3: 5%
            0.03, 0.03, 0.03, 0.03, 0.03, // Levels 4-8: 3% each
            0.02, 0.02, 0.02, 0.02, 0.02, 0.02, // Levels 9-14: 2% each
            0.01, 0.01, 0.01, 0.01, 0.01, 0.01 // Levels 15-20: 1% each
        ];
        const directReferralCount = (await this.getAllUsers()).filter(u => u.referredBy === userId).length;
        const unlockedLevels = directReferralCount * 2;
        const levels = [];
        for (let level = 1; level <= 20; level++) {
            const isUnlocked = level <= unlockedLevels;
            let members = 0;
            let totalEarnings = 0;
            if (isUnlocked) {
                const usersAtLevel = await this.getUsersAtLevel(userId, level);
                members = usersAtLevel.length;
                // Calculate earnings from this level
                for (const levelUser of usersAtLevel) {
                    const userPackage = await this.getPackageByUserId(levelUser.id);
                    if (userPackage) {
                        const monthlyAmount = parseFloat(userPackage.monthlyAmount);
                        const directIncome = monthlyAmount * 0.05; // 5% direct income
                        const levelIncome = directIncome * levelPercentages[level - 1];
                        totalEarnings += levelIncome;
                    }
                }
            }
            levels.push({
                level,
                status: isUnlocked ? 'unlocked' : 'locked',
                members,
                earnings: `₹${totalEarnings.toFixed(2)}`
            });
        }
        return levels;
    }
    // Admin operations
    async getAdminUsers() {
        return Array.from(this.users.values()).filter(user => user.role === 'admin');
    }
    // KYC operations
    async updateUserKYC(data) {
        const user = await this.getUser(data.userId);
        if (!user)
            return undefined;
        const updatedUser = {
            ...user,
            panNumber: data.panNumber,
            idProofType: data.idProofType,
            idProofNumber: data.idProofNumber,
            panCardImage: data.panCardImage,
            idProofImage: data.idProofImage,
            kycStatus: data.kycStatus,
            kycRejectionReason: null
        };
        this.users.set(data.userId, updatedUser);
        return updatedUser;
    }
    async updateUserKYCStatus(data) {
        const user = await this.getUser(data.userId);
        if (!user)
            return undefined;
        const updatedUser = {
            ...user,
            kycStatus: data.kycStatus,
            kycRejectionReason: data.kycRejectionReason
        };
        this.users.set(data.userId, updatedUser);
        return updatedUser;
    }
    async getKYCRequests(status) {
        const allUsers = Array.from(this.users.values());
        // Filter users who have submitted KYC (have panNumber and panCardImage)
        let kycUsers = allUsers.filter(user => user.panNumber && user.panCardImage);
        // Filter by status if provided
        if (status && status !== 'all') {
            kycUsers = kycUsers.filter(user => user.kycStatus === status);
        }
        // Map to the response format
        return kycUsers.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            panNumber: user.panNumber,
            idProofType: user.idProofType,
            idProofNumber: user.idProofNumber,
            panCardImage: user.panCardImage,
            idProofImage: user.idProofImage,
            kycStatus: user.kycStatus,
            kycRejectionReason: user.kycRejectionReason,
            createdAt: user.createdAt
        }));
    }
    async createNotification(data) {
        const id = this.notificationIdCounter++;
        const notification = {
            id,
            userId: data.userId,
            type: data.type,
            message: data.message,
            isRead: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        this.notifications.set(id, notification);
        return notification;
    }
    // Demo earnings generation (placeholder implementation)
    async generateDemoEarnings(userId) {
        // This is a placeholder method to prevent errors
        // In a real implementation, this would generate demo earnings for testing
        console.log(`Demo earnings generation called for user ${userId}`);
    }
}
exports.MemStorage = MemStorage;
// Export the storage instance
exports.storage = new MemStorage();
