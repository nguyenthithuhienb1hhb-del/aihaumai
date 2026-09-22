const express = require('express');
const router = express.Router();

const { verifyToken, authorize } = require('../middleware/auth');
const { upload, resolveFileType } = require('../middleware/upload');
const Lecture = require('../models/Lecture');
const Assignment = require('../models/Assignment');

/**
 * POST /api/materials/lectures
 * Giao vien upload 1 bai giang (PDF/Word/Anh) - form-data field "file"
 * Chi 'teacher' va 'admin' duoc goi (phan quyen - luu y #2)
 */
router.post(
  '/lectures',
  verifyToken,
  authorize('teacher', 'admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ message: 'Thieu file bai giang' });

      const lecture = await Lecture.create({
        title: req.body.title,
        description: req.body.description,
        teacher: req.user._id,
        classId: req.body.classId,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: resolveFileType(req.file.mimetype),
        originalName: req.file.originalname,
      });

      res.status(201).json(lecture);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

/**
 * POST /api/materials/assignments
 * Giao vien tao bai tap / de bai (co the kem file, hoac la quiz).
 * form-data field "file" la optional.
 */
router.post(
  '/assignments',
  verifyToken,
  authorize('teacher', 'admin'),
  upload.single('file'),
  async (req, res) => {
    try {
      const { title, content, classId, type, skillTag, dueDate, maxOutCount, durationMinutes } =
        req.body;

      const assignment = await Assignment.create({
        title,
        content,
        classId,
        teacher: req.user._id,
        type: type === 'quiz' ? 'quiz' : 'homework',
        skillTag,
        dueDate,
        fileUrl: req.file ? `/uploads/${req.file.filename}` : undefined,
        quizConfig:
          type === 'quiz'
            ? {
                maxOutCount: Number(maxOutCount) || Number(process.env.QUIZ_MAX_OUT_COUNT) || 3,
                durationMinutes: Number(durationMinutes) || 30,
              }
            : undefined,
      });

      res.status(201).json(assignment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

module.exports = router;
