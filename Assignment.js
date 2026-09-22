const mongoose = require('mongoose');

// Bai tap / de bai giao vien giao (nghiep vu 1).
// type = 'quiz' => ap dung co che chong thoat (khong cho hoc vien out qua N lan)
const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    // Noi dung de bai - dung lam input cho AI hint (nghiep vu 2)
    content: { type: String, required: true },
    fileUrl: { type: String }, // de bai co the kem file PDF/Word/Anh

    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: String, required: true },

    // 'homework' = bai tap thuong, 'quiz' = grammar/mini test co chong thoat
    type: { type: String, enum: ['homework', 'quiz'], default: 'homework' },

    // Chi ap dung khi type = 'quiz'
    quizConfig: {
      maxOutCount: { type: Number, default: 3 }, // out qua so lan nay = huy bai
      durationMinutes: { type: Number, default: 30 },
    },

    // Tag ky nang de phuc vu goi y tai nguyen sau nay (vd: 'reading','grammar','vocabulary')
    skillTag: { type: String },

    dueDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', assignmentSchema);
