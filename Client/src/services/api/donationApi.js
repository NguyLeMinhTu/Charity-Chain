// Client/src/services/api/donationApi.js - Cấu hình dịch vụ API cho quản lý quyên góp.

import axiosClient from './axiosClient';

export const donationApi = {
    // API tạo mới một quyên góp
    createDonation: (data) => axiosClient.post('/donations', data),

    // API lấy danh sách quyên góp theo chiến dịch hoặc của người dùng hiện tại
    getDonationsByCampaign: (campaignId) => axiosClient.get(`/donations/campaign/${campaignId}`),

    // API lấy danh sách quyên góp của người dùng hiện tại
    getMyDonations: () => axiosClient.get('/donations/me'),
};