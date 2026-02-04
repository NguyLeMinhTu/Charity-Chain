const Campaign = require('../models/Campaign'); // Model Campaign (MongoDB)
const cloudinary = require('../config/cloudinary'); // SDK Cloudinary đã cấu hình
const multer = require('multer'); // Middleware upload file
const { body, validationResult } = require('express-validator'); // Validator cho request

const upload = multer({ storage: multer.memoryStorage() }); // Lưu file upload vào bộ nhớ

exports.createCampaign = [
    upload.single('image'), // Nhận một file ảnh từ field 'image'
    body('title').trim().isLength({ min: 1 }), // Bắt buộc có tiêu đề
    body('goalAmount').isNumeric().isFloat({ min: 0 }), // Mục tiêu là số, không âm
    async (req, res) => {
        const errors = validationResult(req); // Thu thập lỗi từ validator
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const { title, description, goalAmount, chainId, startDate, endDate } = req.body; // Lấy dữ liệu từ body
            let imageUrl = null; // URL ảnh sau khi upload

            if (req.file) {
                // Upload ảnh lên Cloudinary bằng stream
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
                imageUrl = result.secure_url; // Lưu URL ảnh an toàn (https)
            }

            const campaignData = {
                title,
                description,
                imageUrl,
                goalAmount: parseFloat(goalAmount), // Chuẩn hóa goalAmount về số thực
                chainId,
                owner: req.user._id // Chủ sở hữu là người gọi API
            };

            // If the creator is an org (not admin), set approvalStatus to 'pending'
            if (req.user && req.user.role === 'org') {
                campaignData.approvalStatus = 'pending';
            } else {
                // keep default approved for admin-created campaigns for backwards compatibility
                campaignData.approvalStatus = 'approved';
            }

            if (startDate) campaignData.startDate = new Date(startDate); // Ngày bắt đầu (tùy chọn)
            if (endDate) campaignData.endDate = new Date(endDate);       // Ngày kết thúc (tùy chọn)

            const campaign = await Campaign.create(campaignData);
            res.status(201).json(campaign); // Trả về campaign vừa tạo
        } catch (error) {
            res.status(500).json({ message: 'Error creating campaign', error: error.message });
        }
    }
];

const jwt = require('jsonwebtoken'); // Dùng để xác thực token admin trong danh sách
const User = require('../models/User'); // Model User để kiểm tra role

exports.getCampaigns = async (req, res) => {
    try {
        // If request contains a valid admin token, return all campaigns (including pending)
        const header = req.headers.authorization; // Lấy token từ header
        let isAdmin = false; // Cờ xác định có phải admin
        if (header && header.startsWith('Bearer ')) {
            try {
                const token = header.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const user = await User.findById(decoded.id).select('role');
                if (user && user.role === 'admin') isAdmin = true;
            } catch (e) {
                // ignore invalid token
            }
        }

        let query = {}; // Mặc định: lấy tất cả (admin)
        if (!isAdmin) {
            // Include campaigns explicitly approved OR documents created before the approvalStatus
            // field existed (no approvalStatus field). This keeps backwards compatibility.
            query = {
                $or: [
                    { approvalStatus: 'approved' },
                    { approvalStatus: { $exists: false } }
                ]
            };
        }

        const ownerFields = isAdmin ? 'name avatar walletAddress' : 'name avatar'; // Admin thấy thêm ví
        let campaigns = await Campaign.find(query).populate('owner', ownerFields); // Lấy danh sách và populate owner

        // Enforce status based on endDate and raisedAmount (ensure DB reflects closed/completed states)
        const now = new Date(); // Thời điểm hiện tại
        const updates = []; // Các cập nhật trạng thái cần thực hiện
        for (const c of campaigns) {
            try {
                const goal = Number(c.goalAmount || 0);
                const raised = Number(c.raisedAmount || 0);
                let newStatus = c.status;
                if (c.endDate && c.endDate < now && !['closed', 'stopped'].includes((c.status || '').toLowerCase())) {
                    newStatus = 'closed';
                }
                if (goal > 0 && raised >= goal && (c.status || '').toLowerCase() !== 'completed') {
                    newStatus = 'completed';
                }
                if (newStatus !== c.status) {
                    updates.push(Campaign.findByIdAndUpdate(c._id, { status: newStatus }));
                }
            } catch (e) {
                console.error('Failed to evaluate campaign status for', c._id, e);
            }
        }
        if (updates.length) await Promise.all(updates);

        // re-query so returned docs reflect any status changes
        campaigns = await Campaign.find(query).populate('owner', ownerFields); // Lấy lại dữ liệu sau khi cập nhật
        res.json(campaigns); // Trả về danh sách chiến dịch
    } catch (err) {
        res.status(500).json({ message: 'Error fetching campaigns', error: err.message });
    }
};

