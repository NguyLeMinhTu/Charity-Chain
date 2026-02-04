const router = require('express').Router(); // Khởi tạo router Express
const multer = require('multer');           // Middleware xử lý upload
const upload = multer({ storage: multer.memoryStorage() }); // Lưu file tạm trên bộ nhớ
const { register, login, me, updateAvatar, linkWallet, unlinkWallet, updateProfile } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware'); // Middleware xác thực JWT

// Đăng ký tài khoản: mảng middleware validator + handler
router.post('/register', ...register);
// Đăng nhập: mảng middleware validator + handler
router.post('/login', ...login);
// Lấy thông tin người dùng hiện tại (cần xác thực)
router.get('/me', auth, me);
// Upload avatar (đã xác thực)
router.post('/avatar', auth, upload.single('avatar'), updateAvatar);
// Liên kết ví blockchain vào tài khoản
router.post('/link-wallet', auth, linkWallet);
// Hủy liên kết ví blockchain
router.post('/unlink-wallet', auth, unlinkWallet);
// Cập nhật hồ sơ (tên, email, mật khẩu, ví)
router.put('/profile', auth, updateProfile);

module.exports = router; // Xuất router