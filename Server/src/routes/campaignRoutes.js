const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaignStatus,
    updateCampaign,
    deleteCampaign,
    setApprovalStatus
} = require('../controllers/campaignController');

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', auth, ...createCampaign);
router.patch('/:id/status', auth, updateCampaignStatus);
router.patch('/:id/approval', auth, setApprovalStatus);
router.put('/:id', auth, ...updateCampaign);
router.delete('/:id', auth, deleteCampaign);

module.exports = router;