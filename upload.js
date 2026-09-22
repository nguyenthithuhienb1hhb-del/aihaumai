const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Nghiep vu 1: "Su dung multer de viet API cho giao vien tai file
// bai giang, bai tap: PDF/Word/Anh"

const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = {
  'application/pdf': 'pdf',
  'application/msword': 'word',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'word',
  'image/png': 'image',
  'image/jpeg': 'image',
  'image/jpg': 'image',
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIME[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Dinh dang file khong duoc ho tro. Chi chap nhan PDF/Word/Anh.'));
  }
}

const maxSizeMb = Number(process.env.MAX_UPLOAD_SIZE_MB || 20);

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSizeMb * 1024 * 1024 },
});

// Ham tien ich: suy ra fileType luu vao DB tu mimetype
function resolveFileType(mimetype) {
  return ALLOWED_MIME[mimetype] || 'unknown';
}

module.exports = { upload, resolveFileType, UPLOAD_DIR };