exports.getCampaignById = async (req, res) => {
    let campaign = await Campaign.findById(req.params.id).populate('owner', 'name avatar walletAddress'); // Tìm theo id
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    // enforce status based on endDate and raisedAmount
    try {
        const now = new Date();
        const goal = Number(campaign.goalAmount || 0);
        const raised = Number(campaign.raisedAmount || 0);
        let newStatus = campaign.status;
        if (campaign.endDate && campaign.endDate < now && !['closed', 'stopped'].includes((campaign.status || '').toLowerCase())) {
            newStatus = 'closed';
        }
        if (goal > 0 && raised >= goal && (campaign.status || '').toLowerCase() !== 'completed') {
            newStatus = 'completed';
        }
        if (newStatus !== campaign.status) {
            campaign.status = newStatus;
            await campaign.save();
            // re-populate owner after save
            campaign = await Campaign.findById(req.params.id).populate('owner', 'name avatar walletAddress'); // Lấy lại sau khi save
        }
    } catch (e) {
        console.error('Failed to enforce campaign status for', req.params.id, e);
    }

    res.json(campaign); // Trả về chiến dịch
};

exports.updateCampaignStatus = async (req, res) => {
    const { status } = req.body; // Trạng thái cần cập nhật
    const campaign = await Campaign.findOneAndUpdate(
        { _id: req.params.id, owner: req.user._id },
        { status },
        { new: true }
    );
    if (!campaign) {
        return res.status(404).json({ message: 'Campaign not found or not owner' });
    }
    res.json(campaign); // Trả về bản ghi đã cập nhật
};

// Admin endpoint to set approvalStatus
exports.setApprovalStatus = async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Forbidden' });
        }
        const { approvalStatus } = req.body;
        if (!['pending', 'approved', 'rejected'].includes(approvalStatus)) {
            return res.status(400).json({ message: 'Invalid approvalStatus' });
        }
        const campaign = await Campaign.findByIdAndUpdate(
            req.params.id,
            { approvalStatus },
            { new: true }
        ).populate('owner', 'name avatar');
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        res.json(campaign); // Trả về campaign với approvalStatus mới
    } catch (err) {
        res.status(500).json({ message: 'Error updating approval status', error: err.message });
    }
};

// Update campaign (owner or admin)
exports.updateCampaign = [
    upload.single('image'), // Cho phép cập nhật ảnh đại diện chiến dịch
    body('title').optional().trim().isLength({ min: 1 }), // Tiêu đề (tùy chọn)
    body('goalAmount').optional().isNumeric().isFloat({ min: 0 }), // Mục tiêu (tùy chọn)
    async (req, res) => {
        try {
            console.debug('[updateCampaign] params.id=', req.params.id, 'user=', req.user && req.user._id);
            const campaign = await Campaign.findById(req.params.id);
            console.debug('[updateCampaign] found campaign=', campaign ? campaign._id : null);
            if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

            // Allow if admin or owner
            if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
            const isAdmin = req.user.role === 'admin';
            const ownerId = campaign.owner && (campaign.owner._id ? campaign.owner._id.toString() : campaign.owner.toString());
            const isOwner = ownerId && ownerId === req.user._id.toString();
            if (!isAdmin && !isOwner) {
                return res.status(403).json({ message: 'Forbidden' });
            }

            const { title, description, goalAmount, chainId, startDate, endDate, status } = req.body;
            if (title) campaign.title = title;
            if (description) campaign.description = description;
            if (goalAmount) campaign.goalAmount = parseFloat(goalAmount);
            if (chainId) campaign.chainId = chainId;
            if (status) campaign.status = status;
            if (startDate) campaign.startDate = new Date(startDate);
            if (endDate) campaign.endDate = new Date(endDate);

            if (req.file) {
                // upload new image
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
                campaign.imageUrl = result.secure_url;
            }

            const updated = await campaign.save();
            res.json(updated); // Trả về campaign sau khi cập nhật
        } catch (err) {
            res.status(500).json({ message: 'Error updating campaign', error: err.message });
        }
    }
];

// Delete campaign (owner or admin)
exports.deleteCampaign = async (req, res) => {
    try {
        console.debug('[deleteCampaign] params.id=', req.params.id, 'user=', req.user && req.user._id);
        const campaign = await Campaign.findById(req.params.id);
        console.debug('[deleteCampaign] campaign=', campaign ? { id: campaign._id, owner: campaign.owner } : null);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
        const isAdmin = req.user.role === 'admin';
        const ownerId = campaign.owner && (campaign.owner._id ? campaign.owner._id.toString() : campaign.owner.toString());
        const isOwner = ownerId && ownerId === req.user._id.toString();
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        await Campaign.findByIdAndDelete(req.params.id);
        console.debug('[deleteCampaign] deleted campaign id=', req.params.id);
        res.json({ message: 'Campaign deleted' }); // Xác nhận đã xóa
    } catch (err) {
        console.error('[deleteCampaign] error', err);
        res.status(500).json({ message: 'Error deleting campaign', error: err.message });
    }
};