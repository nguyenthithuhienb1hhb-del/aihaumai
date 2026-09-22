const express = require('express');
const router = express.Router();

const { verifyToken, authorize } = require('../middleware/auth');
const Enrollment = require('../models/Enrollment');
const { issueVoucherIfCompleted } = require('../services/voucherService');

/**
 * PATCH /api/enrollment/:id/progress
 * body: { progress: 0-100 }
 *
 * Chi giao vien/admin duoc cap nhat tien do (vd: sau khi cham xong module
 * cuoi cung). Khi progress cham 100, ham issueVoucherIfCompleted se tu
 * dong sinh voucher IELTS va luu vao ho so - dung nghiep vu 5.
 */
router.patch('/:id/progress', verifyToken, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { progress } = req.body;
    if (progress === undefined || progress < 0 || progress > 100) {
      return res.status(400).json({ message: 'progress phai trong khoang 0-100' });
    }

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ message: 'Khong tim thay lop hoc' });

    enrollment.progress = progress;
    await issueVoucherIfCompleted(enrollment); // tu dong cap voucher neu vua dat 100%
    await enrollment.save();

    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Hoc vien xem ho so lop hoc cua chinh minh (de FE hien thi voucher neu co)
router.get('/me/:classId', verifyToken, authorize('student'), async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      classId: req.params.classId,
    });
    if (!enrollment) return res.status(404).json({ message: 'Khong tim thay du lieu lop hoc' });

    res.json(enrollment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
