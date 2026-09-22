require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const materialRoutes = require('./routes/materialRoutes');
const aiRoutes = require('./routes/aiRoutes');
const quizRoutes = require('./routes/quizRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// Cho phep truy cap file da upload (bai giang/bai tap) qua URL /uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Routes theo tung nghiep vu trong anh 1 ---
app.use('/api/materials', materialRoutes); // 1. upload bai giang/bai tap
app.use('/api/ai', aiRoutes); // 2. AI hint
app.use('/api/quiz', quizRoutes); // 1(quiz). chong thoat bai
app.use('/api/resources', resourceRoutes); // 4. goi y tai nguyen
app.use('/api/enrollment', enrollmentRoutes); // 5. tien do + voucher tu dong

app.get('/', (req, res) => res.json({ status: 'ZIM Academy LMS/AI API is running' }));

// Error handler chung (vd: loi tu multer fileFilter)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message || 'Loi khong xac dinh' });
});

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
