const jwt = require('jsonwebtoken'); // Thư viện JWT để xác thực
const User = require('../models/User'); // Model người dùng

// Middleware xác thực: kiểm tra token Bearer và gắn user vào req
const auth = async (req, res, next) => {
    try {
        const header = req.headers.authorization; // Lấy header Authorization
        if (!header || !header.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const token = header.split(' ')[1]; // Tách token từ chuỗi 'Bearer xxx'
        const decoded = jwt.verify(token, process.env.JWT_SECRET); // Giải mã token
        const user = await User.findById(decoded.id).select('-password'); // Tìm user và ẩn password
        if (!user) return res.status(401).json({ message: 'Unauthorized' });

        req.user = user; // Gắn user vào request để các handler sử dụng
        next(); // Cho phép đi tiếp
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' }); // Token không hợp lệ/expired
    }
};

module.exports = auth; // Xuất middleware