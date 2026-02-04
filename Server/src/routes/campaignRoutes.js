const router = require('express').Router(); // Router Express
const auth = require('../middlewares/authMiddleware'); // Middleware xác thực
const {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaignStatus,
    updateCampaign,
    deleteCampaign,
    setApprovalStatus
} = require('../controllers/campaignController');

// Lấy danh sách chiến dịch (ẩn pending với user thường)
router.get('/', getCampaigns);
// Lấy chi tiết một chiến dịch theo id
router.get('/:id', getCampaignById);
// Tạo chiến dịch (cần xác thực), gồm validator + handler
router.post('/', auth, ...createCampaign);
// Cập nhật trạng thái chiến dịch (chủ sở hữu)
router.patch('/:id/status', auth, updateCampaignStatus);
// Admin cập nhật trạng thái phê duyệt
router.patch('/:id/approval', auth, setApprovalStatus);
// Cập nhật thông tin chiến dịch (chủ sở hữu hoặc admin)
router.put('/:id', auth, ...updateCampaign);
// Xóa chiến dịch (chủ sở hữu hoặc admin)
router.delete('/:id', auth, deleteCampaign);

module.exports = router; // Xuất router