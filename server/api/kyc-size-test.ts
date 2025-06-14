import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { fileURLToPath } from 'url';

const router = express.Router();

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory
const uploadsDir = path.join(__dirname, '../public/uploads/test');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer storage without size limits for testing
const testStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniquePrefix = uuidv4();
    cb(null, uniquePrefix + '-' + file.originalname);
  }
});

// Create a test upload middleware with detailed logging
const testUpload = multer({
  storage: testStorage,
  // No size limits for this test endpoint
  fileFilter: function (req, file, cb) {
    console.log("File received:", {
      fieldname: file.fieldname,
      originalname: file.originalname,
      mimetype: file.mimetype,
      // Size is not available at this point
    });
    
    // Accept all files for testing
    return cb(null, true);
  }
});

// Special test endpoint to diagnose size issues
router.post('/test-size', testUpload.single('testFile'), (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file received',
        message: 'The server did not receive any file in the request'
      });
    }
    
    // Log detailed info about the received file
    const fileInfo = {
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: {
        bytes: req.file.size,
        kb: (req.file.size / 1024).toFixed(2) + ' KB',
        mb: (req.file.size / (1024 * 1024)).toFixed(4) + ' MB'
      },
      path: req.file.path,
      fieldname: req.file.fieldname
    };
    
    console.log("File successfully processed:", fileInfo);
    
    // Return successful response with file details
    return res.status(200).json({
      success: true,
      message: 'File received and processed successfully',
      fileInfo: fileInfo
    });
  } catch (error: any) {
    console.error('Error in size test upload:', error);
    return res.status(500).json({
      error: 'Server error processing file',
      message: error.message
    });
  }
});

// Error handler for multer errors
router.use((err: any, req: Request, res: Response, next: Function) => {
  if (err instanceof multer.MulterError) {
    // A multer error occurred when uploading
    console.error('Multer error:', err);
    return res.status(400).json({
      error: 'File upload error',
      code: err.code,
      field: err.field,
      message: err.message,
      multerError: true
    });
  } else if (err) {
    // An unknown error occurred
    console.error('Unknown error in file upload:', err);
    return res.status(500).json({
      error: 'Server error',
      message: err.message
    });
  }
  
  // If no error, continue
  next();
});

export default router;