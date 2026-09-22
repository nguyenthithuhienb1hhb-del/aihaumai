const express = require('express');
const router = express.Router();

const { verifyToken, authorize } = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const QuizSession = require('../models/QuizSession');

/**
 * "Voi nhung bai quiz cua giao vien (nhu grammar, hay mini test cua giang
 * vien up thi khong cho hoc vien out ra trong luc lam bai nhe. Out qua
 * 3 lan = huy bai."
 *
 * FE chiu trach nhiem phat hien hoc vien roi tab/cua so (vd: su kien
 * `document.visibilitychange` hoac `window.onblur`) va goi POST .../out
 * moi lan phat hien. Backend chi dem so lan va quyet dinh huy bai.
 */

// Bat dau lam quiz
router.post('/:assignmentId/start', verifyToken, authorize('student'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.assignmentId);
    if (!assignment || assignment.type !== 'quiz') {
      return res.status(404).json({ message: 'Khong tim thay quiz' });
    }

    const session = await QuizSession.create({
      assignment: assignment._id,
      student: req.user._id,
    });

    res.status(201).json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// FE goi moi khi phat hien hoc vien thoat khoi tab/cua so lam bai
router.post('/:sessionId/out', verifyToken, authorize('student'), async (req, res) => {
  try {
    const session = await QuizSession.findById(req.params.sessionId).populate('assignment');
    if (!session) return res.status(404).json({ message: 'Khong tim thay phien lam bai' });
    if (session.status !== 'in_progress') {
      return res.json(session); // da huy hoac da nop roi, khong xu ly them
    }

    session.outCount += 1;

    const maxOutCount =
      session.assignment.quizConfig?.maxOutCount || Number(process.env.QUIZ_MAX_OUT_COUNT) || 3;

    if (session.outCount > maxOutCount) {
      session.status = 'cancelled';
      session.cancelledReason = `Thoat qua ${maxOutCount} lan trong luc lam bai`;
      session.endedAt = new Date();
    }

    await session.save();
    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Nop bai khi lam xong (neu chua bi huy)
router.post('/:sessionId/submit', verifyToken, authorize('student'), async (req, res) => {
  try {
    const session = await QuizSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ message: 'Khong tim thay phien lam bai' });

    if (session.status === 'cancelled') {
      return res.status(400).json({ message: 'Bai lam da bi huy do thoat qua so lan cho phep' });
    }

    session.status = 'completed';
    session.endedAt = new Date();
    await session.save();

    res.json(session);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
