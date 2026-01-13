const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaignStatus
} = require('../controllers/campaignController');

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', auth, ...createCampaign);
router.patch('/:id/status', auth, updateCampaignStatus);

module.exports = router;