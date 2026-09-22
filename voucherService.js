const { customAlphabet } = require('nanoid');

// Nghiep vu 5: "Khi trang thai tien do lop hoc cua hoc vien dat 100%
// (Da hoan thanh), tu dong tao 1 ma Voucher uu dai le phi thi IELTS
// luu vao ho so hoc vien de FE 4 hien thi."

const nanoid = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

function generateVoucherCode() {
  return `IELTS-${nanoid()}`;
}

/**
 * Kiem tra va cap voucher neu enrollment vua dat 100% tien do.
 * Idempotent: neu da co voucherCode roi thi khong tao lai (tranh spam
 * voucher khi API duoc goi nhieu lan).
 * @param {import('../models/Enrollment')} enrollment - mongoose document
 */
async function issueVoucherIfCompleted(enrollment) {
  const justCompleted = enrollment.progress >= 100 && enrollment.status !== 'completed';

  if (justCompleted) {
    enrollment.status = 'completed';
  }

  const needsVoucher = enrollment.status === 'completed' && !enrollment.voucherCode;

  if (needsVoucher) {
    enrollment.voucherCode = generateVoucherCode();
    enrollment.voucherIssuedAt = new Date();
  }

  return enrollment;
}

module.exports = { generateVoucherCode, issueVoucherIfCompleted };
