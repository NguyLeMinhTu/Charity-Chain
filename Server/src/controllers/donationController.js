const Donation = require('../models/Donation'); // Model Donation
const Campaign = require('../models/Campaign'); // Model Campaign

// Tạo bản ghi quyên góp từ dữ liệu giao dịch on-chain/off-chain
exports.createDonationRecord = async (req, res) => {
    try {
        // Chấp nhận campaignId hoặc campaign (client có thể gửi một trong hai)
        const body = req.body || {};
        const campaignId = body.campaignId || body.campaign;
        const { amount, txHash, blockNumber, chainId, donorWallet, tokenAddress, tokenSymbol } = body;

        if (!campaignId) return res.status(400).json({ message: 'Missing campaign id' });

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        // Ràng buộc phía server: từ chối quyên góp nếu chiến dịch đã kết thúc hoặc đạt mục tiêu
        const now = new Date();
        if (campaign.endDate && campaign.endDate < now) {
            return res.status(400).json({ message: 'Campaign has ended and is closed' });
        }
        const goal = Number(campaign.goalAmount) || 0;
        const raised = Number(campaign.raisedAmount) || 0;
        if (goal > 0 && raised >= goal) {
            return res.status(400).json({ message: 'Campaign has already reached its funding goal' });
        }

        // Tạo bản ghi quyên góp
        const donation = await Donation.create({
            campaign: campaignId,
            donor: req.user ? req.user._id : undefined, // nếu đã đăng nhập, gán người quyên góp
            donorWallet: donorWallet || req.user?.walletAddress, // fallback sang ví của user
            amount,
            txHash,
            blockNumber,
            chainId,
            tokenAddress,
            tokenSymbol
        });

        // Tăng raisedAmount của campaign nếu amount là số, và cập nhật trạng thái nếu đạt mục tiêu
        const inc = Number(amount || 0);
        if (!Number.isNaN(inc) && inc !== 0) {
            try {
                // Tăng raisedAmount và trả về bản ghi campaign cập nhật
                const updated = await Campaign.findByIdAndUpdate(campaignId, { $inc: { raisedAmount: inc } }, { new: true });
                // Nếu đạt hoặc vượt mục tiêu, đánh dấu completed
                const updatedRaised = Number(updated.raisedAmount || 0);
                const goalNum = Number(updated.goalAmount || 0);
                if (goalNum > 0 && updatedRaised >= goalNum && updated.status !== 'completed') {
                    try {
                        await Campaign.findByIdAndUpdate(campaignId, { status: 'completed' });
                    } catch (e) {
                        console.error('Failed to mark campaign completed', e);
                    }
                }
            } catch (e) {
                console.error('Failed to increment campaign.raisedAmount', e);
            }
        }

        res.status(201).json(donation);
    } catch (err) {
        console.error('createDonationRecord error', err);
        res.status(500).json({ message: 'Error creating donation', error: err.message });
    }
};

// Lấy danh sách quyên góp theo campaignId (mới nhất trước)
exports.getDonationsByCampaign = async (req, res) => {
    const donations = await Donation.find({ campaign: req.params.campaignId })
        .sort({ createdAt: -1 })
        .populate('donor', 'name'); // Đính kèm tên người quyên góp
    res.json(donations);
};

// Lấy các quyên góp của người dùng hiện tại
exports.getDonationsByUser = async (req, res) => {
    const donations = await Donation.find({ donor: req.user._id })
        .sort({ createdAt: -1 })
        .populate('campaign', 'title'); // Đính kèm tiêu đề chiến dịch
    res.json(donations);
};