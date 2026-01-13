const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

exports.createDonationRecord = async (req, res) => {
    const { campaignId, amount, txHash, blockNumber, chainId, donorWallet } = req.body;

    const campaign = await Campaign.findById(campaignId);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

    const donation = await Donation.create({
        campaign: campaignId,
        donor: req.user ? req.user._id : undefined,
        donorWallet: donorWallet || req.user?.walletAddress,
        amount,
        txHash,
        blockNumber,
        chainId
    });

    res.status(201).json(donation);
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