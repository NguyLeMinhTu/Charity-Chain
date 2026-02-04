const mongoose = require('mongoose'); // ODM cho MongoDB

// Kết nối đến MongoDB bằng URI từ biến môi trường
const connectDB = async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');
};

module.exports = connectDB; // Xuất hàm kết nối
