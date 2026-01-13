const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
    {
        // Chiến dịch nhận quyên góp
        campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
        // Người quyên góp
        donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        // Ví người quyên góp (nếu không có tài khoản)
        donorWallet: { type: String },
        // Số tiền quyên góp
        amount: { type: Number, required: true },
        // Mã giao dịch trên blockchain
        txHash: { type: String, required: true, unique: true },
        // Số khối chứa giao dịch
        blockNumber: { type: Number },
        // ID chuỗi blockchain
        chainId: { type: Number }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);