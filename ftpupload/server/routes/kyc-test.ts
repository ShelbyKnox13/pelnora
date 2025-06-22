import { FastifyInstance } from 'fastify';
import fs from 'fs';
import path from 'path';
import { pipeline } from 'stream/promises';
import { randomUUID } from 'crypto';
import { authenticate } from '../middlewares/auth';

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

  // Simple test endpoint for file uploads
  fastify.post('/api/kyc/test-upload', async (request, reply) => {
    try {
      // Process the multipart form data
      const parts = request.parts();
      const uploadDetails = [];
      
      for await (const part of parts) {
        if (part.file) {
          // Handle file part
          const fileExt = path.extname(part.filename || '');
          const fileDetails = {
            fieldname: part.fieldname,
            filename: part.filename,
            mimetype: part.mimetype,
            filesize: 0,
            extension: fileExt,
            validExt: ['.jpg', '.jpeg', '.png', '.pdf'].includes(fileExt.toLowerCase()),
            validMime: /^(image\/(jpeg|jpg|png)|application\/pdf)$/.test(part.mimetype),
          };
          
          // Count bytes to get file size
          let size = 0;
          for await (const chunk of part.file) {
            size += chunk.length;
          }
          fileDetails.filesize = size;
          
          uploadDetails.push(fileDetails);
        } else {
          // Handle field part
          uploadDetails.push({
            fieldname: part.fieldname,
            value: part.value,
            type: 'field'
          });
        }
      }
      
      return reply.code(200).send({
        message: 'File upload test successful',
        details: uploadDetails
      });
    } catch (error: any) {
      console.error('Error in test upload:', error);
      return reply.code(500).send({ 
        error: 'Test upload failed',
        message: error.message
      });
    }
  });
}