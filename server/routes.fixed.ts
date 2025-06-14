import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  loginSchema, 
  insertUserSchema, 
  insertPackageSchema, 
  insertEMIPaymentSchema,
  insertWithdrawalSchema,
  type InsertUser,
  type User,
  type Package,
  earnings,
  binaryStructure,
  autoPool,
  levelStatistics,
  packages,
  users,
  withdrawals,
  emiPayments
} from "@shared/schema";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Session } from 'express-session';
import { eq } from "drizzle-orm";
import { db } from "./db";
import { Router } from 'express';
import { sql } from "drizzle-orm";
import ExcelJS from "exceljs";
import { inArray } from "drizzle-orm";
import { PACKAGES } from "@shared/constants";
import { type InsertPackage } from '@shared/schema';
import crypto from 'crypto';

// Extend express-session types to include our custom fields
declare module 'express-session' {
  interface Session {
    userId?: number;
    role?: string;
    lastActivity?: number;
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

  const user = await storage.getUser(String(req.session.userId));
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
      resave: true,
      saveUninitialized: false,
      cookie: {
        secure: process.env.NODE_ENV === "production",
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax',
        path: '/'
      },
      name: 'pelnora.sid'
    })
  );

  // Add session middleware to update last activity
  app.use((req, res, next) => {
    if (req.session.userId) {
      req.session.lastActivity = Date.now();
    }
    next();
  });

  // Authentication routes
  app.post('/api/auth/create-test-user', async (req, res) => {
    try {
      // Check if test user already exists
      const existingUser = await storage.getUserByEmail('test@pelnora.com');
      if (existingUser) {
        // Delete existing package if any
        const existingPackage = await storage.getPackageByUserId(existingUser.id);
        if (existingPackage) {
          await db.execute(sql`DELETE FROM packages WHERE id = ${existingPackage.id}`);
        }
        
        // Create new package for test user
        const packageData = {
          userId: existingUser.id,
          packageType: 'basic',
          monthlyAmount: '10000',
          totalMonths: 12,
          nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
        };
        await storage.createPackage(packageData);
        
        return res.status(200).json({ 
          message: "Test user package updated successfully",
          user: {
            id: existingUser.id,
            email: existingUser.email,
            name: existingUser.name
          }
        });
      }

      // Create test user and parse with insertUserSchema to match expected type
      const testUser = insertUserSchema.parse({
        name: 'Paul Jhon',
        email: 'test@pelnora.com',
        phone: '1234567890',
        password: await bcrypt.hash('test123', 10),
        referredBy: null
      });

      const user = await storage.createUser(testUser);
      if (!user) {
        return res.status(500).json({ message: "Failed to create test user" });
      }

      // Create package for test user
      const packageData = {
        userId: user.id,
        packageType: 'basic',
        monthlyAmount: '10000',
        totalMonths: 12,
        nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
      };

      // Hash the password before creating the user
      const hashedPassword = await bcrypt.hash('test123', 10);

      // Create user with validated data and required fields
      const newUser = await storage.createUser({
        name: 'Paul Jhon',
        email: 'test@pelnora.com',
        phone: '1234567890',
        password: hashedPassword,
        referredBy: null,
        referralId: 'REF' + crypto.randomBytes(4).toString('hex').toUpperCase(),
        role: 'user',
        isActive: true,
        kycStatus: 'pending',
        isPhoneVerified: false
      });

      // Create package for the user if package type is provided
      if (req.body.packageType) {
        const selectedPackage = PACKAGES.find((p) => p.id === req.body.packageType);
        if (selectedPackage) {
          const validPackageTypes = ["basic", "silver", "gold", "platinum", "diamond"] as const;
          if (!validPackageTypes.includes(selectedPackage.id as any)) {
            throw new Error("Invalid package type");
          }
          const packageData = {
            userId: newUser.id,
            packageType: selectedPackage.id as typeof validPackageTypes[number],
            monthlyAmount: selectedPackage.monthlyAmount.toString(),
            totalMonths: 12,
            nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
          };
          await storage.createPackage(packageData);
        }
      }

      res.status(201).json({ 
        message: "Test user created successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name
        }
      });
    } catch (error) {
      console.error('Error creating test user:', error);
      res.status(500).json({ message: "Error creating test user" });
    }
  });

  app.post('/api/auth/reset-user-stats', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.body.userId);
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Reset user stats
      const updatedUser = await storage.updateUser(userId, {
        unlockedLevels: 0,
        leftTeamCount: 0,
        rightTeamCount: 0,
        totalEarnings: "0",
        withdrawableAmount: "0"
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      // Reset package stats
      const userPackage = await storage.getPackageByUserId(userId);
      if (userPackage) {
        await storage.updatePackage(userPackage.id, {
          directReferrals: 0,
          unlockedLevels: 0,
          totalEarnings: "0",
          autoPoolEligible: false,
          autoPoolLevel: 0,
          autoPoolWallet: "0",
          autoPoolRewardClaimed: false,
          autoPoolAssuredRewardClaimed: false,
          emiWaiverEligible: false,
          timelyPaymentsCount: 0,
          levelEarnings: "0",
          binaryEarnings: "0",
          directEarnings: "0"
        });
      }

      // Delete all earnings
      await db.execute(sql`DELETE FROM earnings WHERE user_id = ${userId}`);
      
      // Delete all binary structure entries
      await db.execute(sql`DELETE FROM binary_structure WHERE user_id = ${userId}`);
      
      // Delete all auto pool entries
      await db.execute(sql`DELETE FROM auto_pool WHERE user_id = ${userId}`);
      
      // Delete all level statistics
      await db.execute(sql`DELETE FROM level_statistics WHERE user_id = ${userId}`);

      // Reinitialize level statistics
      await storage.initializeLevelStatistics(userId);

      // Update level statistics to reflect reset state
      await storage.updateLevelStatistics(userId, 0);

      res.json({ message: "User stats reset successfully", user: updatedUser });
    } catch (error) {
      console.error('Error resetting user stats:', error);
      res.status(500).json({ message: "Error resetting user stats" });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      // 1. Validate input with extended schema
      const extendedSchema = insertUserSchema.extend({
        packageType: z.enum(["basic", "silver", "gold", "platinum", "diamond"]),
        terms: z.boolean().refine((val) => val === true, {
          message: "You must agree to the terms and conditions",
        }),
        placement: z.enum(["left", "right"]).optional(),
      });

      const validatedData = extendedSchema.parse(req.body);
      
      // 2. Check for duplicate user
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          message: "Email already registered" 
        });
      }

      // 3. Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validatedData.password, salt);

      // 4. Create user with validated data
      const userData: InsertUser = {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        password: hashedPassword,
        referredBy: validatedData.referredBy ?? null
      };

      const newUser = await storage.createUser(userData);

      // 5. Create package for the user
      const selectedPackage = PACKAGES.find((p) => p.id === validatedData.packageType);
      if (!selectedPackage) {
        throw new Error("Invalid package type");
      }

      const packageData: InsertPackage = {
        userId: newUser.id,
        packageType: validatedData.packageType as "basic" | "silver" | "gold" | "platinum" | "diamond",
        monthlyAmount: selectedPackage.monthlyAmount.toString(),
        totalMonths: "12",
        nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        directReferrals: "0",
        unlockedLevels: "0",
        totalEarnings: "0",
        autoPoolEligible: false,
        autoPoolLevel: "0",
        autoPoolWallet: "0",
        autoPoolRewardClaimed: false,
        autoPoolAssuredRewardClaimed: false,
        emiWaiverEligible: false,
        timelyPaymentsCount: "0",
        levelEarnings: "0",
        binaryEarnings: "0",
        directEarnings: "0"
      };

      const createdPackage = await storage.createPackage(packageData);

      // 6. Return user data without password
      const userWithoutPassword = { ...newUser, password: undefined };
      return res.status(201).json({
        success: true,
        message: 'Registration successful',
        user: userWithoutPassword,
        package: createdPackage
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          success: false,
          message: error.errors[0].message 
        });
      }
      res.status(500).json({ 
        success: false,
        message: error instanceof Error ? error.message : "Error creating user" 
      });
    }
  });

  app.post('/api/auth/check-email', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ 
          success: false, 
          message: "Email is required" 
        });
      }

      const existingUser = await storage.getUserByEmail(email);
      
      return res.status(200).json({
        success: true,
        exists: !!existingUser
      });
    } catch (error) {
      console.error('Error checking email:', error);
      res.status(500).json({ 
        success: false,
        message: "Error checking email availability" 
      });
    }
  });

  // Rest of the file remains the same...
  
  return createServer(app);
}