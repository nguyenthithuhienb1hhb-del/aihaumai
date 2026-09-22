const mongoose = require('mongoose');

// Bai lam cua hoc vien nop cho 1 assignment
const submissionSchema = new mongoose.Schema(
  {
    assignment: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    content: { type: String }, // bai lam dang text (vd essay, tra loi)
    fileUrl: { type: String }, // hoac bai lam dang file

    // Diem cham cho tung ky nang - dung de xac dinh "diem yeu nhat" (nghiep vu 4)
    scoresBySkill: {
      type: Map,
      of: Number, // vd: { listening: 5.5, reading: 6.0, writing: 5.0 }
      default: {},
    },

    // So lan hoc vien da bam "xin goi y AI" cho bai nay
    aiHintCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ['submitted', 'grading', 'graded', 'cancelled'],
      default: 'submitted',
    },
  },
  { timestamps: true }
);

// Ham tien ich: lay ky nang co diem thap nhat trong bai lam nay
submissionSchema.methods.getWeakestSkill = function () {
  let weakestSkill = null;
  let weakestScore = Infinity;
  for (const [skill, score] of this.scoresBySkill.entries()) {
    if (score < weakestScore) {
      weakestScore = score;
      weakestSkill = skill;
    }
  }
  return weakestSkill ? { skill: weakestSkill, score: weakestScore } : null;
};

module.exports = mongoose.model('Submission', submissionSchema);
