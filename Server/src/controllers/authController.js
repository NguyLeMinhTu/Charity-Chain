const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { body, validationResult } = require('express-validator');

const generateToken = (userId) =>
    jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').trim().isLength({ min: 1 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, name, walletAddress, role, avatar } = req.body;
        const exists = await User.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already used' });

        const user = await User.create({ email, password, name, walletAddress, role, avatar });
        const token = generateToken(user._id);
        res.status(201).json({
            token,
            user: { id: user._id, email, name, role, walletAddress, avatar }
        });
    }
];
exports.login = [
    body('email').isEmail().normalizeEmail(),
    body('password').exists(),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user || !(await user.comparePassword(password))) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id);
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

exports.me = async (req, res) => {
    res.json({ user: req.user });
};

const cloudinary = require('../config/cloudinary');

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

        // req.user is set by auth middleware
        req.user.avatar = result.secure_url;
        await req.user.save();

        res.json({ user: req.user });
    } catch (err) {
        res.status(500).json({ message: 'Error uploading avatar', error: err.message });
    }
};

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