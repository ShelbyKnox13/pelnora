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
  console.log('isAdmin middleware called');
  console.log('Headers:', req.headers);
  console.log('Session:', req.session);
  
  // Check if this is an API request with admin headers
  const isAdminApiRequest = req.headers['x-admin-auth'] === 'true';
  console.log('Is admin API request:', isAdminApiRequest);
  
  if (isAdminApiRequest) {
    // For API requests, we'll trust the admin header for now in development
    // In production, this should still verify against a valid session
    console.log('Admin API request allowed');
    return next();
  }
  
  // Traditional session-based check
  if (!req.session.userId) {
    console.log('No userId in session');
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = await storage.getUser(req.session.userId);
  console.log('User found:', user ? `${user.name} (${user.role})` : 'None');
  
  if (!user || user.role !== 'admin') {
    console.log('User not admin or not found');
    return res.status(403).json({ message: "Admin access required" });
  }

  console.log('Admin access granted');
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
  // Get test user referral ID
  app.get('/api/auth/test-referral-id', async (req, res) => {
    try {
      const testUser = await storage.getUserByEmail("test@pelnora.com");
      if (!testUser) {
        return res.status(404).json({ error: 'Test user not found' });
      }
      
      res.json({
        referralId: testUser.referralId
      });
    } catch (error) {
      console.error('Error getting test user referral ID:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Check email availability
  app.post('/api/auth/check-email', async (req, res) => {
    try {
      const { email } = req.body;
      
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }
      
      // Check if user with this email already exists
      const existingUser = await storage.getUserByEmail(email);
      
      res.json({
        exists: !!existingUser
      });
    } catch (error) {
      console.error('Error checking email availability:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/register', async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Validate package selection
      const { packageType } = req.body;
      if (!packageType || !['silver', 'gold', 'platinum', 'diamond'].includes(packageType)) {
        return res.status(400).json({ message: "Please select a valid package" });
      }
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(validatedData.password, salt);
      
      // Determine if user was referred
      let referredById = undefined;
      let placementPosition = undefined;
      
      if (req.body.referralId) {
        const referrer = await storage.getUserByReferralId(req.body.referralId);
        if (referrer) {
          referredById = referrer.id;
          // Use the placement position from the request
          placementPosition = req.body.placement || "left";
        }
      }
      
      // Create user
      const newUser = await storage.createUser(
        { ...validatedData, password: hashedPassword },
        referredById,
        placementPosition
      );
      
      // Create package for the new user
      const packageAmounts = {
        silver: 2000,
        gold: 3000,
        platinum: 5000,
        diamond: 10000
      };
      
      const monthlyAmount = packageAmounts[packageType as keyof typeof packageAmounts];
      
      await storage.createPackage({
        userId: newUser.id,
        packageType: packageType,
        monthlyAmount: monthlyAmount.toString(),
        totalMonths: 11
      });
      
      console.log(`✅ User registered with ${packageType} package (₹${monthlyAmount}/month)`);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = newUser;
      
      res.status(201).json({
        ...userWithoutPassword,
        packageType,
        monthlyAmount
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error('Registration error:', error);
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
      
      // DEVELOPMENT MODE: For test users, skip password check
      let isMatch = false;
      if ((validatedData.email === "test@pelnora.com" && validatedData.password === "test123") ||
          (validatedData.email === "admin@pelnora.com" && validatedData.password === "admin123")) {
        isMatch = true;
        console.log("Dev mode: Login successful for", validatedData.email);
      } else {
        // For other users, verify password normally
        isMatch = await bcrypt.compare(validatedData.password, user.password);
      }
      
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
        console.error('Logout error:', err);
        return res.status(500).json({ message: "Error logging out" });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({ message: "Logged out successfully" });
    });
  });

  // Admin logout endpoint (same as regular logout but with admin-specific logging)
  app.post('/api/admin/logout', isAuthenticated, (req, res) => {
    console.log(`Admin logout: User ${req.session.userId} (${req.session.role}) logging out`);
    
    req.session.destroy((err) => {
      if (err) {
        console.error('Admin logout error:', err);
        return res.status(500).json({ message: "Error logging out from admin panel" });
      }
      res.clearCookie('connect.sid'); // Clear session cookie
      res.json({ message: "Admin logged out successfully" });
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

  // Direct referrals endpoint
  app.get('/api/referrals/me', isAuthenticated, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const directReferrals = allUsers.filter(u => u.referredBy === req.session.userId);
      
      // Remove passwords from response
      const referralsWithoutPasswords = directReferrals.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(referralsWithoutPasswords);
    } catch (error) {
      console.error('Error fetching direct referrals:', error);
      res.status(500).json({ message: "Error fetching direct referrals" });
    }
  });

  // Level statistics endpoint
  app.get('/api/level-statistics/me', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all users to count direct referrals
      const allUsers = await storage.getAllUsers();
      const directReferrals = allUsers.filter(u => u.referredBy === req.session.userId);
      const directReferralCount = directReferrals.length;

      // Calculate unlocked levels (each referral unlocks 2 levels)
      const unlockedLevels = directReferralCount * 2;
      const maxLevels = 20;
      const completionPercentage = Math.round((unlockedLevels / maxLevels) * 100);

      // Calculate next level unlock info
      const nextLevel = unlockedLevels + 1;
      const referralsNeededForNextLevel = Math.ceil(nextLevel / 2) - directReferralCount;

      // Calculate real level data based on actual users and packages
      const levels = await storage.calculateLevelEarnings(req.session.userId!);

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
      console.error('Error fetching level statistics:', error);
      res.status(500).json({ message: "Error fetching level statistics" });
    }
  });
  
  // Binary business info endpoint with detailed debug
  app.get('/api/binary-business/debug', isAuthenticated, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Debug information
      const binaryStructure = Array.from(storage.binaryStructures.values());
      const allUsers = await storage.getAllUsers();
      const allPackages = await storage.getAllPackages();
      
      // Get direct team members
      const directLeft = binaryStructure.filter(bs => bs.parentId === userId && bs.position === 'left');
      const directRight = binaryStructure.filter(bs => bs.parentId === userId && bs.position === 'right');
      
      // Get all binary structure records
      const debugInfo = {
        userId,
        userName: user.name,
        binaryStructureCount: binaryStructure.length,
        allUsersCount: allUsers.length,
        packagesCount: allPackages.length,
        directLeftCount: directLeft.length,
        directRightCount: directRight.length,
        directLeft: directLeft.map(bs => {
          const teamUser = allUsers.find(u => u.id === bs.userId);
          return {
            userId: bs.userId,
            name: teamUser?.name || 'Unknown',
            position: bs.position,
            level: bs.level
          };
        }),
        directRight: directRight.map(bs => {
          const teamUser = allUsers.find(u => u.id === bs.userId);
          return {
            userId: bs.userId,
            name: teamUser?.name || 'Unknown',
            position: bs.position,
            level: bs.level
          };
        }),
        allBinaryStructures: binaryStructure.map(bs => {
          const teamUser = allUsers.find(u => u.id === bs.userId);
          const parent = allUsers.find(u => u.id === bs.parentId);
          return {
            id: bs.id,
            userId: bs.userId,
            userName: teamUser?.name || 'Unknown',
            parentId: bs.parentId,
            parentName: parent?.name || 'No Parent',
            position: bs.position,
            level: bs.level
          };
        })
      };
      
      res.json(debugInfo);
    } catch (error) {
      console.error('Error fetching binary debug info:', error);
      res.status(500).json({ message: "Error fetching binary debug info" });
    }
  });
  
  // Binary business info endpoint
  app.get('/api/binary-business/me', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`Fetching binary business info for user ID: ${req.session.userId}`);
      
      // Get all binary structures to calculate the complete downline (including team members' referrals)
      const allBinaryStructures = Array.from(storage.binaryStructures.values());
      console.log(`Total binary structures found: ${allBinaryStructures.length}`);
      
      // Debug: print all binary structures
      console.log("All binary structures:");
      allBinaryStructures.forEach(bs => {
        console.log(`User ID: ${bs.userId}, Parent ID: ${bs.parentId}, Position: ${bs.position}, Level: ${bs.level}`);
      });
      
      const allUsers = await storage.getAllUsers();
      console.log(`Total users found: ${allUsers.length}`);
      
      // Recursively find all users in a position (left or right) including their downlines
      const getCompleteTeam = (rootUserId: number, position: string): number[] => {
        console.log(`Getting ${position} team for user ID: ${rootUserId}`);
        
        // Get direct children first
        const directChildren = allBinaryStructures
          .filter(bs => bs.parentId === rootUserId && bs.position === position)
          .map(bs => bs.userId);
        
        console.log(`Direct ${position} children for user ${rootUserId}: ${directChildren.join(', ') || 'none'}`);
        
        // Find potential missing relationships - users who were referred by team members
        const directUsers = directChildren.map(id => allUsers.find(u => u.id === id)).filter(Boolean);
        
        // Look for referrals made by these users that might not be in binary structure
        const additionalReferrals = [];
        for (const directUser of directUsers) {
          const referrals = allUsers.filter(u => u.referredBy === directUser?.id);
          for (const referral of referrals) {
            // Check if this referral is already in binary structure
            const hasStructure = allBinaryStructures.some(bs => bs.userId === referral.id);
            if (!hasStructure) {
              console.log(`Found additional referral: ${referral.name} (ID: ${referral.id}) referred by ${directUser?.name}`);
              additionalReferrals.push(referral.id);
            }
          }
        }
        
        // Then recursively get all of their children (regardless of position)
        let allTeamMembers = [...directChildren, ...additionalReferrals];
        
        for (const childId of directChildren) {
          // For each direct child, get their entire downline
          const leftDownline = getCompleteTeam(childId, 'left');
          const rightDownline = getCompleteTeam(childId, 'right');
          allTeamMembers = [...allTeamMembers, ...leftDownline, ...rightDownline];
        }
        
        // Also check additional referrals
        for (const additionalId of additionalReferrals) {
          const leftDownline = getCompleteTeam(additionalId, 'left');
          const rightDownline = getCompleteTeam(additionalId, 'right');
          allTeamMembers = [...allTeamMembers, ...leftDownline, ...rightDownline];
        }
        
        // Remove duplicates
        const uniqueMembers = Array.from(new Set(allTeamMembers));
        
        console.log(`All ${position} team members for user ${rootUserId}: ${uniqueMembers.join(', ') || 'none'}`);
        return uniqueMembers;
      };
      
      // Get complete left and right teams
      const leftTeamUserIds = getCompleteTeam(req.session.userId!, 'left');
      const rightTeamUserIds = getCompleteTeam(req.session.userId!, 'right');
      
      // Get all packages to calculate business volume
      const allPackages = await storage.getAllPackages();
      console.log(`Total packages found: ${allPackages.length}`);
      allPackages.forEach(pkg => {
        console.log(`Package ID: ${pkg.id}, User ID: ${pkg.userId}, Monthly Amount: ${pkg.monthlyAmount}, Total Months: ${pkg.totalMonths}`);
      });
      
      // SUPER VERBOSE DEBUGGING FOR PACKAGES
      console.log("========== PACKAGE DEBUGGING ==========");
      
      // Map of packages by user ID for quick lookup
      const packagesByUserId = new Map();
      
      // Log all packages with user info
      console.log("All packages:");
      for (const pkg of allPackages) {
        const pkgUser = await storage.getUser(pkg.userId);
        console.log(`Package: User ${pkgUser?.name || 'Unknown'} (ID: ${pkg.userId}), Type: ${pkg.packageType}, Amount: ${pkg.monthlyAmount}, Months: ${pkg.totalMonths}, Total value: ${parseFloat(pkg.monthlyAmount) * pkg.totalMonths}`);
        packagesByUserId.set(pkg.userId, pkg);
      }
      
      // Log all team members
      console.log("\nLeft team members:");
      for (const userId of leftTeamUserIds) {
        const user = await storage.getUser(userId);
        console.log(`- ${user?.name || 'Unknown'} (ID: ${userId})`);
      }
      
      console.log("\nRight team members:");
      for (const userId of rightTeamUserIds) {
        const user = await storage.getUser(userId);
        console.log(`- ${user?.name || 'Unknown'} (ID: ${userId})`);
      }
      
      // Calculate business volumes directly from packages
      let leftTeamBusiness = 0;
      let rightTeamBusiness = 0;
      
      // Special fix - make sure we're using actual business amounts, not just what's in memory
      // This is a workaround to make sure we capture recent package creations
      const userPackagesInDB = await Promise.all(
        [...leftTeamUserIds, ...rightTeamUserIds].map(async (userId) => {
          try {
            const userObj = await storage.getUser(userId);
            if (!userObj) return null;
            
            // Try to get their most recent package
            const userPkg = await storage.getPackageByUserId(userId);
            if (userPkg) {
              console.log(`Found package in DB for ${userObj.name}: ${userPkg.packageType}, Amount: ${userPkg.monthlyAmount}, Months: ${userPkg.totalMonths}`);
              packagesByUserId.set(userId, userPkg); // Override any existing package with the most recent one
              return {userId, package: userPkg};
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
      
      // Calculate left team business with explicit logging
      console.log("\nCalculating left team business:");
      for (const userId of leftTeamUserIds) {
        const user = await storage.getUser(userId);
        const pkg = packagesByUserId.get(userId);
        
        if (pkg) {
          const packageValue = parseFloat(pkg.monthlyAmount) * pkg.totalMonths;
          leftTeamBusiness += packageValue;
          console.log(`✓ Added ₹${packageValue} to left team business from ${user?.name || 'Unknown'} (ID: ${userId})`);
          console.log(`  Package details: Type: ${pkg.packageType}, Monthly: ₹${pkg.monthlyAmount}, Months: ${pkg.totalMonths}`);
        } else {
          console.log(`✗ No package found for ${user?.name || 'Unknown'} (ID: ${userId})`);
        }
      }
      
      // Calculate right team business with explicit logging
      console.log("\nCalculating right team business:");
      for (const userId of rightTeamUserIds) {
        const user = await storage.getUser(userId);
        const pkg = packagesByUserId.get(userId);
        
        if (pkg) {
          const packageValue = parseFloat(pkg.monthlyAmount) * pkg.totalMonths;
          rightTeamBusiness += packageValue;
          console.log(`✓ Added ₹${packageValue} to right team business from ${user?.name || 'Unknown'} (ID: ${userId})`);
          console.log(`  Package details: Type: ${pkg.packageType}, Monthly: ₹${pkg.monthlyAmount}, Months: ${pkg.totalMonths}`);
        } else {
          console.log(`✗ No package found for ${user?.name || 'Unknown'} (ID: ${userId})`);
        }
      }
      
      console.log(`\nFINAL CALCULATION: Left team business: ₹${leftTeamBusiness}, Right team business: ₹${rightTeamBusiness}`);
      console.log("========== END PACKAGE DEBUGGING ==========");
      
      // Get user details for left team
      const leftTeamUsers = await Promise.all(
        leftTeamUserIds.map(async (userId) => {
          const user = await storage.getUser(userId);
          if (!user) return null;
          
          // Get binary structure to determine level
          const binaryStructure = allBinaryStructures.find(bs => bs.userId === userId);
          
          // Get package info
          const userPackage = packagesByUserId.get(userId);
          
          return {
            id: user.id,
            name: user.name,
            position: 'left',
            level: binaryStructure?.level || 1,
            packageInfo: userPackage
          };
        })
      );
      
      // Get user details for right team
      const rightTeamUsers = await Promise.all(
        rightTeamUserIds.map(async (userId) => {
          const user = await storage.getUser(userId);
          if (!user) return null;
          
          // Get binary structure to determine level
          const binaryStructure = allBinaryStructures.find(bs => bs.userId === userId);
          
          // Get package info
          const userPackage = packagesByUserId.get(userId);
          
          return {
            id: user.id,
            name: user.name,
            position: 'right',
            level: binaryStructure?.level || 1,
            packageInfo: userPackage
          };
        })
      );
      
      // Filter out null values
      const validLeftTeamUsers = leftTeamUsers.filter(Boolean);
      const validRightTeamUsers = rightTeamUsers.filter(Boolean);
      
      console.log(`Left team business: ${leftTeamBusiness}, Right team business: ${rightTeamBusiness}`);
      console.log(`Left team users: ${validLeftTeamUsers.length}, Right team users: ${validRightTeamUsers.length}`);
      
      // Combine business info with team members data
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
      console.error('Error fetching binary business info:', error);
      res.status(500).json({ message: "Error fetching binary business info" });
    }
  });
  
  // Diagnostic endpoints for debugging
  app.get('/api/diagnostic/packages', isAuthenticated, async (req, res) => {
    try {
      const allPackages = await storage.getAllPackages();
      const allUsers = await storage.getAllUsers();
      
      // Create a detailed report of all packages with user info
      const packageReport = await Promise.all(
        allPackages.map(async (pkg) => {
          const user = allUsers.find(u => u.id === pkg.userId);
          return {
            packageId: pkg.id,
            userId: pkg.userId,
            userName: user ? user.name : 'Unknown',
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
      console.error('Error fetching package diagnostics:', error);
      res.status(500).json({ message: "Error fetching package diagnostics" });
    }
  });
  
  app.get('/api/diagnostic/binary', isAuthenticated, async (req, res) => {
    try {
      const allBinaryStructures = Array.from(storage.binaryStructures.values());
      const allUsers = await storage.getAllUsers();
      
      // Create a detailed report of binary structures
      const binaryReport = allBinaryStructures.map(bs => {
        const user = allUsers.find(u => u.id === bs.userId);
        const parent = allUsers.find(u => u.id === bs.parentId);
        return {
          id: bs.id,
          userId: bs.userId,
          userName: user ? user.name : 'Unknown',
          parentId: bs.parentId,
          parentName: parent ? parent.name : 'No Parent',
          position: bs.position,
          level: bs.level
        };
      });
      
      // Find any users who have referrals but don't appear in binary structure
      const missingUsers = [];
      for (const user of allUsers) {
        if (user.referredBy) {
          const isInBinary = allBinaryStructures.some(bs => bs.userId === user.id);
          if (!isInBinary) {
            const referrer = allUsers.find(u => u.id === user.referredBy);
            missingUsers.push({
              userId: user.id,
              userName: user.name,
              referredById: user.referredBy,
              referrerName: referrer ? referrer.name : 'Unknown',
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
      console.error('Error fetching binary diagnostics:', error);
      res.status(500).json({ message: "Error fetching binary diagnostics" });
    }
  });
  
  // Admin endpoints for KYC management
  
  // Get all users (for admin panel)
  app.get('/api/users', isAdmin, async (req, res) => {
    try {
      console.log('Fetching all users for admin panel');
      const users = await storage.getAllUsers();
      console.log(`Found ${users.length} users`);
      
      // Remove sensitive information before sending to client
      const safeUsers = users.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json(safeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });
  
  // Update user KYC status (using the new endpoint path as per client code)
  app.patch('/api/admin/kyc-verification/:userId', isAdmin, async (req, res) => {
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
      
      // Update user's KYC status
      const updatedUser = await storage.updateUser(userId, {
        kycStatus: status,
        kycRejectionReason: status === 'rejected' ? (rejectionReason || '') : ''
      });
      
      // Remove sensitive information before sending to client
      const { password, ...userWithoutPassword } = updatedUser;
      
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error updating KYC status:', error);
      res.status(500).json({ message: "Error updating KYC status" });
    }
  });
  
  // Endpoint to serve KYC images with detailed logging
  app.get('/api/kyc/image/:userId/:filename', isAdmin, async (req, res) => {
    try {
      const userId = req.params.userId;
      const filename = req.params.filename;
      console.log(`KYC image request for user ${userId}, file: ${filename}`);
      console.log(`Session:`, req.session);
      
      // Security check: ensure user exists and is related to the image
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        console.log(`User ${userId} not found for image request`);
        return res.status(404).json({ message: "User not found" });
      }
      
      console.log(`User found: ${user.name}`);
      
      // First try server/public/uploads directory
      const fs = await import('fs');
      const path = await import('path');
      
      // Working directory for reference
      const cwd = process.cwd();
      console.log(`Current working directory: ${cwd}`);
      
      // Check different possible locations for the image
      const possiblePaths = [
        path.join(cwd, 'server', 'public', 'uploads', filename),
        path.join(cwd, 'uploads', filename),
        path.join(cwd, 'public', 'uploads', filename),
        path.join(cwd, 'public', 'storage', 'kyc', filename)
      ];
      
      console.log(`Checking these paths for the image:`);
      possiblePaths.forEach(p => console.log(` - ${p}`));
      
      // Try to find the file in one of the possible locations
      let filePath = null;
      for (const testPath of possiblePaths) {
        console.log(`Checking path: ${testPath}`);
        if (fs.existsSync(testPath)) {
          filePath = testPath;
          console.log(`Image found at: ${filePath}`);
          break;
        }
      }
      
      if (!filePath) {
        console.error(`KYC image not found: ${filename} for user ${userId}`);
        return res.status(404).json({ message: "Image not found" });
      }
      
      // Determine content type based on file extension
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === '.png') contentType = 'image/png';
      else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
      else if (ext === '.gif') contentType = 'image/gif';
      else if (ext === '.pdf') contentType = 'application/pdf';
      
      console.log(`Serving image with content type: ${contentType}`);
      
      // Stream the file to the response
      res.setHeader('Content-Type', contentType);
      fs.createReadStream(filePath).pipe(res);
      
    } catch (error) {
      console.error('Error serving KYC image:', error);
      res.status(500).json({ message: "Error serving image" });
    }
  });

  // Binary structure endpoint
  app.get('/api/binary-structure/me', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all users to build the team structure
      const allUsers = await storage.getAllUsers();
      
      // Get direct referrals (downline)
      const directReferrals = allUsers.filter(u => u.referredBy === req.session.userId);
      
      // Get binary structure entries for this user's downline
      const binaryStructures = await storage.getUsersBinaryDownline(req.session.userId!);
      
      // Function to recursively count downline on a specific side
      function countDownlineOnSide(userId: number, side: 'left' | 'right', allUsers: any[], visited = new Set()): number {
        if (visited.has(userId)) return 0; // Prevent infinite loops
        visited.add(userId);
        
        // Find direct referrals of this user
        const directReferrals = allUsers.filter(u => u.referredBy === userId);
        
        let count = 0;
        
        if (side === 'left') {
          // Count first referral and all their downline
          if (directReferrals.length > 0) {
            const leftChild = directReferrals[0];
            count += 1; // Count the child itself
            // Count all downline of this child (both left and right)
            count += countAllDownline(leftChild.id, allUsers, new Set());
          }
        } else if (side === 'right') {
          // Count second referral and all their downline
          if (directReferrals.length > 1) {
            const rightChild = directReferrals[1];
            count += 1; // Count the child itself
            // Count all downline of this child (both left and right)
            count += countAllDownline(rightChild.id, allUsers, new Set());
          }
        }
        
        return count;
      }
      
      // Function to count all downline (both sides) of a user
      function countAllDownline(userId: number, allUsers: any[], visited = new Set()): number {
        if (visited.has(userId)) return 0;
        visited.add(userId);
        
        const directReferrals = allUsers.filter(u => u.referredBy === userId);
        let count = 0;
        
        for (const referral of directReferrals) {
          count += 1; // Count the referral itself
          count += countAllDownline(referral.id, allUsers, new Set(visited)); // Count their downline
        }
        
        return count;
      }
      
      // Combine user data with binary structure data
      const downline = directReferrals.map((referral, index) => {
        const binaryEntry = binaryStructures.find(bs => bs.userId === referral.id);
        const { password, ...userWithoutPassword } = referral;
        
        // Simple binary placement: alternate between left and right
        // In a real system, this would be more sophisticated
        const position = binaryEntry?.position || (index % 2 === 0 ? 'left' : 'right');
        
        return {
          ...userWithoutPassword,
          position,
          level: binaryEntry?.level || 1,
          joinedAt: referral.createdAt
        };
      });

      // Calculate correct left and right team counts including entire downline
      const leftTeamCount = countDownlineOnSide(req.session.userId!, 'left', allUsers);
      const rightTeamCount = countDownlineOnSide(req.session.userId!, 'right', allUsers);

      // Debug logging
      console.log(`🔍 Binary calculation for user ${req.session.userId}:`);
      console.log(`   Direct referrals: ${directReferrals.length}`);
      console.log(`   Left team count: ${leftTeamCount}`);
      console.log(`   Right team count: ${rightTeamCount}`);
      
      if (directReferrals.length > 0) {
        console.log(`   Left child: ${directReferrals[0]?.name} (ID: ${directReferrals[0]?.id})`);
        const leftChildDownline = countAllDownline(directReferrals[0]?.id, allUsers, new Set());
        console.log(`   Left child downline: ${leftChildDownline}`);
      }
      
      if (directReferrals.length > 1) {
        console.log(`   Right child: ${directReferrals[1]?.name} (ID: ${directReferrals[1]?.id})`);
        const rightChildDownline = countAllDownline(directReferrals[1]?.id, allUsers, new Set());
        console.log(`   Right child downline: ${rightChildDownline}`);
      }

      // Get business information
      const businessInfo = await storage.getBinaryBusinessInfo(req.session.userId!);

      res.json({
        user: {
          id: user.id,
          name: user.name,
          referralId: user.referralId
        },
        downline,
        leftTeamCount,
        rightTeamCount,
        leftTeamBusiness: businessInfo.leftTeamBusiness || '0',
        rightTeamBusiness: businessInfo.rightTeamBusiness || '0',
        leftCarryForward: businessInfo.leftCarryForward || '0',
        rightCarryForward: businessInfo.rightCarryForward || '0',
        totalTeamSize: leftTeamCount + rightTeamCount
      });
    } catch (error) {
      console.error('Error fetching binary structure:', error);
      res.status(500).json({ message: "Error fetching binary structure" });
    }
  });

  // Level statistics endpoint
  app.get('/api/level-statistics/me', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Get all users to calculate statistics
      const allUsers = await storage.getAllUsers();
      
      // Calculate direct referral count
      const directReferralCount = allUsers.filter(u => u.referredBy === req.session.userId).length;
      
      // Calculate unlocked levels (2 levels per direct referral)
      const unlockedLevels = Math.min(directReferralCount * 2, 20); // Max 20 levels
      const maxLevels = 20;
      const completionPercentage = Math.round((unlockedLevels / maxLevels) * 100);
      
      // Calculate next level requirements
      const nextLevel = unlockedLevels < maxLevels ? unlockedLevels + 1 : null;
      const referralsNeededForNextLevel = nextLevel ? Math.ceil(nextLevel / 2) - directReferralCount : 0;
      
      // Generate level breakdown
      const levels = [];
      for (let i = 1; i <= maxLevels; i++) {
        const requiredReferrals = Math.ceil(i / 2);
        const isUnlocked = directReferralCount >= requiredReferrals;
        
        // Get users at this level (simplified calculation)
        const usersAtLevel = allUsers.filter(u => {
          // This is a simplified calculation - in a real system you'd traverse the tree
          return u.referredBy === req.session.userId;
        });
        
        levels.push({
          level: i,
          status: isUnlocked ? 'unlocked' : 'locked',
          requiredReferrals,
          memberCount: isUnlocked ? usersAtLevel.length : 0,
          earnings: '0' // This would be calculated from actual earnings
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
      console.error('Error fetching level statistics:', error);
      res.status(500).json({ message: "Error fetching level statistics" });
    }
  });

  // Earnings routes
  app.get('/api/earnings/me', isAuthenticated, async (req, res) => {
    try {
      const earnings = await storage.getUserEarnings(req.session.userId!);
      res.json(earnings);
    } catch (error) {
      console.error('Error fetching user earnings:', error);
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });

  // Real-time earnings are calculated automatically when packages are purchased
  // No demo earnings endpoint needed

  // Package routes
  app.get('/api/packages/me', isAuthenticated, async (req, res) => {
    try {
      const userPackage = await storage.getUserPackage(req.session.userId!);
      res.json(userPackage);
    } catch (error) {
      console.error('Error fetching user package:', error);
      res.status(500).json({ message: "Error fetching package" });
    }
  });

  app.post('/api/packages', isAuthenticated, async (req, res) => {
    try {
      // Exclude userId from validation since we get it from session
      const { userId, ...bodyData } = req.body;
      const validatedData = insertPackageSchema.omit({ userId: true }).parse(bodyData);
      
      // Check if user already has a package
      const existingPackage = await storage.getUserPackage(req.session.userId!);
      if (existingPackage) {
        return res.status(400).json({ message: "User already has an active package" });
      }
      
      // Create package with userId from session
      const newPackage = await storage.createPackage({
        ...validatedData,
        userId: req.session.userId!
      });
      
      res.status(201).json(newPackage);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      console.error('Error creating package:', error);
      res.status(500).json({ message: "Error creating package" });
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
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log(`Fetching binary structure info for user ID: ${req.session.userId}`);
      
      // Get user's binary business information
      const businessInfo = await storage.getBinaryBusinessInfo(req.session.userId!);
      
      // Get user's downline with detailed information
      const downline = await storage.getUsersBinaryDownline(req.session.userId!);
      
      // Get detailed user information for each downline member
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
      
      // Calculate total team size
      const totalTeamSize = user.leftTeamCount + user.rightTeamCount;
      
      res.json({
        user: {
          id: user.id,
          name: user.name
        },
        leftTeamCount: user.leftTeamCount,
        rightTeamCount: user.rightTeamCount,
        totalTeamSize: totalTeamSize,
        leftTeamBusiness: businessInfo.leftTeamBusiness,
        rightTeamBusiness: businessInfo.rightTeamBusiness,
        leftCarryForward: businessInfo.leftCarryForward,
        rightCarryForward: businessInfo.rightCarryForward,
        downline: detailedDownline
      });
    } catch (error) {
      console.error('Error fetching binary structure:', error);
      res.status(500).json({ message: "Error fetching binary structure" });
    }
  });

  // Debug binary structures
  app.get('/api/debug/binary-structures', isAdmin, async (req, res) => {
    try {
      const allBinaryStructures = await storage.getAllBinaryStructures();
      const allUsers = await storage.getAllUsers();
      const allPackages = await storage.getAllPackages();
      
      const debugInfo = {
        binaryStructures: allBinaryStructures.map(bs => {
          const user = allUsers.find(u => u.id === bs.userId);
          const parent = allUsers.find(u => u.id === bs.parentId);
          return {
            id: bs.id,
            userId: bs.userId,
            userName: user?.name || 'Unknown',
            parentId: bs.parentId,
            parentName: parent?.name || 'Unknown',
            position: bs.position,
            level: bs.level
          };
        }),
        users: allUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          referredBy: u.referredBy,
          leftTeamCount: u.leftTeamCount,
          rightTeamCount: u.rightTeamCount
        })),
        packages: allPackages.map(p => {
          const user = allUsers.find(u => u.id === p.userId);
          return {
            id: p.id,
            userId: p.userId,
            userName: user?.name || 'Unknown',
            packageType: p.packageType,
            monthlyAmount: p.monthlyAmount
          };
        })
      };
      
      res.json(debugInfo);
    } catch (error) {
      console.error('Error fetching debug info:', error);
      res.status(500).json({ message: "Error fetching debug information" });
    }
  });

  // Binary business information route
  app.get('/api/binary-business/me', isAuthenticated, async (req, res) => {
    try {
      // Get user's binary business information
      const businessInfo = await storage.getBinaryBusinessInfo(req.session.userId!);
      
      // Get user's downline with detailed information
      const downline = await storage.getUsersBinaryDownline(req.session.userId!);
      
      // Get detailed user information for each downline member
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
      
      // Get current user for team counts
      const currentUser = await storage.getUser(req.session.userId!);
      
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
      console.error('Error fetching binary business info:', error);
      res.status(500).json({ message: "Error fetching binary business information" });
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

  // Earnings routes
  app.get('/api/earnings/me', isAuthenticated, async (req, res) => {
    try {
      console.log(`Fetching earnings for user ${req.session.userId} at ${new Date().toISOString()}`);
      
      // Generate demo earnings if none exist
      await storage.generateDemoEarnings(req.session.userId!);
      
      const earnings = await storage.getUserEarnings(req.session.userId!);
      console.log(`Found ${earnings.length} earnings for user ${req.session.userId}`);
      
      // Prevent caching
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      
      res.json(earnings);
    } catch (error) {
      console.error('Error fetching user earnings:', error);
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });

  app.get('/api/packages/me', isAuthenticated, async (req, res) => {
    try {
      const userPackage = await storage.getUserPackage(req.session.userId!);
      res.json(userPackage);
    } catch (error) {
      console.error('Error fetching user package:', error);
      res.status(500).json({ message: "Error fetching package" });
    }
  });

  // Debug endpoint to check user relationships
  app.get('/api/debug/user-info', isAuthenticated, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      const allUsers = await storage.getAllUsers();
      const directReferrals = allUsers.filter(u => u.referredBy === req.session.userId);
      
      res.json({
        currentUser: user,
        allUsersCount: allUsers.length,
        directReferrals: directReferrals,
        allUsers: allUsers.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          referredBy: u.referredBy,
          referralId: u.referralId
        }))
      });
    } catch (error) {
      console.error('Error fetching debug info:', error);
      res.status(500).json({ message: "Error fetching debug info" });
    }
  });

  // Force earnings generation for testing
  app.post('/api/debug/generate-earnings', isAuthenticated, async (req, res) => {
    try {
      console.log(`Force generating earnings for user ${req.session.userId}`);
      await storage.generateDemoEarnings(req.session.userId!);
      
      const earnings = await storage.getUserEarnings(req.session.userId!);
      const user = await storage.getUser(req.session.userId!);
      
      res.json({
        message: 'Earnings generation attempted',
        userId: req.session.userId,
        earningsCount: earnings.length,
        earnings: earnings,
        userTotalEarnings: user?.totalEarnings
      });
    } catch (error) {
      console.error('Error generating earnings:', error);
      res.status(500).json({ message: "Error generating earnings" });
    }
  });

  // Debug endpoint to check session
  app.get('/api/debug/session', (req, res) => {
    res.json({
      session: req.session,
      sessionID: req.sessionID,
      cookies: req.headers.cookie
    });
  });

  // Clear session endpoint (for debugging)
  app.post('/api/debug/clear-session', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not clear session" });
      }
      res.clearCookie('connect.sid');
      res.json({ message: "Session cleared" });
    });
  });

  // Admin login endpoint
  app.post('/api/admin/login', async (req, res) => {
    try {
      console.log('Admin login attempt:', req.body);
      const { username, password } = req.body;
      
      // Fixed admin credentials
      if (username !== 'admin' || password !== 'Qwertghjkl@13') {
        console.log('Invalid credentials provided:', { username, password: '***' });
        return res.status(401).json({ message: "Invalid admin credentials" });
      }
      
      // Get or create admin user
      let adminUser = await storage.getUserByEmail('admin@pelnora.com');
      console.log('Found admin user:', adminUser ? 'Yes' : 'No');
      
      if (!adminUser) {
        console.log('Creating admin user...');
        // Create admin user if doesn't exist
        adminUser = await storage.createUser({
          name: "Admin User",
          email: "admin@pelnora.com",
          phone: "1234567890",
          password: "admin123",
          role: "admin",
          isActive: true,
        });
        console.log('Admin user created:', adminUser.id);
      }
      
      // Ensure user has admin role
      if (adminUser.role !== 'admin') {
        console.log('Updating user role to admin');
        adminUser = await storage.updateUser(adminUser.id, { role: 'admin' });
      }
      
      // Set session
      req.session.userId = adminUser.id;
      req.session.isAdmin = true;
      
      console.log('Admin login successful, session set:', req.session.userId);
      
      res.json({
        id: adminUser.id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        isActive: adminUser.isActive,
      });
    } catch (error) {
      console.error('Admin login error:', error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Admin stats endpoint
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
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
      
      const earnings = await storage.getAllEarnings();
      const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      const emiPayments = await storage.getAllEMIPayments();
      const totalPaidEMIs = emiPayments.filter(emi => emi.status === 'paid').length;
      
      // Get recent signups (last 10)
      const allUsers = await storage.getAllUsers();
      const recentSignups = allUsers
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10)
        .map(user => ({
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
        recentSignups,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  // Admin User Management APIs
  app.get('/api/admin/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove sensitive information like passwords
      const safeUsers = users.map(user => ({
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
        createdAt: user.createdAt,
        // Explicitly exclude password field
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.get('/api/users', isAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      // Remove sensitive information like passwords
      const safeUsers = users.map(user => ({
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
        createdAt: user.createdAt,
        // Explicitly exclude password field
      }));
      res.json(safeUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  // Admin endpoint to recalculate all user stats (team counts, earnings, etc.)
  app.post('/api/admin/recalculate-all-stats', isAdmin, async (req, res) => {
    try {
      console.log('🔧 Admin triggered comprehensive stats recalculation');
      
      const result = await storage.recalculateAllUserStats();
      
      console.log('🔧 Recalculation result:', result);
      
      res.json(result);
    } catch (error) {
      console.error('Error recalculating all stats:', error);
      res.status(500).json({ 
        success: false,
        message: "Error recalculating user stats",
        updatedUsers: 0
      });
    }
  });

  // Debug endpoint to check current user stats
  app.get('/api/debug/user-stats/:id', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      const earnings = await storage.getEarningsByUserId(userId);
      const binaryStructure = await storage.getBinaryStructureByUserId(userId);
      
      res.json({
        user: user ? {
          id: user.id,
          name: user.name,
          totalEarnings: user.totalEarnings,
          leftTeamCount: user.leftTeamCount,
          rightTeamCount: user.rightTeamCount,
          withdrawableAmount: user.withdrawableAmount
        } : null,
        earnings: earnings.map(e => ({
          id: e.id,
          amount: e.amount,
          earningType: e.earningType,
          description: e.description
        })),
        binaryStructure
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({ message: "Error fetching user stats" });
    }
  });

  // Simple endpoint to manually reset a user's stats to zero
  app.post('/api/debug/reset-user-stats/:id', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`🔧 Manually resetting stats for user ${userId}`);
      
      const updatedUser = await storage.updateUser(userId, {
        totalEarnings: "0",
        leftTeamCount: 0,
        rightTeamCount: 0,
        withdrawableAmount: "0",
        leftCarryForward: "0",
        rightCarryForward: "0"
      });
      
      if (updatedUser) {
        console.log(`✅ Reset stats for user ${updatedUser.name}`);
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
      console.error('Error resetting user stats:', error);
      res.status(500).json({ success: false, message: "Error resetting user stats" });
    }
  });

  // Admin endpoint to get user's package
  app.get('/api/admin/users/:id/package', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const userPackage = await storage.getPackageByUserId(userId);
      
      if (userPackage) {
        res.json(userPackage);
      } else {
        res.status(404).json({ message: "No package found for this user" });
      }
    } catch (error) {
      console.error('Error fetching user package:', error);
      res.status(500).json({ message: "Error fetching user package" });
    }
  });

  // Admin endpoint to create or update user's package
  app.post('/api/admin/users/:id/package', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { packageType, monthlyAmount, totalMonths = 11, paidMonths = 0 } = req.body;
      
      console.log(`📦 Admin updating package for user ${userId}:`, { packageType, monthlyAmount });
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if user already has a package
      const existingPackage = await storage.getPackageByUserId(userId);
      
      if (existingPackage) {
        // Update existing package
        console.log(`📦 Updating existing package ${existingPackage.id} for user ${user.name}`);
        const updatedPackage = await storage.updatePackage(existingPackage.id, {
          packageType,
          monthlyAmount: monthlyAmount.toString(),
          totalMonths,
          paidMonths,
          isCompleted: false,
          bonusEarned: false
        });
        
        if (updatedPackage) {
          console.log(`✅ Updated package for user ${user.name}`);
          res.json({
            success: true,
            message: `Updated package for user ${user.name}`,
            package: updatedPackage
          });
        } else {
          console.log(`❌ Failed to update package for user ${user.name}`);
          res.status(500).json({ message: "Failed to update package" });
        }
      } else {
        // Create new package
        const newPackage = await storage.createPackage({
          userId,
          packageType,
          monthlyAmount: monthlyAmount.toString(),
          totalMonths,
          paidMonths
        });
        
        console.log(`✅ Created new package for user ${user.name}`);
        res.json({
          success: true,
          message: `Created new package for user ${user.name}`,
          package: newPackage
        });
      }
    } catch (error) {
      console.error('Error managing user package:', error);
      res.status(500).json({ message: "Error managing user package" });
    }
  });

  // Admin endpoint to delete user's package
  app.delete('/api/admin/users/:id/package', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      
      console.log(`🗑️ Admin deleting package for user ${userId}`);
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get user's package
      const userPackage = await storage.getPackageByUserId(userId);
      if (!userPackage) {
        return res.status(404).json({ message: "No package found for this user" });
      }
      
      // Delete the package (this should be implemented in storage)
      const deleted = await storage.deletePackage(userPackage.id);
      
      if (deleted) {
        console.log(`✅ Deleted package for user ${user.name}`);
        res.json({
          success: true,
          message: `Deleted package for user ${user.name}`
        });
      } else {
        res.status(500).json({ message: "Failed to delete package" });
      }
    } catch (error) {
      console.error('Error deleting user package:', error);
      res.status(500).json({ message: "Error deleting user package" });
    }
  });

  // Admin endpoint to update user levels
  app.patch('/api/admin/users/:id/levels', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { unlockedLevels } = req.body;
      
      console.log(`🔓 Admin updating levels for user ${userId}: ${unlockedLevels}`);
      
      // Validate levels
      if (typeof unlockedLevels !== 'number' || unlockedLevels < 0 || unlockedLevels > 20) {
        return res.status(400).json({ message: "Invalid level. Must be between 0 and 20." });
      }
      
      // Check if user exists
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user levels
      const updatedUser = await storage.updateUser(userId, { unlockedLevels });
      
      if (updatedUser) {
        console.log(`✅ Updated levels for user ${user.name} to ${unlockedLevels}`);
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
      console.error('Error updating user levels:', error);
      res.status(500).json({ message: "Error updating user levels" });
    }
  });

  // Admin endpoint to manually trigger earnings calculation for existing packages
  app.post('/api/admin/recalculate-earnings', isAdmin, async (req, res) => {
    try {
      console.log('🔧 Admin triggered earnings recalculation');
      
      const packages = await storage.getAllPackages();
      const users = await storage.getAllUsers();
      
      let recalculatedCount = 0;
      const results = [];
      
      // Process each package and trigger earnings calculation
      for (const pkg of packages) {
        const user = users.find(u => u.id === pkg.userId);
        if (user) {
          console.log(`🔄 Recalculating earnings for ${user.name}'s ${pkg.packageType} package`);
          
          try {
            // Call the earnings calculation method
            await storage.calculateRealEarnings(pkg.userId, pkg);
            recalculatedCount++;
            
            results.push({
              userId: pkg.userId,
              userName: user.name,
              packageType: pkg.packageType,
              monthlyAmount: pkg.monthlyAmount,
              status: 'success'
            });
          } catch (error) {
            console.error(`❌ Error recalculating for user ${user.name}:`, error);
            results.push({
              userId: pkg.userId,
              userName: user.name,
              packageType: pkg.packageType,
              monthlyAmount: pkg.monthlyAmount,
              status: 'error',
              error: error.message
            });
          }
        }
      }
      
      console.log(`✅ Recalculated earnings for ${recalculatedCount} packages`);
      
      res.json({
        message: `Successfully recalculated earnings for ${recalculatedCount} packages`,
        totalPackages: packages.length,
        recalculatedCount,
        results
      });
    } catch (error) {
      console.error('Error recalculating earnings:', error);
      res.status(500).json({ message: "Error recalculating earnings" });
    }
  });

  // Admin endpoint to permanently delete a user with comprehensive cleanup and recalculation
  app.post('/api/admin/users/:id/delete-permanently', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const adminId = req.session.userId!;
      
      console.log(`🗑️ Admin ${adminId} permanently deleting user ${userId}`);
      
      // Call the comprehensive delete method
      const result = await storage.deleteUserPermanently(userId, adminId);
      
      if (result.success) {
        console.log(`✅ ${result.message}`);
        res.json(result);
      } else {
        console.error(`❌ ${result.message}`);
        res.status(500).json(result);
      }
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      res.status(500).json({ 
        success: false,
        message: `Error deleting user: ${error instanceof Error ? error.message : 'Unknown error'}`
      });
    }
  });

  // Admin endpoint to delete a user and all related data (legacy - simple delete)
  app.delete('/api/admin/users/:id', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`🗑️ Admin deleting user ${userId}`);
      
      // Prevent deleting admin users
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      if (user.role === 'admin') {
        return res.status(400).json({ message: "Cannot delete admin users" });
      }
      
      // Delete user's earnings
      const userEarnings = await storage.getEarningsByUserId(userId);
      console.log(`Deleting ${userEarnings.length} earnings records for user ${user.name}`);
      
      // Delete user's package
      const userPackage = await storage.getPackageByUserId(userId);
      if (userPackage) {
        console.log(`Deleting package for user ${user.name}`);
      }
      
      // Delete user's withdrawals
      const userWithdrawals = await storage.getWithdrawalsByUserId(userId);
      console.log(`Deleting ${userWithdrawals.length} withdrawal records for user ${user.name}`);
      
      // Call storage delete method (we need to implement this)
      const deleted = await storage.deleteUser(userId);
      
      if (deleted) {
        console.log(`✅ Successfully deleted user ${user.name} (ID: ${userId})`);
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
      console.error('Error deleting user:', error);
      res.status(500).json({ message: "Error deleting user" });
    }
  });

  // Admin endpoint to reset a user's earnings
  app.post('/api/admin/users/:id/reset-earnings', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`🔄 Admin resetting earnings for user ${userId}`);
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Reset user's earnings to 0
      const updatedUser = await storage.updateUser(userId, {
        totalEarnings: '0',
        withdrawableAmount: '0'
      });
      
      // Delete all earnings records for this user
      const deletedEarnings = await storage.deleteEarningsByUserId(userId);
      
      console.log(`✅ Reset earnings for ${user.name} - deleted ${deletedEarnings} records`);
      
      res.json({
        message: `Successfully reset earnings for ${user.name}`,
        user: {
          id: userId,
          name: user.name,
          totalEarnings: '0',
          deletedEarningsCount: deletedEarnings
        }
      });
    } catch (error) {
      console.error('Error resetting earnings:', error);
      res.status(500).json({ message: "Error resetting earnings" });
    }
  });

  app.patch('/api/users/:id', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedUser = await storage.updateUser(userId, updateData);
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ message: "Error updating user" });
    }
  });

  // Admin Password Management APIs
  app.get('/api/admin/users/:id/password', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // For security reasons, we'll return a masked version or indicate it's hashed
      // In a real production app, you might not want to expose actual passwords
      res.json({ 
        password: user.password.startsWith('$2') ? '[Encrypted Password]' : user.password,
        isHashed: user.password.startsWith('$2')
      });
    } catch (error) {
      console.error('Error fetching user password:', error);
      res.status(500).json({ message: "Error fetching user password" });
    }
  });

  app.patch('/api/admin/users/:id/password', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const { password } = req.body;
      
      if (!password || password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters long" });
      }
      
      // Hash the password before storing
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const updatedUser = await storage.updateUser(userId, { password: hashedPassword });
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json({ message: "Password updated successfully" });
    } catch (error) {
      console.error('Error updating user password:', error);
      res.status(500).json({ message: "Error updating user password" });
    }
  });

  // Admin Withdrawal Management APIs
  app.get('/api/admin/withdrawals', isAdmin, async (req, res) => {
    try {
      const withdrawals = await storage.getAllWithdrawals();
      
      // Get user details for each withdrawal
      const withdrawalsWithUsers = await Promise.all(
        withdrawals.map(async (withdrawal) => {
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
      console.error('Error fetching withdrawals:', error);
      res.status(500).json({ message: "Error fetching withdrawals" });
    }
  });

  app.patch('/api/admin/withdrawals/:id', isAdmin, async (req, res) => {
    try {
      const withdrawalId = parseInt(req.params.id);
      const updateData = req.body;
      
      const updatedWithdrawal = await storage.updateWithdrawal(withdrawalId, updateData);
      if (!updatedWithdrawal) {
        return res.status(404).json({ message: "Withdrawal not found" });
      }
      
      res.json(updatedWithdrawal);
    } catch (error) {
      console.error('Error updating withdrawal:', error);
      res.status(500).json({ message: "Error updating withdrawal" });
    }
  });

  // Admin Earnings Management APIs
  app.get('/api/admin/earnings', isAdmin, async (req, res) => {
    try {
      const earnings = await storage.getAllEarnings();
      
      // Get user details for each earning
      const earningsWithUsers = await Promise.all(
        earnings.map(async (earning) => {
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
      console.error('Error fetching earnings:', error);
      res.status(500).json({ message: "Error fetching earnings" });
    }
  });

  app.post('/api/admin/earnings', isAdmin, async (req, res) => {
    try {
      const { userId, amount, earningType, description } = req.body;
      
      const earning = await storage.createEarning({
        userId,
        amount: amount.toString(),
        earningType,
        description: description || 'Manual adjustment by admin'
      });
      
      // Update user's total earnings
      await storage.updateUserEarnings(userId, parseFloat(amount));
      
      res.json(earning);
    } catch (error) {
      console.error('Error creating earning:', error);
      res.status(500).json({ message: "Error creating earning" });
    }
  });

  // Admin EMI Management APIs
  app.get('/api/admin/emi-payments', isAdmin, async (req, res) => {
    try {
      const emiPayments = await storage.getAllEMIPayments();
      
      // Get user and package details for each EMI
      const emiWithDetails = await Promise.all(
        emiPayments.map(async (emi) => {
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
      console.error('Error fetching EMI payments:', error);
      res.status(500).json({ message: "Error fetching EMI payments" });
    }
  });

  // Admin Auto Pool Management APIs
  app.get('/api/admin/auto-pool', isAdmin, async (req, res) => {
    try {
      const autoPoolEntries = await storage.getAutoPoolMatrix();
      
      // Get user details for each entry
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
      console.error('Error fetching auto pool data:', error);
      res.status(500).json({ message: "Error fetching auto pool data" });
    }
  });

  // Admin Stats API
  app.get('/api/admin/stats', isAdmin, async (req, res) => {
    try {
      const userCount = await storage.getUserCount();
      
      // Calculate other stats
      const packages = await storage.getAllPackages();
      const activePackages = packages.filter(pkg => !pkg.isCompleted).length;
      const completedPackages = packages.filter(pkg => pkg.isCompleted).length;
      
      const withdrawals = await storage.getAllWithdrawals();
      const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending').length;
      const approvedWithdrawals = withdrawals.filter(w => w.status === 'approved').length;
      const totalWithdrawalAmount = withdrawals
        .filter(w => w.status === 'approved')
        .reduce((sum, w) => sum + parseFloat(w.amount), 0);
      
      const earnings = await storage.getAllEarnings();
      const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.amount), 0);
      
      const emiPayments = await storage.getAllEMIPayments();
      const totalEMIAmount = emiPayments.reduce((sum, emi) => sum + parseFloat(emi.amount), 0);
      
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
          silver: packages.filter(p => p.packageType === 'silver').length,
          gold: packages.filter(p => p.packageType === 'gold').length,
          platinum: packages.filter(p => p.packageType === 'platinum').length,
          diamond: packages.filter(p => p.packageType === 'diamond').length,
        }
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({ message: "Error fetching stats" });
    }
  });

  // Stats routes (legacy)
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

  // Admin User Management - Deactivate/Activate User
  app.post('/api/admin/users/:id/deactivate', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`Admin deactivating user ${userId}`);
      
      const deactivatedUser = await storage.deactivateUser(userId);
      if (!deactivatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = deactivatedUser;
      
      res.json({
        message: `User ${deactivatedUser.name} has been deactivated`,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error deactivating user:', error);
      res.status(500).json({ message: "Error deactivating user" });
    }
  });

  app.post('/api/admin/users/:id/activate', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      console.log(`Admin activating user ${userId}`);
      
      const activatedUser = await storage.activateUser(userId);
      if (!activatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = activatedUser;
      
      res.json({
        message: `User ${activatedUser.name} has been activated`,
        user: userWithoutPassword
      });
    } catch (error) {
      console.error('Error activating user:', error);
      res.status(500).json({ message: "Error activating user" });
    }
  });

  // Admin User Management - Delete User Permanently
  app.post('/api/admin/users/:id/delete-permanently', isAdmin, async (req, res) => {
    try {
      const userId = parseInt(req.params.id);
      const adminId = req.session.userId!;
      
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
          timestamp: new Date(),
          action: 'USER_DELETED_PERMANENTLY'
        }
      });
    } catch (error) {
      console.error('Error permanently deleting user:', error);
      res.status(500).json({ message: "Error permanently deleting user" });
    }
  });

  // Admin User Management - Get Orphaned Users
  app.get('/api/admin/orphaned-users', isAdmin, async (req, res) => {
    try {
      const allUsers = await storage.getAllUsers();
      const allBinaryStructures = Array.from(storage.binaryStructures.values());
      
      // Find users who don't have binary structure entries (orphaned)
      const orphanedUsers = allUsers.filter(user => {
        // Skip admin users
        if (user.role === 'admin') return false;
        
        // Check if user has binary structure
        const hasStructure = allBinaryStructures.some(bs => bs.userId === user.id);
        return !hasStructure;
      });
      
      // Remove passwords from response
      const safeOrphanedUsers = orphanedUsers.map(user => {
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
      });
      
      res.json({
        count: safeOrphanedUsers.length,
        users: safeOrphanedUsers
      });
    } catch (error) {
      console.error('Error fetching orphaned users:', error);
      res.status(500).json({ message: "Error fetching orphaned users" });
    }
  });

  // KYC routes
  const kycRouter = await import('./api/kyc');
  app.use('/api/kyc', kycRouter.default);
  
  // KYC size test routes
  const kycSizeTestRouter = await import('./api/kyc-size-test');
  app.use('/api/kyc-size', kycSizeTestRouter.default);

  // Fetch user by referralId (public endpoint)
  app.get('/api/users/by-referral/:referralId', async (req, res) => {
    try {
      const { referralId } = req.params;
      const user = await storage.getUserByReferralId(referralId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      // Type assertion to fix linter error
      const { password, ...userWithoutPassword } = user as any;
      res.json(userWithoutPassword);
    } catch (error) {
      console.error('Error fetching user by referralId:', error);
      res.status(500).json({ message: 'Error fetching user by referralId' });
    }
  });

  // Health check endpoint
  app.get('/api/health', async (req, res) => {
    try {
      // Check database connection
      const dbCheck = await storage.getUser(1); // Try to fetch admin user
      
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        database: dbCheck ? 'connected' : 'disconnected',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.env.npm_package_version || '1.0.0'
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
