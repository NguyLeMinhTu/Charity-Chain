import axiosClient from './axiosClient';

export const authApi = {
    register: (data) => axiosClient.post('/auth/register', data),
    login: (data) => axiosClient.post('/auth/login', data),
    me: () => axiosClient.get('/auth/me'),
    uploadAvatar: (file) => {
        const form = new FormData();
        form.append('avatar', file);
        return axiosClient.post('/auth/avatar', form, { headers: { 'Content-Type': 'multipart/form-data' } });
    }
    ,
    linkWallet: (walletAddress) => axiosClient.post('/auth/link-wallet', { walletAddress })
};