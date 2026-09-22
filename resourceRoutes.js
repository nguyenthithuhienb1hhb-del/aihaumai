const express = require('express');
const router = express.Router();

const { verifyToken, authorize } = require('../middleware/auth');
const Submission = require('../models/Submission');
const Resource = require('../models/Resource');

/**
 * GET /api/resources/recommend/:submissionId
 *
 * "Nhan diem so yeu nhat cua hoc vien vua nop -> Truy van va tra ve
 * 3 tai nguyen giai tri/hoc tap sat nhat voi trinh do do."
 */
router.get(
  '/recommend/:submissionId',
  verifyToken,
  authorize('student', 'teacher', 'admin'),
  async (req, res) => {
    try {
      const submission = await Submission.findById(req.params.submissionId);
      if (!submission) return res.status(404).json({ message: 'Khong tim thay bai lam' });

      const weakest = submission.getWeakestSkill();
      if (!weakest) {
        return res.status(400).json({ message: 'Bai lam nay chua co diem theo ky nang' });
      }

      // Tim tai nguyen: dung skillTag trung + trinh do (minBand/maxBand) bao quanh diem yeu nhat
      const resources = await Resource.find({
        skillTags: weakest.skill,
        minBand: { $lte: weakest.score },
        maxBand: { $gte: weakest.score },
      })
        .limit(3)
        .lean();

      res.json({
        weakestSkill: weakest.skill,
        weakestScore: weakest.score,
        recommendations: resources,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
