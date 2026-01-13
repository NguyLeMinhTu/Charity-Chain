const router = require('express').Router();
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });
const { register, login, me, updateAvatar, linkWallet } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

router.post('/register', ...register);
router.post('/login', ...login);
router.get('/me', auth, me);
// Upload avatar (authenticated)
router.post('/avatar', auth, upload.single('avatar'), updateAvatar);
router.post('/link-wallet', auth, linkWallet);

module.exports = router;