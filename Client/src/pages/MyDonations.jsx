import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

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
                setDonations(response.data);
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

    if (loading) return <div className="text-center py-8">Loading your donations...</div>;
    if (error) return <div className="text-center py-8 text-red-500">{error}</div>;

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Lịch sử Quyên góp của Tôi</h1>

            {donations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    Bạn chưa thực hiện lượt quyên góp nào.
                </div>
            ) : (
                <div className="max-w-4xl mx-auto space-y-4">
                    {donations.map((donation) => (
                        <div key={donation._id} className="bg-white p-6 rounded-lg shadow-md border">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold mb-1">
                                        {donation.campaign?.title || 'Chiến dịch không xác định'}
                                    </h3>
                                    <p className="text-sm text-gray-500">
                                        {new Date(donation.createdAt).toLocaleString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-green-600">
                                        {donation.amount} ETH
                                    </div>
                                </div>
                            </div>

                            {donation.txHash && (
                                <div className="text-sm text-gray-600">
                                    <span className="font-medium">Transaction:</span> {donation.txHash.slice(0, 10)}...{donation.txHash.slice(-8)}
                                </div>
                            )}

                            {donation.donorWallet && (
                                <div className="text-sm text-gray-600 mt-1">
                                    <span className="font-medium">Ví:</span> {donation.donorWallet.slice(0, 6)}...{donation.donorWallet.slice(-4)}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyDonations
