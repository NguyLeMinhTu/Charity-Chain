// Client/src/services/api/campaignApi.js - Cấu dịch vụ API cho quản lý chiến dịch.

import axiosClient from './axiosClient';

export const campaignApi = {
    // API lấy danh sách chiến dịch
    getCampaigns: () => axiosClient.get('/campaigns'),

    // API lấy chi tiết một chiến dịch theo ID
    getCampaignById: (id) => axiosClient.get(`/campaigns/${id}`),

    // API tạo mới một chiến dịch
    createCampaign: (data) => axiosClient.post('/campaigns', data),

    // API cập nhật trạng thái chiến dịch
    updateCampaignStatus: (id, data) => axiosClient.patch(`/campaigns/${id}/status`, data),

    // API cập nhật chiến dịch
    updateCampaign: (id, data) => axiosClient.put(`/campaigns/${id}`, data),

    // API xoá chiến dịch
    deleteCampaign: (id) => axiosClient.delete(`/campaigns/${id}`),
};