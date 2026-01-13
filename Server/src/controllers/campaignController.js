const Campaign = require('../models/Campaign');
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const { body, validationResult } = require('express-validator');

const upload = multer({ storage: multer.memoryStorage() });

exports.createCampaign = [
    upload.single('image'),
    body('title').trim().isLength({ min: 1 }),
    body('goalAmount').isNumeric().isFloat({ min: 0 }),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { title, description, goalAmount, chainId, startDate, endDate } = req.body;
            let imageUrl = null;

            if (req.file) {
                const result = await new Promise((resolve, reject) => {
                    const stream = cloudinary.uploader.upload_stream(
                        { folder: 'charity-campaigns' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result);
                        }
                    );
                    stream.end(req.file.buffer);
                });
                imageUrl = result.secure_url;
            }

            const campaignData = {
                title,
                description,
                imageUrl,
                goalAmount: parseFloat(goalAmount),
                chainId,
                owner: req.user._id
            };

            if (startDate) campaignData.startDate = new Date(startDate);
            if (endDate) campaignData.endDate = new Date(endDate);

            const campaign = await Campaign.create(campaignData);
            res.status(201).json(campaign);
        } catch (error) {
            res.status(500).json({ message: 'Error creating campaign', error: error.message });
        }
    }
];

exports.getCampaigns = async (req, res) => {
    const campaigns = await Campaign.find().populate('owner', 'name avatar');
    res.json(campaigns);
};

exports.getCampaignById = async (req, res) => {
    const campaign = await Campaign.findById(req.params.id).populate('owner', 'name avatar');
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
    res.json(campaign);
};

exports.updateCampaignStatus = async (req, res) => {
    const { status } = req.body;
    const campaign = await Campaign.findOneAndUpdate(
        { _id: req.params.id, owner: req.user._id },
        { status },
        { new: true }
    );
    if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found or not owner' });
    }
    res.json(campaign);
};