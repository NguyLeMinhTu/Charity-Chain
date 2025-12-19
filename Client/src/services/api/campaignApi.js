import axiosClient from './axiosClient';

export const campaignApi = {
    getCampaigns: () => axiosClient.get('/campaigns'),
    getCampaignById: (id) => axiosClient.get(`/campaigns/${id}`),
    createCampaign: (data) => axiosClient.post('/campaigns', data),
    updateCampaignStatus: (id, data) => axiosClient.patch(`/campaigns/${id}/status`, data),
};