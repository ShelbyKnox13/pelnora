import { FastifyInstance } from 'fastify';
import { db } from '../db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { authenticate } from '../middlewares/auth';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { randomUUID } from 'crypto';

export default async function (fastify: FastifyInstance) {
  // Register multipart support for file uploads
  fastify.register(import('@fastify/multipart'), {
    limits: {
      fieldNameSize: 100, // Max field name size in bytes
      fieldSize: 1000000, // Max field value size in bytes (1MB)
      fields: 10, // Max number of non-file fields
      fileSize: 2000000, // Max file size in bytes (2MB)
      files: 2, // Max number of file fields
    },
  });

  // Create uploads directory if it doesn't exist
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

  // Submit KYC documents
  fastify.post('/api/kyc/submit', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      
      // Parse form data
      const data: any = {};
      const files: any = {};
      
      // Process the multipart form data
      const parts = request.parts();
      
      for await (const part of parts) {
        if (part.file) {
          // Handle file part
          const fileExt = path.extname(part.filename || '');
          const allowedExts = ['.jpg', '.jpeg', '.png', '.pdf'];
          
          if (!allowedExts.includes(fileExt.toLowerCase())) {
            return reply.code(400).send({ 
              error: 'Invalid file type. Only JPG/JPEG, PNG, and PDF files are allowed.' 
            });
          }
          
          const filename = `${randomUUID()}${fileExt}`;
          const filepath = path.join(uploadsDir, filename);
          
          await pipeline(part.file, fs.createWriteStream(filepath));
          
          files[part.fieldname] = `/uploads/${filename}`;
        } else {
          // Handle field part
          data[part.fieldname] = part.value;
        }
      }
      
      // Validate required fields
      if (!data.panNumber || !data.idProofType || !data.idProofNumber) {
        return reply.code(400).send({ error: 'Missing required fields' });
      }
      
      if (!files.panCardImage || !files.idProofImage) {
        return reply.code(400).send({ error: 'Missing required documents' });
      }
      
      // Update user record with KYC information
      await db.update(users)
        .set({
          panNumber: data.panNumber,
          idProofType: data.idProofType,
          idProofNumber: data.idProofNumber,
          panCardImage: files.panCardImage,
          idProofImage: files.idProofImage,
          kycStatus: 'pending',
          kycRejectionReason: null
        })
        .where(eq(users.id, userId));
      
      // Create notification for KYC submission
      await db.execute(
        db.insert("notifications")
          .values({
            userId: userId,
            type: 'kyc',
            message: 'Your KYC documents have been submitted for verification.',
            isRead: false
          })
      );
      
      // Create notification for admins
      const admins = await db.select({ id: users.id })
        .from(users)
        .where(eq(users.role, 'admin'));
      
      for (const admin of admins) {
        await db.execute(
          db.insert("notifications")
            .values({
              userId: admin.id,
              type: 'admin_kyc',
              message: `New KYC verification request from user ID: ${userId}`,
              isRead: false
            })
        );
      }
      
      return reply.code(200).send({ 
        message: 'KYC submitted successfully',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error submitting KYC:', error);
      return reply.code(500).send({ 
        error: 'Failed to submit KYC documents' 
      });
    }
  });

  // Get KYC status for current user
  fastify.get('/api/kyc/status', { preHandler: authenticate }, async (request, reply) => {
    try {
      const userId = (request.user as any).id;
      
      const userRecord = await db.select({
        panNumber: users.panNumber,
        idProofType: users.idProofType,
        idProofNumber: users.idProofNumber,
        panCardImage: users.panCardImage,
        idProofImage: users.idProofImage,
        kycStatus: users.kycStatus,
        kycRejectionReason: users.kycRejectionReason
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
      
      if (userRecord.length === 0) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      return reply.code(200).send(userRecord[0]);
    } catch (error) {
      console.error('Error fetching KYC status:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch KYC status' 
      });
    }
  });

  // Admin: Get all KYC requests
  fastify.get('/api/admin/kyc', { preHandler: authenticate }, async (request, reply) => {
    try {
      // Check if user is admin
      const userRole = (request.user as any).role;
      if (userRole !== 'admin') {
        return reply.code(403).send({ error: 'Unauthorized' });
      }
      
      // Get query parameters for filtering
      const status = (request.query as any).status || 'pending';
      
      // Query KYC submissions
      const kycRequests = await db.select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        panNumber: users.panNumber,
        idProofType: users.idProofType,
        idProofNumber: users.idProofNumber,
        panCardImage: users.panCardImage,
        idProofImage: users.idProofImage,
        kycStatus: users.kycStatus,
        kycRejectionReason: users.kycRejectionReason,
        createdAt: users.createdAt
      })
      .from(users)
      .where(status === 'all' ? undefined : eq(users.kycStatus, status));
      
      return reply.code(200).send(kycRequests);
    } catch (error) {
      console.error('Error fetching KYC requests:', error);
      return reply.code(500).send({ 
        error: 'Failed to fetch KYC requests' 
      });
    }
  });

  // Admin: Approve or reject KYC
  fastify.post('/api/admin/kyc/:userId', { preHandler: authenticate }, async (request, reply) => {
    try {
      // Check if user is admin
      const userRole = (request.user as any).role;
      if (userRole !== 'admin') {
        return reply.code(403).send({ error: 'Unauthorized' });
      }
      
      const { userId } = request.params as any;
      const { action, rejectionReason } = request.body as any;
      
      if (!['approve', 'reject'].includes(action)) {
        return reply.code(400).send({ error: 'Invalid action' });
      }
      
      if (action === 'reject' && !rejectionReason) {
        return reply.code(400).send({ error: 'Rejection reason is required' });
      }
      
      // Update user's KYC status
      await db.update(users)
        .set({
          kycStatus: action === 'approve' ? 'approved' : 'rejected',
          kycRejectionReason: action === 'reject' ? rejectionReason : null
        })
        .where(eq(users.id, parseInt(userId)));
      
      // Create notification for user
      await db.execute(
        db.insert("notifications")
          .values({
            userId: parseInt(userId),
            type: 'kyc_status',
            message: action === 'approve' 
              ? 'Your KYC has been approved! You can now update your bank details and request withdrawals.'
              : `Your KYC has been rejected. Reason: ${rejectionReason}`,
            isRead: false
          })
      );
      
      return reply.code(200).send({ 
        message: `KYC ${action === 'approve' ? 'approved' : 'rejected'} successfully` 
      });
    } catch (error) {
      console.error('Error updating KYC status:', error);
      return reply.code(500).send({ 
        error: 'Failed to update KYC status' 
      });
    }
  });
}