// Client/src/services/api/authApi.js - Dịch vụ API cho xác thực người dùng.

import axiosClient from './axiosClient';

export const authApi = {
    register: (data) => axiosClient.post('/auth/register', data), // Đăng ký tổ chức mới
    login: (data) => axiosClient.post('/auth/login', data), // Đăng nhập người dùng
    me: () => axiosClient.get('/auth/me'), // Lấy thông tin người dùng hiện tại

    // Câp nhật hồ sơ cá nhân
    uploadAvatar: (file) => {
        const form = new FormData();
        form.append('avatar', file);
        return axiosClient.post('/auth/avatar', form, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    // Liên kết và hủy liên kết ví Web3 (Metamask)
    linkWallet: (walletAddress) => axiosClient.post('/auth/link-wallet', { walletAddress }),

    // Hủy liên kết ví Web3 (Metamask)
    unlinkWallet: () => axiosClient.post('/auth/unlink-wallet'),

    // Cập nhật thông tin hồ sơ người dùng (có thể bao gồm tên, email, mật khẩu)
    updateProfile: (data) => axiosClient.put('/auth/profile', data)
};