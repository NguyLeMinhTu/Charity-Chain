const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

exports.createDonationRecord = async (req, res) => {
    try {
        // accept either campaignId or campaign (client may send either)
        const body = req.body || {};
        const campaignId = body.campaignId || body.campaign;
        const { amount, txHash, blockNumber, chainId, donorWallet, tokenAddress, tokenSymbol } = body;

        if (!campaignId) return res.status(400).json({ message: 'Missing campaign id' });

        const campaign = await Campaign.findById(campaignId);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

        // Server-side guards: reject donations to campaigns that have ended or already met their goal
        const now = new Date();
        if (campaign.endDate && campaign.endDate < now) {
            return res.status(400).json({ message: 'Campaign has ended and is closed' });
        }
        const goal = Number(campaign.goalAmount) || 0;
        const raised = Number(campaign.raisedAmount) || 0;
        if (goal > 0 && raised >= goal) {
            return res.status(400).json({ message: 'Campaign has already reached its funding goal' });
        }

        const donation = await Donation.create({
            campaign: campaignId,
            donor: req.user ? req.user._id : undefined,
            donorWallet: donorWallet || req.user?.walletAddress,
            amount,
            txHash,
            blockNumber,
            chainId,
            tokenAddress,
            tokenSymbol
        });

        // increment campaign.raisedAmount if amount is numeric and update status if goal reached
        const inc = Number(amount || 0);
        if (!Number.isNaN(inc) && inc !== 0) {
            try {
                // increment and return updated campaign doc
                const updated = await Campaign.findByIdAndUpdate(campaignId, { $inc: { raisedAmount: inc } }, { new: true });
                // if goal reached or exceeded, mark as completed
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

exports.getDonationsByCampaign = async (req, res) => {
    const donations = await Donation.find({ campaign: req.params.campaignId })
        .sort({ createdAt: -1 })
        .populate('donor', 'name');
    res.json(donations);
};

exports.getDonationsByUser = async (req, res) => {
    const donations = await Donation.find({ donor: req.user._id })
        .sort({ createdAt: -1 })
        .populate('campaign', 'title');
    res.json(donations);
};