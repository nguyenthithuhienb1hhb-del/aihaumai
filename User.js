const mongoose = require('mongoose');

/**
 * Luu y #2 (Phan quyen): moi user co 1 role duy nhat.
 * Khong tach du an/domain rieng cho tung role - chi can Authorization
 * o tang middleware (xem middleware/auth.js) la du, dung nhu ghi chu trong anh.
 */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, // da hash bang bcrypt
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],
      default: 'student',
      required: true,
    },

    // Danh cho student: band diem IELTS hien tai, dung cho:
    // - API /api/ai/hint (band hien tai)
    // - API /api/resources/recommend (goi y theo trinh do)
    currentBand: { type: Number, min: 0, max: 9, default: null },

    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Enrollment' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
