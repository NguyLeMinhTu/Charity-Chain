// Client/src/services/api/axiosClient.js - Cấu hình Axios cho các yêu cầu API.
import axios from 'axios';

// Tạo một instance Axios với URL cơ sở từ biến môi trường hoặc mặc định localhost:3000
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
});

axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosClient;