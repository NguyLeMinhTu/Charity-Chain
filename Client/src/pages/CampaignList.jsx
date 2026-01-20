import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CampaignCard from '../components/CampaignCard';
import axios from 'axios';
import toast from 'react-hot-toast';

const CampaignList = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [filter, setFilter] = useState('all'); // all | active | closed | completed
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/campaigns');
                setCampaigns(response.data);
            } catch (err) {
                const errorMsg = 'Không thể tải danh sách chiến dịch';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaigns();
    }, []);

    if (loading) return <div className="text-center py-8">Loading campaigns...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    const isActive = (status) => ['fundraising', 'active'].includes(status);
    const isClosed = (status) => ['stopped', 'closed'].includes(status);
    const isCompleted = (status) => status === 'completed';

    const filtered = campaigns.filter((c) => {
        if (filter === 'all') return true;
        if (filter === 'active') return isActive(c.status);
        if (filter === 'closed') return isClosed(c.status);
        if (filter === 'completed') return isCompleted(c.status);
        return true;
    });

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Chiến dịch Quyên góp</h1>
            <div className="flex items-center justify-center gap-3 mb-6">
                <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-full transition ${filter === 'all' ? 'bg-primary text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Tất cả</button>
                <button onClick={() => setFilter('active')} className={`px-4 py-2 rounded-full transition ${filter === 'active' ? 'bg-green-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Đang hoạt động</button>
                <button onClick={() => setFilter('closed')} className={`px-4 py-2 rounded-full transition ${filter === 'closed' ? 'bg-red-600 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Đã đóng</button>
                <button onClick={() => setFilter('completed')} className={`px-4 py-2 rounded-full transition ${filter === 'completed' ? 'bg-amber-500 text-white shadow' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>Hoàn thành</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((campaign) => (
                    <CampaignCard key={campaign._id} campaign={campaign} />
                ))}
            </div>
            {campaigns.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    Chưa có chiến dịch nào.
                </div>
            )}
        </div>
    );
};

export default CampaignList
