const express = require('express');
const router = express.Router();

const { verifyToken, authorize } = require('../middleware/auth');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const aiService = require('../services/aiService');

/**
 * POST /api/ai/hint
 * body: { assignmentId, submissionId? , studentAnswer? }
 *
 * Chi goi API khi hoc vien CHU DONG bam yeu cau (dung nhu de bai yeu cau:
 * "chi goi API khi hoc vien co thao tac bam yeu cau") - tuc la khong tu
 * dong trigger, FE se goi endpoint nay khi user bam nut "Xin goi y".
 *
 * Chi 'student' duoc goi (phan quyen).
 */
router.post('/hint', verifyToken, authorize('student'), async (req, res) => {
  try {
    const { assignmentId, submissionId, studentAnswer } = req.body;

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Khong tim thay bai tap' });

    // Neu bai nay la quiz (grammar/mini test), theo de bai: khong duoc phep
    // xin AI hint giua luc dang lam (de tranh gian lan) - chi cho phep voi
    // bai tap thuong (homework).
    if (assignment.type === 'quiz') {
      return res
        .status(403)
        .json({ message: 'Khong ho tro AI hint cho bai quiz/mini test dang lam' });
    }

    const hintText = await aiService.getHint({
      assignmentContent: assignment.content,
      studentAnswer,
      currentBand: req.user.currentBand,
    });

    // Neu co submissionId thi tang bo dem so lan xin hint (de theo doi/thong ke)
    if (submissionId) {
      await Submission.findByIdAndUpdate(submissionId, { $inc: { aiHintCount: 1 } });
    }

    res.json({ hint: hintText });
  } catch (err) {
    res.status(500).json({ message: 'Loi khi goi AI', detail: err.message });
  }
});

module.exports = router;
