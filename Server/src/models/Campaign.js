const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
    {
        // Tên chiến dịch
        title: { type: String, required: true },
        // Mô tả chiến dịch
        description: { type: String },
        // Ảnh đại diện chiến dịch
        imageUrl: { type: String },
        // Mục tiêu quyên góp
        goalAmount: { type: Number, required: true },
        // Số tiền đã quyên góp được
        raisedAmount: { type: Number, default: 0 },
        // Chủ sở hữu chiến dịch
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        // Trạng thái chiến dịch: 'fundraising' = Đang gây quỹ, 'stopped' = Ngừng gây quỹ, 'completed' = Đã hoàn thành
        status: { type: String, enum: ['fundraising', 'stopped', 'active', 'closed', 'completed'], default: 'fundraising' },
        // Approval workflow: 'pending' = chờ phê duyệt, 'approved' = hiển thị, 'rejected' = bị từ chối
        approvalStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'approved' },
        // Thông tin trên blockchain
        chainId: { type: Number },
        // Địa chỉ hợp đồng thông minh của chiến dịch
        contractAddress: { type: String },
        // ID của chiến dịch trên blockchain
        campaignIdOnChain: { type: String },
        // Optional campaign start and end dates
        startDate: { type: Date },
        endDate: { type: Date }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);