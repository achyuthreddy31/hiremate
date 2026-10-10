import multer from 'multer';
import { env } from '../config/env.js';

// Strictly store in memory - no disk writes
const storage = multer.memoryStorage();

export const uploadResume = multer({
  storage,
  limits: {
    fileSize: env.MAX_FILE_SIZE || 5 * 1024 * 1024 // 5 MB default
  },
  fileFilter: (req, file, cb) => {
    // 1. Check file extension
    if (!file.originalname.toLowerCase().endsWith('.pdf')) {
      return cb(new Error('Only PDF files (.pdf) are permitted'), false);
    }
    // 2. Check MIME type
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Invalid MIME type. Only application/pdf is accepted'), false);
    }
    cb(null, true);
  }
});

/**
 * Validates the raw buffer contains the %PDF- magic bytes signature
 */
export function validatePdfSignature(buffer) {
  if (!buffer || buffer.length < 5) return false;
  // %PDF- in ASCII: 0x25, 0x50, 0x44, 0x46, 0x2D
  const signature = buffer.slice(0, 5).toString('ascii');
  return signature === '%PDF-';
}
