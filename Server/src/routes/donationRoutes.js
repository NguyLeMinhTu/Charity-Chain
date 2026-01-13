const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const {
    createDonationRecord,
    getDonationsByCampaign,
    getDonationsByUser
} = require('../controllers/donationController');

router.post('/', auth, createDonationRecord);
router.get('/campaign/:campaignId', getDonationsByCampaign);
router.get('/me', auth, getDonationsByUser);

module.exports = router;