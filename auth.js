const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Luu y #2 (Phan quyen) trong anh review:
 * "Khong can tach ra nhieu du an hay Domain khac nhau, chi can phan quyen la duoc."
 * => Dung 1 backend duy nhat, phan quyen bang middleware authorize(...roles)
 *    gan vao tung route. Giao vien thay giao dien/chuc nang khac hoc vien
 *    hoan toan o tang API (route nao duoc phep goi), FE tu render UI theo role.
 */

// 1. Xac thuc: giai ma JWT, gan req.user
async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Thieu token xac thuc' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Tai khoan khong ton tai' });
    }

    req.user = user; // { _id, name, email, role, currentBand, ... }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token khong hop le hoac da het han' });
  }
}

// 2. Phan quyen: chi cho phep cac role duoc liet ke di qua
// Vi du: router.post('/lectures', verifyToken, authorize('teacher', 'admin'), ...)
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Ban khong co quyen thuc hien hanh dong nay (yeu cau: ${allowedRoles.join(', ')})`,
      });
    }
    next();
  };
}

module.exports = { verifyToken, authorize };
