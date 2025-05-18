import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertUserSchema, 
  insertPackageSchema, 
  insertEMIPaymentSchema,
  insertWithdrawalSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Session } from 'express-session';

// Extend express-session types to include our custom fields
declare module 'express-session' {
  interface Session {
    userId?: number;
    role?: string;
  }
}

// Middleware for checking if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

// Middleware for checking if user is an admin
const isAdmin = async (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = await storage.getUser(req.session.userId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Session setup (synchronous, but with ES module imports)
  const expressSession = await import('express-session');
  const session = expressSession.default;
  
  const memorystore = await import('memorystore');
  const MemoryStore = memorystore.default(session);
  
  app.use(
    session({
      store: new MemoryStore({
        checkPeriod: 86400000, // prune expired entries every 24h
      }),
      secret: process.env.SESSION_SECRET || "pelnora-jewellers-mlm-secret",
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
      },
    })
  );

  // Authentication routes
  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validatedData.password, salt);
      
      // Determine if user was referred
      let referredById = undefined;
      if (req.body.referralId) {
        const referrer = await storage.getUserByReferralId(req.body.referralId);
        if (referrer) {
          referredById = referrer.id;
        }
      }
      
      // Create user
      const newUser = await storage.createUser(
        { ...validatedData, password: hashedPassword },
        referredById
      );
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating user" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      // Verify password
      const isMatch = await bcrypt.compare(validatedData.password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
      
      // Set session
      req.session.userId = user.id;
      req.session.role = user.role;
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error logging in" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Error logging out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get('/api/auth/me', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user data" });
    }
  });

  // User routes
  app.get('/api/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove passwords from response
      const usersWithoutPasswords = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only admins can view other users' details
      if (userId !== req.session.userId && req.session.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  });

  app.patch('/api/users/:id', isAuthenticated, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Only admins can update other users' details
      if (userId !== req.session.userId && req.session.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Prevent updating critical fields unless admin
      if (req.session.role !== 'admin') {
        const forbiddenFields = ['role', 'isActive', 'totalEarnings', 'withdrawableAmount', 'unlockedLevels', 'autoPoolEligible'];
        const attemptedForbiddenUpdate = Object.keys(req.body).some(key => forbiddenFields.includes(key));
        
        if (attemptedForbiddenUpdate) {
          return res.status(403).json({ message: "Cannot update restricted fields" });
        }
      }
      
      // Update password if provided
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      }
      
      const updatedUser = await storage.updateUser(userId, req.body);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Package routes
  app.post('/api/packages', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPackageSchema.parse(req.body);
      
      // Check if user already has a package
      const existingPackage = await storage.getPackageByUserId(req.session.userId!);
      if (existingPackage) {
        return res.status(400).json({ message: "User already has a package" });
      }
      
      // Create package
      const newPackage = await storage.createPackage({
        ...validatedData,
        userId: req.session.userId!,
      });
      
      // If user was referred, create direct income for referrer
      const user = await storage.getUser(req.session.userId!);
      if (user && user.referredBy) {
        const packageAmount = parseFloat(validatedData.monthlyAmount) * validatedData.totalMonths;
        const directIncome = packageAmount * 0.05; // 5% direct income
        
        await storage.createEarning({
          userId: user.referredBy,
          amount: directIncome.toString(),
          earningType: 'direct',
          description: `Direct referral income from ${user.name}`,
          relatedUserId: user.id,
        });
        
        await storage.updateUserEarnings(user.referredBy, directIncome);
      }
      
      res.status(201).json(newPackage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating package" });
    }
  });

  app.get('/api/packages/me', isAuthenticated, async (req, res) => {
    try {
      const userPackage = await storage.getPackageByUserId(req.session.userId!);
      if (!userPackage) {
        return res.status(404).json({ message: "No package found for user" });
      }
      
      res.json(userPackage);
    } catch (error) {
      res.status(500).json({ message: "Error fetching package" });
    }
  });

  app.get('/api/packages', isAdmin, async (req, res) => {
    try {
      const packages = await storage.getAllPackages();
      res.json(packages);
    } catch (error) {
      res.status(500).json({ message: "Error fetching packages" });
    }
  });

  // EMI Payment routes
  app.post('/api/emi-payments', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertEMIPaymentSchema.parse(req.body);
      
      // Ensure user is paying for their own package
      const userPackage = await storage.getPackageByUserId(req.session.userId!);
      if (!userPackage || userPackage.id !== validatedData.packageId) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Create EMI payment
      const newEMIPayment = await storage.createEMIPayment({
        ...validatedData,
        userId: req.session.userId!,
      });
      
      res.status(201).json(newEMIPayment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating EMI payment" });
    }
  });

  app.get('/api/emi-payments/me', isAuthenticated, async (req, res) => {
    try {
      const emiPayments = await storage.getEMIPaymentsByUserId(req.session.userId!);
      res.json(emiPayments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching EMI payments" });
    }
  });

  app.get('/api/emi-payments', isAdmin, async (req, res) => {
    try {
      const emiPayments = await storage.getAllEMIPayments();
      res.json(emiPayments);
    } catch (error) {
      res.status(500).json({ message: "Error fetching EMI payments" });
    }
  });

  // Earnings routes
  app.get('/api/earnings/me', isAuthenticated, async (req, res) => {
    try {
      const earnings = await storage.getEarningsByUserId(req.session.userId!);
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });

  app.get('/api/earnings', isAdmin, async (req, res) => {
    try {
      const earnings = await storage.getAllEarnings();
      res.json(earnings);
    } catch (error) {
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });

  // Admin can create earnings for users
  app.post('/api/earnings', isAdmin, async (req, res) => {
    try {
      const { userId, amount, earningType, description, relatedUserId } = req.body;
      
      // Validate user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Create earning
      const newEarning = await storage.createEarning({
        userId,
        amount,
        earningType,
        description,
        relatedUserId,
      });
      
      // Update user's earnings
      await storage.updateUserEarnings(userId, parseFloat(amount));
      
      res.status(201).json(newEarning);
    } catch (error) {
      res.status(500).json({ message: "Error creating earning" });
    }
  });

  // Withdrawal routes
  app.post('/api/withdrawals', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertWithdrawalSchema.parse(req.body);
      
      // Check if user has enough balance
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const withdrawableAmount = parseFloat(user.withdrawableAmount);
      const requestedAmount = parseFloat(validatedData.amount);
      
      if (requestedAmount > withdrawableAmount) {
        return res.status(400).json({ message: "Insufficient withdrawable balance" });
      }
      
      // Create withdrawal request
      const newWithdrawal = await storage.createWithdrawal({
        ...validatedData,
        userId: req.session.userId!,
      });
      
      res.status(201).json(newWithdrawal);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      res.status(500).json({ message: "Error creating withdrawal request" });
    }
  });

  app.get('/api/withdrawals/me', isAuthenticated, async (req, res) => {
    try {
      const withdrawals = await storage.getWithdrawalsByUserId(req.session.userId!);
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching withdrawals" });
    }
  });

  app.get('/api/withdrawals', isAdmin, async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      res.json(withdrawals);
    } catch (error) {
      res.status(500).json({ message: "Error fetching withdrawals" });
    }
  });

  app.patch('/api/withdrawals/:id', isAdmin, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const { status, remarks } = req.body;
      
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedWithdrawal = await storage.updateWithdrawal(withdrawalId, {
        status,
        remarks,
      });
      
      if (!updatedWithdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      res.json(updatedWithdrawal);
    } catch (error) {
      res.status(500).json({ message: "Error updating withdrawal" });
    }
  });

  // Binary structure routes
  app.get('/api/binary-structure/me', isAuthenticated, async (req, res) => {
    try {
      // Get user's position in binary structure
      const userStructure = await storage.getBinaryStructureByUserId(req.session.userId!);
      
      // Get user's downline
      const downline = await storage.getUsersBinaryDownline(req.session.userId!);
      
      res.json({
        position: userStructure,
        downline,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching binary structure" });
    }
  });

  // Auto pool routes
  app.get('/api/auto-pool/me', isAuthenticated, async (req, res) => {
    try {
      const autoPoolEntries = await storage.getAutoPoolEntriesByUserId(req.session.userId!);
      res.json(autoPoolEntries);
    } catch (error) {
      res.status(500).json({ message: "Error fetching auto pool entries" });
    }
  });

  app.get('/api/auto-pool', isAdmin, async (req, res) => {
    try {
      const autoPoolMatrix = await storage.getAutoPoolMatrix();
      res.json(autoPoolMatrix);
    } catch (error) {
      res.status(500).json({ message: "Error fetching auto pool matrix" });
    }
  });

  // Transaction routes
  app.get('/api/transactions/me', isAuthenticated, async (req, res) => {
    try {
      const transactions = await storage.getTransactionsByUserId(req.session.userId!);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ message: "Error fetching transactions" });
    }
  });

  // Stats routes
  app.get('/api/stats', isAdmin, async (req, res) => {
    try {
      const userCount = await storage.getUserCount();
      
      // Calculate other stats
      const packages = await storage.getAllPackages();
      const activePackages = packages.filter(pkg => !pkg.isCompleted).length;
      const completedPackages = packages.filter(pkg => pkg.isCompleted).length;
      
      const withdrawals = await storage.getAllWithdrawals();
      const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
      const totalWithdrawalAmount = withdrawals
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + parseFloat(w.amount), 0);
      
      res.json({
        userCount,
        activePackages,
        completedPackages,
        pendingWithdrawals,
        totalWithdrawalAmount,
      });
    } catch (error) {
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
