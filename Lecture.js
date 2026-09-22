const mongoose = require('mongoose');

// Bai giang: giao vien upload PDF/Word/Anh qua multer (nghiep vu 1)
const lectureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    classId: { type: String, required: true }, // ma lop, don gian hoa - co the ref sang Class rieng neu can

    fileUrl: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'word', 'image'], required: true },
    originalName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lecture', lectureSchema);
