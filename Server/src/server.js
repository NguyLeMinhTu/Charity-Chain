require('dotenv').config(); // Nạp biến môi trường từ file .env
const app = require('./app'); // Ứng dụng Express đã cấu hình middleware và routes
const connectDB = require('./config/db'); // Hàm kết nối MongoDB

const PORT = process.env.PORT || 5000; // Cổng chạy server (ưu tiên từ biến môi trường)

// Kết nối DB trước, sau đó khởi chạy server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});
