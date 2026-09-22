const mongoose = require('mongoose');

// Trang thai theo hoc cua 1 hoc vien trong 1 lop.
// Khi progress dat 100 -> status 'completed' -> tu dong cap voucher (nghiep vu 5)
const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: String, required: true },

    progress: { type: Number, min: 0, max: 100, default: 0 }, // % tien do lop hoc
    status: {
      type: String,
      enum: ['in_progress', 'completed'],
      default: 'in_progress',
    },

    voucherCode: { type: String, default: null },
    voucherIssuedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Enrollment', enrollmentSchema);
