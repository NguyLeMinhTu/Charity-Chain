import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Copy } from 'lucide-react';

const MyDonations = () => {
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDonations = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get('http://localhost:5000/api/donations/me', {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setDonations(response.data || []);
            } catch (err) {
                const errorMsg = 'Không thể tải lịch sử quyên góp';
                setError(errorMsg);
                toast.error(errorMsg);
            } finally {
                setLoading(false);
            }
        };
        fetchDonations();
    }, []);

    const copyTx = async (tx) => {
        if (!tx) return;
        try {
            await navigator.clipboard.writeText(tx);
            toast.success('Đã sao chép txHash');
        } catch (err) {
            toast.error('Không thể sao chép');
        }
    };

    if (loading) return <div className="text-center py-8">Loading your donations...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6 text-center">Lịch sử Quyên góp</h1>

            {donations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Bạn chưa thực hiện lượt quyên góp nào.</div>
            ) : (
                <div className="max-w-5xl mx-auto space-y-3">
                    {donations.map((donation) => (
                        <div key={donation._id} className="bg-white p-4 rounded-lg shadow-sm border flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold leading-snug">{donation.campaign?.title || 'Chiến dịch không xác định'}</h3>
                                <div className="text-sm text-gray-500">{new Date(donation.createdAt).toLocaleString()}</div>

                                {donation.txHash && (
                                    <div className="text-sm text-gray-600 mt-2 flex items-center gap-2">
                                        <span className="font-medium">Transaction:</span>
                                        <span className="truncate max-w-xs">{donation.txHash.slice(0, 10)}...{donation.txHash.slice(-8)}</span>
                                    </div>
                                )}

                                {donation.donorWallet && (
                                    <div className="text-sm text-gray-600 mt-1">
                                        <span className="font-medium">Ví:</span> {donation.donorWallet.slice(0, 6)}...{donation.donorWallet.slice(-4)}
                                    </div>
                                )}
                            </div>

                            <div className="w-full md:w-auto flex items-center gap-3">
                                <div className="text-2xl font-bold text-green-600">{donation.amount} T7</div>
                                <div className="flex gap-2">
                                    {donation.txHash && (
                                        <button onClick={() => copyTx(donation.txHash)} className="inline-flex items-center gap-2 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-xs">
                                            <Copy className="w-4 h-4" /> Sao chép
                                        </button>
                                    )}
                                    <button className="px-2 py-1 bg-primary text-white rounded-md text-xs">Chi tiết</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyDonations;
