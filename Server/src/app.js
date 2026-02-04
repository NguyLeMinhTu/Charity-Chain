const express = require('express'); // Framework web cho Node.js
const cors = require('cors');       // Bật CORS cho API
const morgan = require('morgan');   // Logger HTTP
const helmet = require('helmet');   // Thiết lập header bảo mật

const app = express(); // Khởi tạo ứng dụng Express

// Middleware bảo mật và phân tích request
app.use(helmet());           // Thêm các header bảo mật mặc định
app.use(cors());             // Cho phép truy cập cross-origin
app.use(express.json());     // Parse JSON body
app.use(morgan('dev'));      // Ghi log request theo định dạng 'dev'

// Endpoint kiểm tra trạng thái hệ thống
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Đăng ký các nhóm route
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes); // Nhóm route xác thực người dùng

const campaignRoutes = require('./routes/campaignRoutes');
app.use('/api/campaigns', campaignRoutes); // Nhóm route quản lý chiến dịch

const donationRoutes = require('./routes/donationRoutes');
app.use('/api/donations', donationRoutes); // Nhóm route quản lý quyên góp

// Middleware xử lý lỗi tập trung
const errorHandler = require('./middlewares/errorMiddleware');
app.use(errorHandler);

module.exports = app; // Xuất ứng dụng để server.js sử dụng
