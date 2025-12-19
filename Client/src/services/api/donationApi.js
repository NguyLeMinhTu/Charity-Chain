import axiosClient from './axiosClient';

export const donationApi = {
    createDonation: (data) => axiosClient.post('/donations', data),
    getDonationsByCampaign: (campaignId) => axiosClient.get(`/donations/campaign/${campaignId}`),
    getMyDonations: () => axiosClient.get('/donations/me'),
};