"use strict";
var __makeTemplateObject = (this && this.__makeTemplateObject) || function (cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.PostgresStorage = void 0;
var db_1 = require("./db");
var schema_1 = require("../shared/schema");
var drizzle_orm_1 = require("drizzle-orm");
var crypto_1 = require("crypto");
var PostgresStorage = /** @class */ (function () {
    function PostgresStorage() {
    }
    // Generate a unique referral ID
    PostgresStorage.prototype.generateReferralId = function () {
        return 'PEL' + crypto_1.default.randomBytes(4).toString('hex').toUpperCase();
    };
    // User operations
    PostgresStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.getUserByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.email, email))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.getUserByReferralId = function (referralId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.referralId, referralId))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.createUser = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var referralId, user;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        referralId = this.generateReferralId();
                        return [4 /*yield*/, db_1.db.insert(schema_1.users).values(__assign(__assign({}, userData), { referralId: referralId, leftTeamCount: 0, rightTeamCount: 0, totalEarnings: "0", withdrawableAmount: "0", unlockedLevels: 0, autoPoolEligible: false, kycStatus: 'pending', isActive: true, createdAt: new Date() })).returning()];
                    case 1:
                        user = (_a.sent())[0];
                        return [2 /*return*/, user];
                }
            });
        });
    };
    PostgresStorage.prototype.updateUser = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.users)
                            .set(data)
                            .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                            .returning()];
                    case 1:
                        updatedUser = (_a.sent())[0];
                        return [2 /*return*/, updatedUser];
                }
            });
        });
    };
    PostgresStorage.prototype.getAllUsers = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.users)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresStorage.prototype.getUserCount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select({ count: (0, drizzle_orm_1.sql)(templateObject_1 || (templateObject_1 = __makeTemplateObject(["count(*)"], ["count(*)"]))) }).from(schema_1.users)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, Number(result[0].count)];
                }
            });
        });
    };
    PostgresStorage.prototype.updateUserEarnings = function (id, amount) {
        return __awaiter(this, void 0, void 0, function () {
            var user, currentEarnings, updatedEarnings, autoPoolEligible, updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUser(id)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, undefined];
                        currentEarnings = parseFloat(user.totalEarnings);
                        updatedEarnings = (currentEarnings + amount).toFixed(2);
                        autoPoolEligible = parseFloat(updatedEarnings) >= 10000;
                        return [4 /*yield*/, db_1.db.update(schema_1.users)
                                .set({
                                totalEarnings: updatedEarnings,
                                withdrawableAmount: (parseFloat(user.withdrawableAmount) + amount).toFixed(2),
                                autoPoolEligible: user.autoPoolEligible || autoPoolEligible
                            })
                                .where((0, drizzle_orm_1.eq)(schema_1.users.id, id))
                                .returning()];
                    case 2:
                        updatedUser = (_a.sent())[0];
                        return [2 /*return*/, updatedUser];
                }
            });
        });
    };
    // Package operations
    PostgresStorage.prototype.createPackage = function (packageData) {
        return __awaiter(this, void 0, void 0, function () {
            var package_;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.packages).values(__assign(__assign({}, packageData), { startDate: new Date(), nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) })).returning()];
                    case 1:
                        package_ = (_a.sent())[0];
                        return [2 /*return*/, package_];
                }
            });
        });
    };
    PostgresStorage.prototype.getPackageByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.packages).where((0, drizzle_orm_1.eq)(schema_1.packages.userId, userId))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.updatePackage = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedPackage;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.packages)
                            .set(data)
                            .where((0, drizzle_orm_1.eq)(schema_1.packages.id, id))
                            .returning()];
                    case 1:
                        updatedPackage = (_a.sent())[0];
                        return [2 /*return*/, updatedPackage];
                }
            });
        });
    };
    PostgresStorage.prototype.getAllPackages = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.packages)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // EMI operations
    PostgresStorage.prototype.createEMIPayment = function (emiData) {
        return __awaiter(this, void 0, void 0, function () {
            var newEMIPayment;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.emiPayments).values(__assign(__assign({}, emiData), { paymentDate: new Date() })).returning()];
                    case 1:
                        newEMIPayment = (_a.sent())[0];
                        return [2 /*return*/, newEMIPayment];
                }
            });
        });
    };
    PostgresStorage.prototype.getEMIPaymentsByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.emiPayments).where((0, drizzle_orm_1.eq)(schema_1.emiPayments.userId, userId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresStorage.prototype.getEMIPaymentsByPackageId = function (packageId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.emiPayments).where((0, drizzle_orm_1.eq)(schema_1.emiPayments.packageId, packageId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresStorage.prototype.getAllEMIPayments = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.emiPayments)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Binary structure operations
    PostgresStorage.prototype.createBinaryStructure = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var newBinaryStructure;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.binaryStructure).values(data).returning()];
                    case 1:
                        newBinaryStructure = (_a.sent())[0];
                        return [2 /*return*/, newBinaryStructure];
                }
            });
        });
    };
    PostgresStorage.prototype.getBinaryStructureByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.binaryStructure).where((0, drizzle_orm_1.eq)(schema_1.binaryStructure.userId, userId))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.getUsersBinaryDownline = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.binaryStructure).where((0, drizzle_orm_1.eq)(schema_1.binaryStructure.parentId, userId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Earnings operations
    PostgresStorage.prototype.createEarning = function (earningData) {
        return __awaiter(this, void 0, void 0, function () {
            var newEarning;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.earnings).values(__assign(__assign({}, earningData), { createdAt: new Date() })).returning()];
                    case 1:
                        newEarning = (_a.sent())[0];
                        return [2 /*return*/, newEarning];
                }
            });
        });
    };
    PostgresStorage.prototype.getEarningsByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select()
                            .from(schema_1.earnings)
                            .where((0, drizzle_orm_1.eq)(schema_1.earnings.userId, userId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.earnings.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresStorage.prototype.getAllEarnings = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.earnings)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Withdrawal operations
    PostgresStorage.prototype.createWithdrawal = function (withdrawalData) {
        return __awaiter(this, void 0, void 0, function () {
            var newWithdrawal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.withdrawals).values(__assign(__assign({}, withdrawalData), { status: 'pending', requestDate: new Date(), processedDate: undefined, remarks: '' })).returning()];
                    case 1:
                        newWithdrawal = (_a.sent())[0];
                        return [2 /*return*/, newWithdrawal];
                }
            });
        });
    };
    PostgresStorage.prototype.getWithdrawalsByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select()
                            .from(schema_1.withdrawals)
                            .where((0, drizzle_orm_1.eq)(schema_1.withdrawals.userId, userId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.withdrawals.requestDate))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresStorage.prototype.updateWithdrawal = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedWithdrawal;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.withdrawals)
                            .set(data)
                            .where((0, drizzle_orm_1.eq)(schema_1.withdrawals.id, id))
                            .returning()];
                    case 1:
                        updatedWithdrawal = (_a.sent())[0];
                        return [2 /*return*/, updatedWithdrawal];
                }
            });
        });
    };
    PostgresStorage.prototype.getAllWithdrawals = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.withdrawals)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Auto pool operations
    PostgresStorage.prototype.createAutoPoolEntry = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var newAutoPool;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.autoPool).values(data).returning()];
                    case 1:
                        newAutoPool = (_a.sent())[0];
                        return [2 /*return*/, newAutoPool];
                }
            });
        });
    };
    PostgresStorage.prototype.getAutoPoolEntriesByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.autoPool).where((0, drizzle_orm_1.eq)(schema_1.autoPool.userId, userId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresStorage.prototype.getAutoPoolMatrix = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.autoPool)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Transaction operations
    PostgresStorage.prototype.createTransaction = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var newTransaction;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.transactions).values(data).returning()];
                    case 1:
                        newTransaction = (_a.sent())[0];
                        return [2 /*return*/, newTransaction];
                }
            });
        });
    };
    PostgresStorage.prototype.getTransactionsByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select()
                            .from(schema_1.transactions)
                            .where((0, drizzle_orm_1.eq)(schema_1.transactions.userId, userId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.transactions.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // KYC operations
    PostgresStorage.prototype.getKYCSubmissions = function () {
        return __awaiter(this, void 0, void 0, function () {
            var submissions;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
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
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.kycSubmissions.submittedAt))];
                    case 1:
                        submissions = _a.sent();
                        return [2 /*return*/, submissions];
                }
            });
        });
    };
    PostgresStorage.prototype.approveKYCSubmission = function (submissionId, reviewerId) {
        return __awaiter(this, void 0, void 0, function () {
            var submission, now, updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.kycSubmissions)
                            .where((0, drizzle_orm_1.eq)(schema_1.kycSubmissions.id, submissionId))
                            .limit(1)];
                    case 1:
                        submission = _a.sent();
                        if (!submission.length) {
                            return [2 /*return*/, null];
                        }
                        now = new Date();
                        // Update KYC submission
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.kycSubmissions)
                                .set({
                                status: 'approved',
                                reviewedAt: now,
                            })
                                .where((0, drizzle_orm_1.eq)(schema_1.kycSubmissions.id, submissionId))];
                    case 2:
                        // Update KYC submission
                        _a.sent();
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.users)
                                .set({
                                kycStatus: 'approved',
                                kycReviewedAt: now,
                                kycReviewedBy: reviewerId,
                            })
                                .where((0, drizzle_orm_1.eq)(schema_1.users.id, submission[0].userId))
                                .returning()];
                    case 3:
                        updatedUser = (_a.sent())[0];
                        return [2 /*return*/, updatedUser || null];
                }
            });
        });
    };
    PostgresStorage.prototype.rejectKYCSubmission = function (submissionId, reviewerId) {
        return __awaiter(this, void 0, void 0, function () {
            var submission, now, updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db
                            .select()
                            .from(schema_1.kycSubmissions)
                            .where((0, drizzle_orm_1.eq)(schema_1.kycSubmissions.id, submissionId))
                            .limit(1)];
                    case 1:
                        submission = _a.sent();
                        if (!submission.length) {
                            return [2 /*return*/, null];
                        }
                        now = new Date();
                        // Update KYC submission
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.kycSubmissions)
                                .set({
                                status: 'rejected',
                                reviewedAt: now,
                            })
                                .where((0, drizzle_orm_1.eq)(schema_1.kycSubmissions.id, submissionId))];
                    case 2:
                        // Update KYC submission
                        _a.sent();
                        return [4 /*yield*/, db_1.db
                                .update(schema_1.users)
                                .set({
                                kycStatus: 'rejected',
                                kycReviewedAt: now,
                                kycReviewedBy: reviewerId,
                            })
                                .where((0, drizzle_orm_1.eq)(schema_1.users.id, submission[0].userId))
                                .returning()];
                    case 3:
                        updatedUser = (_a.sent())[0];
                        return [2 /*return*/, updatedUser || null];
                }
            });
        });
    };
    // Ticket operations
    PostgresStorage.prototype.createTicket = function (ticketData) {
        return __awaiter(this, void 0, void 0, function () {
            var crypto, ticketId, newTicket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        crypto = require('crypto');
                        ticketId = 'TKT-' + crypto.randomBytes(4).toString('hex').toUpperCase();
                        return [4 /*yield*/, db_1.db.insert(schema_1.tickets).values(__assign(__assign({}, ticketData), { id: ticketId, status: 'open', createdAt: new Date(), updatedAt: new Date() })).returning()];
                    case 1:
                        newTicket = (_a.sent())[0];
                        return [2 /*return*/, newTicket];
                }
            });
        });
    };
    PostgresStorage.prototype.getTicketById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.tickets).where((0, drizzle_orm_1.eq)(schema_1.tickets.id, id))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    PostgresStorage.prototype.getAllTickets = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select()
                            .from(schema_1.tickets)
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.tickets.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresStorage.prototype.getTicketsByStatus = function (status) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select()
                            .from(schema_1.tickets)
                            .where((0, drizzle_orm_1.eq)(schema_1.tickets.status, status))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.tickets.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresStorage.prototype.getTicketsByUser = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select()
                            .from(schema_1.tickets)
                            .where((0, drizzle_orm_1.eq)(schema_1.tickets.createdBy, userId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.tickets.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    PostgresStorage.prototype.updateTicket = function (id, data) {
        return __awaiter(this, void 0, void 0, function () {
            var updatedTicket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.tickets)
                            .set(__assign(__assign({}, data), { updatedAt: new Date() }))
                            .where((0, drizzle_orm_1.eq)(schema_1.tickets.id, id))
                            .returning()];
                    case 1:
                        updatedTicket = (_a.sent())[0];
                        return [2 /*return*/, updatedTicket];
                }
            });
        });
    };
    PostgresStorage.prototype.closeTicket = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var closedTicket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.tickets)
                            .set({
                            status: 'closed',
                            closedAt: new Date(),
                            updatedAt: new Date()
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.tickets.id, id))
                            .returning()];
                    case 1:
                        closedTicket = (_a.sent())[0];
                        return [2 /*return*/, closedTicket];
                }
            });
        });
    };
    PostgresStorage.prototype.assignTicket = function (id, assignedTo) {
        return __awaiter(this, void 0, void 0, function () {
            var assignedTicket;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.update(schema_1.tickets)
                            .set({
                            assignedTo: assignedTo,
                            status: 'in-progress',
                            updatedAt: new Date()
                        })
                            .where((0, drizzle_orm_1.eq)(schema_1.tickets.id, id))
                            .returning()];
                    case 1:
                        assignedTicket = (_a.sent())[0];
                        return [2 /*return*/, assignedTicket];
                }
            });
        });
    };
    // Ticket Reply operations
    PostgresStorage.prototype.createTicketReply = function (replyData) {
        return __awaiter(this, void 0, void 0, function () {
            var newReply;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.ticketReplies).values(__assign(__assign({}, replyData), { createdAt: new Date() })).returning()];
                    case 1:
                        newReply = (_a.sent())[0];
                        // Update the ticket's updatedAt timestamp
                        return [4 /*yield*/, db_1.db.update(schema_1.tickets)
                                .set({ updatedAt: new Date() })
                                .where((0, drizzle_orm_1.eq)(schema_1.tickets.id, replyData.ticketId))];
                    case 2:
                        // Update the ticket's updatedAt timestamp
                        _a.sent();
                        return [2 /*return*/, newReply];
                }
            });
        });
    };
    PostgresStorage.prototype.getTicketReplies = function (ticketId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select()
                            .from(schema_1.ticketReplies)
                            .where((0, drizzle_orm_1.eq)(schema_1.ticketReplies.ticketId, ticketId))
                            .orderBy((0, drizzle_orm_1.desc)(schema_1.ticketReplies.createdAt))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Level statistics operations
    PostgresStorage.prototype.initializeLevelStatistics = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var level;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        level = 1;
                        _a.label = 1;
                    case 1:
                        if (!(level <= 10)) return [3 /*break*/, 4];
                        return [4 /*yield*/, db_1.db.insert(schema_1.levelStatistics).values({
                                userId: userId,
                                level: level,
                                status: level === 1 ? 'unlocked' : 'locked',
                                memberCount: 0,
                                earnings: "0",
                                lastUpdated: new Date()
                            })];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        level++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    PostgresStorage.prototype.updateLevelStatistics = function (userId, level) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Update the level statistics for the user
                    return [4 /*yield*/, db_1.db.update(schema_1.levelStatistics)
                            .set({
                            status: 'unlocked',
                            lastUpdated: new Date()
                        })
                            .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.levelStatistics.userId, userId), (0, drizzle_orm_1.eq)(schema_1.levelStatistics.level, level)))];
                    case 1:
                        // Update the level statistics for the user
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    
    // Binary structure operations
    PostgresStorage.prototype.createBinaryStructure = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var newBinaryStructure;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.insert(schema_1.binaryStructure).values(data).returning()];
                    case 1:
                        newBinaryStructure = (_a.sent())[0];
                        return [2 /*return*/, newBinaryStructure];
                }
            });
        });
    };
    
    PostgresStorage.prototype.getBinaryStructureByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.binaryStructure).where((0, drizzle_orm_1.eq)(schema_1.binaryStructure.userId, userId))];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result[0]];
                }
            });
        });
    };
    
    PostgresStorage.prototype.getUsersBinaryDownline = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, db_1.db.select().from(schema_1.binaryStructure).where((0, drizzle_orm_1.eq)(schema_1.binaryStructure.parentId, userId))];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    
    PostgresStorage.prototype.getBinaryBusinessInfo = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var user, allBinaryStructures, allUsers, getCompleteTeam, leftTeamUserIds, rightTeamUserIds, leftTeamUsers, rightTeamUsers, leftTeamBusiness, rightTeamBusiness, i, leftUser, userPackage, packageValue, i, rightUser, userPackage, packageValue;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUser(userId)];
                    case 1:
                        user = _a.sent();
                        if (!user) {
                            console.log("User " + userId + " not found");
                            return [2 /*return*/, {
                                leftTeamBusiness: "0",
                                rightTeamBusiness: "0",
                                leftCarryForward: "0",
                                rightCarryForward: "0"
                            }];
                        }
                        console.log("\n=== Binary Business Info Calculation for " + user.name + " (ID: " + userId + ") ===");
                        console.log("User team counts - Left: " + user.leftTeamCount + ", Right: " + user.rightTeamCount);
                        return [4 /*yield*/, db_1.db.select().from(schema_1.binaryStructure)];
                    case 2:
                        allBinaryStructures = _a.sent();
                        return [4 /*yield*/, db_1.db.select().from(schema_1.users)];
                    case 3:
                        allUsers = _a.sent();
                        getCompleteTeam = function (rootUserId, position) {
                            var directChildren = allBinaryStructures
                                .filter(function (bs) { return bs.parentId === rootUserId && bs.position === position; })
                                .map(function (bs) { return bs.userId; });
                            console.log("Direct " + position + " children for user " + rootUserId + ":", directChildren);
                            var allTeamMembers = directChildren.slice();
                            for (var i = 0; i < directChildren.length; i++) {
                                var childId = directChildren[i];
                                var leftDownline = getCompleteTeam(childId, 'left');
                                var rightDownline = getCompleteTeam(childId, 'right');
                                allTeamMembers = allTeamMembers.concat(leftDownline, rightDownline);
                            }
                            return allTeamMembers;
                        };
                        leftTeamUserIds = getCompleteTeam(userId, 'left');
                        rightTeamUserIds = getCompleteTeam(userId, 'right');
                        console.log("\nLeft team user IDs: [" + leftTeamUserIds.join(', ') + "]");
                        console.log("Right team user IDs: [" + rightTeamUserIds.join(', ') + "]");
                        leftTeamUsers = allUsers.filter(function (u) { return leftTeamUserIds.includes(u.id); });
                        rightTeamUsers = allUsers.filter(function (u) { return rightTeamUserIds.includes(u.id); });
                        console.log("\nLeft team users: " + leftTeamUsers.map(function (u) { return u.name + " (ID: " + u.id + ")"; }).join(', '));
                        console.log("Right team users: " + rightTeamUsers.map(function (u) { return u.name + " (ID: " + u.id + ")"; }).join(', '));
                        leftTeamBusiness = 0;
                        rightTeamBusiness = 0;
                        console.log('\nCalculating left team business:');
                        i = 0;
                        _a.label = 4;
                    case 4:
                        if (!(i < leftTeamUsers.length)) return [3 /*break*/, 7];
                        leftUser = leftTeamUsers[i];
                        return [4 /*yield*/, this.getPackageByUserId(leftUser.id)];
                    case 5:
                        userPackage = _a.sent();
                        console.log("\nLeft user " + leftUser.name + " (ID: " + leftUser.id + ") package:", userPackage);
                        if (userPackage) {
                            packageValue = parseFloat(userPackage.monthlyAmount) * userPackage.totalMonths;
                            leftTeamBusiness += packageValue;
                            console.log("Added \u20B9" + packageValue + " to left team business (" + userPackage.monthlyAmount + " x " + userPackage.totalMonths + ")");
                        }
                        else {
                            console.log("No package found for left user " + leftUser.name + " (ID: " + leftUser.id + ")");
                        }
                        _a.label = 6;
                    case 6:
                        i++;
                        return [3 /*break*/, 4];
                    case 7:
                        console.log('\nCalculating right team business:');
                        i = 0;
                        _a.label = 8;
                    case 8:
                        if (!(i < rightTeamUsers.length)) return [3 /*break*/, 11];
                        rightUser = rightTeamUsers[i];
                        return [4 /*yield*/, this.getPackageByUserId(rightUser.id)];
                    case 9:
                        userPackage = _a.sent();
                        console.log("\nRight user " + rightUser.name + " (ID: " + rightUser.id + ") package:", userPackage);
                        if (userPackage) {
                            packageValue = parseFloat(userPackage.monthlyAmount) * userPackage.totalMonths;
                            rightTeamBusiness += packageValue;
                            console.log("Added \u20B9" + packageValue + " to right team business (" + userPackage.monthlyAmount + " x " + userPackage.totalMonths + ")");
                        }
                        else {
                            console.log("No package found for right user " + rightUser.name + " (ID: " + rightUser.id + ")");
                        }
                        _a.label = 10;
                    case 10:
                        i++;
                        return [3 /*break*/, 8];
                    case 11:
                        console.log("\nFinal business volumes - Left: \u20B9" + leftTeamBusiness + ", Right: \u20B9" + rightTeamBusiness);
                        console.log("Carry forward - Left: \u20B9" + (user.leftCarryForward || '0') + ", Right: \u20B9" + (user.rightCarryForward || '0'));
                        return [2 /*return*/, {
                            leftTeamBusiness: leftTeamBusiness.toString(),
                            rightTeamBusiness: rightTeamBusiness.toString(),
                            leftCarryForward: user.leftCarryForward || "0",
                            rightCarryForward: user.rightCarryForward || "0"
                        }];
                }
            });
        });
    };
    
    return PostgresStorage;
}());
exports.PostgresStorage = PostgresStorage;
exports.storage = new PostgresStorage();
var templateObject_1;
