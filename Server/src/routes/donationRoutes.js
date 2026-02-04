const router = require('express').Router(); // Khởi tạo router cho module quyên góp
const auth = require('../middlewares/authMiddleware'); // Middleware xác thực JWT
const {
    createDonationRecord,
    getDonationsByCampaign,
    getDonationsByUser
} = require('../controllers/donationController'); // Import các handler

// Tạo bản ghi quyên góp (cần xác thực)
router.post('/', auth, createDonationRecord);
// Lấy danh sách quyên góp theo campaignId
router.get('/campaign/:campaignId', getDonationsByCampaign);
// Lấy các quyên góp của chính người dùng (cần xác thực)
router.get('/me', auth, getDonationsByUser);

module.exports = router; // Xuất router