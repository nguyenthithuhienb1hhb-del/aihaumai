const mongoose = require('mongoose');

/**
 * Theo doi 1 luot lam quiz cua hoc vien.
 * FE se goi POST /api/quiz/:sessionId/out moi khi phat hien hoc vien
 * roi khoi tab/cua so lam bai (vd: bat su kien `visibilitychange`/`blur`).
 * Out qua quizConfig.maxOutCount lan => status chuyen sang 'cancelled'.
 */
const quizSessionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    outCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'cancelled'],
      default: 'in_progress',
    },
    cancelledReason: { type: String },

    startedAt: { type: Date, default: Date.now },
    endedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('QuizSession', quizSessionSchema);
