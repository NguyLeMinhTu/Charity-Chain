const jwt = require('jsonwebtoken'); // JWT để tạo/giải mã token
const User = require('../models/User'); // Model User
const { body, validationResult } = require('express-validator'); // Validator

// Tạo JWT với thời hạn 7 ngày
const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Đăng ký tài khoản mới
exports.register = [
    body('email').isEmail().normalizeEmail(), // Email hợp lệ và chuẩn hóa
    body('password').isLength({ min: 6 }),    // Mật khẩu tối thiểu 6 ký tự
    body('name').trim().isLength({ min: 1 }), // Tên không rỗng
    async (req, res) => {
        const errors = validationResult(req); // Kiểm tra lỗi
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name, walletAddress, role, avatar } = req.body; // Lấy dữ liệu
        const exists = await User.findOne({ email }); // Kiểm tra trùng email
        if (exists) return res.status(400).json({ message: 'Email already used' });

        const user = await User.create({ email, password, name, walletAddress, role, avatar }); // Tạo user mới
        const token = generateToken(user._id); // Tạo token đăng nhập
        res.status(201).json({
            token,
            user: { id: user._id, email, name, role, walletAddress, avatar } // Trả về thông tin cơ bản
        });
    }
];

// Đăng nhập
exports.login = [
    body('email').isEmail().normalizeEmail(), // Email hợp lệ
    body('password').exists(),                // Có mật khẩu
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email }); // Tìm user theo email
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' }); // Sai email/mật khẩu
        }
        const token = generateToken(user._id); // Tạo token
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
                walletAddress: user.walletAddress,
                avatar: user.avatar
            }
        });
    }
];

// Trả về thông tin user hiện tại (đã xác thực)
exports.me = async (req, res) => {
    res.json({ user: req.user });
};

const cloudinary = require('../config/cloudinary'); // SDK Cloudinary

// Cập nhật avatar của user (upload lên Cloudinary)
exports.updateAvatar = async (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream({ folder: 'avatars' }, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
            stream.end(req.file.buffer);
        });

        // req.user được set bởi auth middleware
        req.user.avatar = result.secure_url;
        await req.user.save();

        res.json({ user: req.user });
    } catch (err) {
        res.status(500).json({ message: 'Error uploading avatar', error: err.message });
    }
};

// Liên kết địa chỉ ví blockchain vào tài khoản
exports.linkWallet = async (req, res) => {
    try {
        const { walletAddress } = req.body;
        if (!walletAddress) return res.status(400).json({ message: 'Missing walletAddress' });
        req.user.walletAddress = walletAddress;
        await req.user.save();
        res.json({ user: req.user });
    } catch (err) {
        res.status(500).json({ message: 'Error linking wallet', error: err.message });
    }
};

// Bỏ liên kết ví blockchain
exports.unlinkWallet = async (req, res) => {
    try {
        req.user.walletAddress = null;
        await req.user.save();
        res.json({ user: req.user });
    } catch (err) {
        res.status(500).json({ message: 'Error unlinking wallet', error: err.message });
    }
};

// Cập nhật hồ sơ (name, email, password, walletAddress)
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, password, walletAddress } = req.body;

        // Nếu đổi email, kiểm tra không bị trùng
        if (email && email !== req.user.email) {
            const exists = await User.findOne({ email });
            if (exists) return res.status(400).json({ message: 'Email already used' });
            req.user.email = email;
        }

        if (name) req.user.name = name;
        if (typeof walletAddress !== 'undefined') req.user.walletAddress = walletAddress || null;
        if (password) {
            if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
            req.user.password = password; // sẽ được băm bởi pre-save hook
        }

        await req.user.save();
        // Trả về user đã loại bỏ password
        const user = await User.findById(req.user._id).select('-password');
        res.json({ user });
    } catch (err) {
        res.status(500).json({ message: 'Error updating profile', error: err.message });
    }
};