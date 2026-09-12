const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { errorResponse } = require('../utils/response');

const UPLOAD_DIR = path.resolve(__dirname, '../../temp/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// 5MB file size limit as specified in Blueprint section 13
const MAX_FILE_SIZE = 5 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
  'text/plain',
  'application/pdf',
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '';
    const randomKey = crypto.randomBytes(16).toString('hex');
    cb(null, `ref-${Date.now()}-${randomKey}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('REFERENCE_UNSUPPORTED: Only PNG, JPG, WEBP, TXT, and PDF files are supported.');
    err.code = 'REFERENCE_UNSUPPORTED';
    cb(err, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter,
});

// Wrapper middleware to handle multer errors gracefully with the standard API envelope
const handleReferenceUpload = (req, res, next) => {
  const uploadSingle = upload.single('reference');

  uploadSingle(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return errorResponse(res, 'REFERENCE_UNSUPPORTED', 'File exceeds the maximum allowed size of 5MB', 400);
      }
      return errorResponse(res, 'VALIDATION_ERROR', `Upload error: ${err.message}`, 400);
    }

    if (err.code === 'REFERENCE_UNSUPPORTED') {
      return errorResponse(res, 'REFERENCE_UNSUPPORTED', err.message, 400);
    }

    return errorResponse(res, 'INTERNAL_ERROR', 'An unexpected error occurred during file upload', 500);
  });
};

module.exports = {
  handleReferenceUpload,
  UPLOAD_DIR,
};
