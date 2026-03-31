import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env.js';

const baseDir = path.resolve(process.cwd(), env.UPLOAD_DIR);
for (const sub of ['images', 'pdfs', 'videos']) {
  fs.mkdirSync(path.join(baseDir, sub), { recursive: true });
}

const ALLOWED = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'video/mp4',
  'video/webm',
]);

function subdirForMime(mimetype) {
  if (mimetype.startsWith('image/')) return 'images';
  if (mimetype.startsWith('video/')) return 'videos';
  return 'pdfs';
}

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, path.join(baseDir, subdirForMime(file.mimetype)));
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname) || '.bin';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: env.UPLOAD_MAX_BYTES },
  fileFilter(req, file, cb) {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error('Only JPEG, PNG, WebP, PDF, MP4, or WebM allowed'));
  },
});

export function uploadSingle(req, res, next) {
  upload.single('file')(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}

export function uploadPathForType(file) {
  const sub = subdirForMime(file.mimetype);
  return `/uploads/${sub}/${file.filename}`;
}
