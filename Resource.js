const mongoose = require('mongoose');

// Bang du lieu tai nguyen giai tri/hoc tap: sach, bai bao, phim, truyen...
// kem tag ky nang va trinh do phu hop (nghiep vu 4)
const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    type: { type: String, enum: ['book', 'article', 'movie', 'story'], required: true },
    url: { type: String },
    description: { type: String },

    // Ky nang ma tai nguyen nay ho tro, vd: ['reading','vocabulary']
    skillTags: { type: [String], required: true, index: true },

    // Trinh do phu hop, luu duoi dang khoang band de de query,
    // vd minBand=4.5, maxBand=5.5 nghia la "phu hop hoc vien band 4.5-5.5"
    minBand: { type: Number, required: true },
    maxBand: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resource', resourceSchema);
