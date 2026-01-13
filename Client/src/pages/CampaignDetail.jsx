import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const CampaignDetail = () => {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const [campaignRes, donationsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/campaigns/${id}`),
                    axios.get(`http://localhost:5000/api/donations/campaign/${id}`)
                ]);
                setCampaign(campaignRes.data);
                setDonations(donationsRes.data);
            } catch (err) {
                const errorMsg = 'Không thể tải chi tiết chiến dịch';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchCampaign();
    }, [id]);

    if (loading) return <div className="text-center py-8">Loading campaign...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;
    if (!campaign) return <div className="text-center py-8">Campaign not found</div>;

    const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <div>
                        {campaign.imageUrl ? (
                            <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-96 object-cover rounded-lg shadow-md" />
                        ) : (
                            <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">No Image</div>
                        )}
                    </div>

                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-4">{campaign.title}</h1>
                        <p className="text-gray-600 mb-6 text-base md:text-lg">{campaign.description}</p>

                        <div className="bg-gray-50 p-6 rounded-lg shadow-sm mb-6">
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-2xl font-bold text-green-600">{totalDonated} ETH</div>
                                    <div className="text-sm text-gray-500">Đã quyên góp</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{campaign.goalAmount} ETH</div>
                                    <div className="text-sm text-gray-500">Mục tiêu</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-purple-600">{donations.length}</div>
                                    <div className="text-sm text-gray-500">Lượt quyên góp</div>
                                </div>
                            </div>

                            <div className="mt-4">
                                <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className="bg-green-500 h-3 rounded-full"
                                        style={{ width: `${Math.min(((totalDonated / (Number(campaign.goalAmount) || 1)) * 100) || 0, 100)}%` }}
                                    />
                                </div>
                                <div className="text-sm text-gray-600 mt-2">
                                    {(((totalDonated / (Number(campaign.goalAmount) || 1)) * 100) || 0).toFixed(1)}% hoàn thành
                                </div>
                            </div>

                            <div className="mt-6">
                                <button className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors">
                                    Quyên góp ngay
                                </button>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold mb-3">Người tạo</h2>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">{(campaign.owner?.name || 'U').charAt(0)}</div>
                                <div>
                                    <div className="font-medium">{campaign.owner?.name || 'Unknown'}</div>
                                    <div className="text-sm text-gray-500">{campaign.owner?.email || ''}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-4">Lịch sử quyên góp</h2>
                    {donations.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">Chưa có lượt quyên góp nào.</div>
                    ) : (
                        <div className="space-y-4">
                            {donations.map((donation) => (
                                <div key={donation._id} className="bg-white p-4 rounded-lg shadow border">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold">
                                                {donation.donor?.name || `Ví: ${donation.donorWallet?.slice(0, 6)}...${donation.donorWallet?.slice(-4)}`}
                                            </div>
                                            <div className="text-sm text-gray-500">{new Date(donation.createdAt).toLocaleString()}</div>
                                        </div>
                                        <div className="text-lg font-bold text-green-600">{donation.amount} ETH</div>
                                    </div>
                                    {donation.txHash && (
                                        <div className="text-sm text-gray-500 mt-2">Tx: {donation.txHash.slice(0, 10)}...{donation.txHash.slice(-8)}</div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CampaignDetail
