const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        // Địa chỉ email người dùng
        email: { type: String, required: true, unique: true },
        // Mật khẩu người dùng (đã được băm)
        password: { type: String, required: true },
        // Tên hiển thị của người dùng
        name: { type: String, required: true },
        // Địa chỉ ví blockchain của người dùng
        walletAddress: { type: String },
        // URL to user's avatar image
        avatar: { type: String },
        // donor - Người quyên góp
        // org - Tổ chức tạo chiến dịch
        // admin - Quản trị viên hệ thống
        role: { type: String, enum: ['donor', 'org', 'admin'], default: 'donor' }
    },
    { timestamps: true }
);

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plain) {
    return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);