import express, { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { storage } from '../storage';
import { kycStatusEnum } from '@shared/schema';
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
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.userId) {
    return res.status(401).json({ message: "Authentication required" });
  }

  const user = await storage.getUser(req.session.userId);
  
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

const router = express.Router();

// Configure multer for file uploads
// Use import.meta.url to get the current module's URL and convert to a path
const __filename = new URL(import.meta.url).pathname;
// Convert Windows paths if needed
const normalizedFilename = process.platform === 'win32' 
  ? __filename.substring(1) // Remove leading slash for Windows
  : __filename;
const __dirname = path.dirname(normalizedFilename);
const uploadsDir = path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const kycStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniquePrefix = uuidv4();
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: kycStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    // No minimum file size limit
  },
  fileFilter: function (req, file, cb) {
    // Log file details for debugging
    console.log(`KYC Upload - File: ${file.originalname}, Type: ${file.mimetype}`);
    
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    
    if (mimetype && extname) {
      console.log(`KYC Upload - File validation passed for ${file.originalname}`);
      return cb(null, true);
    }
    
    console.log(`KYC Upload - File validation failed for ${file.originalname}: mimetype=${mimetype}, extname=${extname}`);
    cb(new Error("Only .png, .jpg, .jpeg, and .pdf files are allowed. Make sure both file extension and MIME type are correct."));
  }
});

// Submit KYC documents
router.post('/submit', isAuthenticated, upload.fields([
  { name: 'panCardImage', maxCount: 1 },
  { name: 'idProofImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { panNumber, idProofType, idProofNumber } = req.body;
    
    // Validate required fields
    if (!panNumber || !idProofType || !idProofNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    
    if (!files.panCardImage || !files.idProofImage) {
      return res.status(400).json({ error: 'Missing required documents' });
    }
    
    // Update user KYC information
    await storage.updateUserKYC({
      userId,
      panNumber,
      idProofType,
      idProofNumber,
      panCardImage: `/uploads/${files.panCardImage[0].filename}`,
      idProofImage: `/uploads/${files.idProofImage[0].filename}`,
      kycStatus: 'pending'
    });
    
    // Create notification for the user
    await storage.createNotification({
      userId,
      type: 'kyc',
      message: 'Your KYC documents have been submitted for verification.'
    });
    
    // Notify admins about new KYC submission
    const admins = await storage.getAdminUsers();
    for (const admin of admins) {
      await storage.createNotification({
        userId: admin.id,
        type: 'admin_kyc',
        message: `New KYC verification request from user ID: ${userId}`
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'KYC submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting KYC:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to submit KYC documents'
    });
  }
});

// Get KYC status for current user
router.get('/status', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.status(200).json({
      panNumber: user.panNumber,
      idProofType: user.idProofType,
      idProofNumber: user.idProofNumber,
      panCardImage: user.panCardImage,
      idProofImage: user.idProofImage,
      kycStatus: user.kycStatus,
      kycRejectionReason: user.kycRejectionReason
    });
  } catch (error) {
    console.error('Error fetching KYC status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch KYC status'
    });
  }
});

// Refresh user data after KYC submission
router.get('/refresh-user', isAuthenticated, async (req, res) => {
  try {
    const userId = req.session.userId!;
    
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user data without sensitive information
    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      referralId: user.referralId,
      totalEarnings: user.totalEarnings,
      withdrawableAmount: user.withdrawableAmount,
      kycStatus: user.kycStatus,
      kycRejectionReason: user.kycRejectionReason,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Error refreshing user data:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to refresh user data'
    });
  }
});

// Admin: Get all KYC requests
router.get('/admin/all', isAdmin, async (req, res) => {
  try {
    const statusFilter = req.query.status as string || 'all';
    
    const kycRequests = await storage.getKYCRequests(statusFilter);
    
    return res.status(200).json(kycRequests);
  } catch (error) {
    console.error('Error fetching KYC requests:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch KYC requests'
    });
  }
});

// Admin: KYC verification endpoint (dedicated endpoint for the admin panel)
router.post('/admin/kyc-verification/:userId', isAdmin, async (req, res) => {
  try {
    // Log request for debugging
    console.log('KYC Verification Request:', { 
      userId: req.params.userId, 
      body: req.body 
    });
    
    // Validate userId
    if (!req.params.userId) {
      return res.status(400).json({ 
        error: 'User ID is required' 
      });
    }
    
    const userId = req.params.userId;
    
    // Validate status
    if (!req.body || !req.body.status) {
      return res.status(400).json({ 
        error: 'Status is required',
        message: 'Both user id and status are required'
      });
    }
    
    const { status, rejectionReason } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status',
        message: 'Status must be either "approved" or "rejected"'
      });
    }
    
    if (status === 'rejected' && !rejectionReason) {
      return res.status(400).json({ 
        error: 'Rejection reason is required',
        message: 'A reason must be provided when rejecting KYC'
      });
    }
    
    // Update user KYC status
    await storage.updateUserKYCStatus({
      userId,
      kycStatus: status,
      kycRejectionReason: status === 'rejected' ? rejectionReason : null
    });
    
    // Create notification for the user
    const message = status === 'approved'
      ? 'Your KYC has been approved! You can now update your bank details and request withdrawals.'
      : `Your KYC has been rejected. Reason: ${rejectionReason}`;
    
    await storage.createNotification({
      userId,
      type: 'kyc_status',
      message
    });
    
    return res.status(200).json({
      success: true,
      message: `KYC ${status === 'approved' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error in KYC verification:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update KYC status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Admin: Approve or reject KYC
router.post('/admin/:userId', isAdmin, async (req, res) => {
  try {
    // Log request for debugging
    console.log('KYC Approval Request:', { 
      userId: req.params.userId, 
      body: req.body 
    });
    
    // Check if userId parameter exists
    if (!req.params.userId) {
      return res.status(400).json({ 
        error: 'User ID is required',
        details: 'Missing userId parameter in URL'
      });
    }
    
    const targetUserId = parseInt(req.params.userId);
    if (isNaN(targetUserId)) {
      return res.status(400).json({ 
        error: 'Invalid user ID',
        details: 'User ID must be a number'
      });
    }
    
    // Check if action is provided
    if (!req.body || !req.body.action) {
      return res.status(400).json({ 
        error: 'Action is required',
        details: 'Missing action field in request body'
      });
    }
    
    const { action, rejectionReason } = req.body;
    
    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action' });
    }
    
    if (action === 'reject' && !rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    // Update user KYC status
    await storage.updateUserKYCStatus({
      userId: targetUserId,
      kycStatus: action === 'approve' ? 'approved' : 'rejected',
      kycRejectionReason: action === 'reject' ? rejectionReason : null
    });
    
    // Create notification for the user
    const message = action === 'approve'
      ? 'Your KYC has been approved! You can now update your bank details and request withdrawals.'
      : `Your KYC has been rejected. Reason: ${rejectionReason}`;
    
    await storage.createNotification({
      userId: targetUserId,
      type: 'kyc_status',
      message
    });
    
    return res.status(200).json({
      success: true,
      message: `KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });
  } catch (error) {
    console.error('Error updating KYC status:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update KYC status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Route to serve KYC images
router.get('/image/:userId/*', isAdmin, (req, res) => {
  try {
    // Extract the image path from the URL
    const imagePath = req.params[0];
    if (!imagePath) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Resolve the path to the actual file
    const filePath = path.join(__dirname, '..', 'public', imagePath);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`Image not found at path: ${filePath}`);
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Send the file
    return res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving KYC image:', error);
    return res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Make sure we're exporting for ES modules
export default router;