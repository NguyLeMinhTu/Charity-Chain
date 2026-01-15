import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { campaignApi } from '../services/api/campaignApi';
import CampaignCard from '../components/CampaignCard';
import toast from 'react-hot-toast';

const MyCampaigns = () => {
    const { user } = useContext(AuthContext);
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await campaignApi.getCampaigns();
                const all = res.data;
                if (!user) {
                    setCampaigns([]);
                    return;
                }
                const mine = all.filter((c) => {
                    const ownerId = c.owner?._id || c.owner;
                    return String(ownerId) === String(user.id || user._id);
                });
                setCampaigns(mine);
            } catch (err) {
                toast.error('Không thể tải danh sách chiến dịch của bạn');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [user]);

    if (loading) return <div className="text-center py-8">Loading...</div>;

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-semibold">Chiến dịch của bạn</h1>
                <Link to="/campaigns/create" className="px-4 py-2 bg-primary text-white rounded">Tạo chiến dịch mới</Link>
            </div>

            {campaigns.length === 0 ? (
                <div className="text-center py-16 text-gray-500">Bạn chưa có chiến dịch nào. Hãy tạo ngay.</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {campaigns.map((c) => (
                        <CampaignCard key={c._id} campaign={c} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyCampaigns;
