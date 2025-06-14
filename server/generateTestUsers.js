"use strict";
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
var pgStorage_1 = require("./pgStorage");
var crypto_1 = require("crypto");
var storage = new pgStorage_1.PostgresStorage();
function generateTestUsers(count) {
    return __awaiter(this, void 0, void 0, function () {
        var packageTypes, packageAmounts, i, email, phone, user, packageType, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log("Starting to generate ".concat(count, " test users..."));
                    packageTypes = ['basic', 'silver', 'gold', 'platinum', 'diamond'];
                    packageAmounts = {
                        basic: 1000,
                        silver: 2000,
                        gold: 5000,
                        platinum: 10000,
                        diamond: 20000
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < count)) return [3 /*break*/, 7];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 5, , 6]);
                    email = "testuser".concat(i + 1, "@example.com");
                    phone = "9".concat(Math.floor(Math.random() * 1000000000).toString().padStart(9, '0'));
                    return [4 /*yield*/, storage.createUser({
                            id: crypto_1.default.randomUUID(),
                            name: "Test User ".concat(i + 1),
                            email: email,
                            phone: phone,
                            password: 'Test@123', // Default password for all test users
                            role: 'user',
                            isEmailVerified: true,
                            isPhoneVerified: true,
                            kycStatus: 'approved',
                            bankName: 'Test Bank',
                            accountNumber: "ACC".concat(Math.floor(Math.random() * 1000000000)),
                            ifscCode: 'TEST0000001',
                            panNumber: "ABCDE".concat(Math.floor(Math.random() * 10000), "F"),
                            accountHolderName: "Test User ".concat(i + 1),
                        })];
                case 3:
                    user = _a.sent();
                    packageType = packageTypes[Math.floor(Math.random() * packageTypes.length)];
                    return [4 /*yield*/, storage.createPackage({
                            userId: user.id,
                            packageType: packageType,
                            monthlyAmount: packageAmounts[packageType],
                            totalMonths: 12,
                            paidMonths: Math.floor(Math.random() * 12) + 1,
                            isCompleted: false,
                            bonusEarned: Math.random() > 0.5,
                            startDate: new Date(Date.now() - Math.floor(Math.random() * 365) * 24 * 60 * 60 * 1000),
                            nextPaymentDue: new Date(Date.now() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
                            lastPaymentDate: new Date(Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000),
                            directReferrals: Math.floor(Math.random() * 10),
                            unlockedLevels: Math.floor(Math.random() * 5),
                            totalEarnings: (Math.random() * 10000).toFixed(2),
                            autoPoolEligible: Math.random() > 0.7,
                            autoPoolLevel: Math.floor(Math.random() * 3),
                            autoPoolWallet: (Math.random() * 5000).toFixed(2),
                            autoPoolRewardClaimed: Math.random() > 0.5,
                            autoPoolAssuredRewardClaimed: Math.random() > 0.5,
                            emiWaiverEligible: Math.random() > 0.8,
                            timelyPaymentsCount: Math.floor(Math.random() * 12),
                            levelEarnings: (Math.random() * 5000).toFixed(2),
                            binaryEarnings: (Math.random() * 3000).toFixed(2),
                            directEarnings: (Math.random() * 2000).toFixed(2),
                        })];
                case 4:
                    _a.sent();
                    if ((i + 1) % 100 === 0) {
                        console.log("Generated ".concat(i + 1, " users..."));
                    }
                    return [3 /*break*/, 6];
                case 5:
                    error_1 = _a.sent();
                    console.error("Error generating user ".concat(i + 1, ":"), error_1);
                    return [3 /*break*/, 6];
                case 6:
                    i++;
                    return [3 /*break*/, 1];
                case 7:
                    console.log('Test user generation completed!');
                    return [2 /*return*/];
            }
        });
    });
}
// Run the generation
generateTestUsers(10000).catch(console.error);
