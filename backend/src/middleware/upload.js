const multer = require('multer');
const path = require('path');

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return cb(new Error('INVALID_EXTENSION'), false);
  }

  if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
    return cb(new Error('INVALID_MIME_TYPE'), false);
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

module.exports = { upload, ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS, MAX_FILE_SIZE };