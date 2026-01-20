import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { AuthContext } from '../context/AuthContext';
import { campaignApi } from '../services/api/campaignApi';
import { useNavigate } from 'react-router-dom';
import { useWeb3Context } from '../context/Web3Context';
import { getT7Contract } from '../services/web3/t7Token';
import { donationApi } from '../services/api/donationApi';
import { ethers } from 'ethers';
import Team7Json from '../../Team7.json';

const CampaignDetail = () => {
    const { id } = useParams();
    const [campaign, setCampaign] = useState(null);
    const [donations, setDonations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({});
    const [imageFile, setImageFile] = useState(null);
    const { user } = useContext(AuthContext);
    const { account, signer, connect } = useWeb3Context();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchCampaign = async () => {
            try {
                const [campaignRes, donationsRes] = await Promise.all([
                    axios.get(`http://localhost:5000/api/campaigns/${id}`),
                    axios.get(`http://localhost:5000/api/donations/campaign/${id}`)
                ]);
                setCampaign(campaignRes.data);
                setFormData({
                    title: campaignRes.data.title || '',
                    description: campaignRes.data.description || '',
                    goalAmount: campaignRes.data.goalAmount || '',
                    chainId: campaignRes.data.chainId || '',
                    startDate: campaignRes.data.startDate ? new Date(campaignRes.data.startDate).toISOString().slice(0, 16) : '',
                    endDate: campaignRes.data.endDate ? new Date(campaignRes.data.endDate).toISOString().slice(0, 16) : ''
                });
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

    const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const now = new Date();
    const campaignEnd = campaign.endDate ? new Date(campaign.endDate) : null;
    const isEnded = campaignEnd ? campaignEnd < now : false;
    const goalAmountNum = Number(campaign.goalAmount) || 0;
    const isGoalMet = goalAmountNum > 0 ? totalDonated >= goalAmountNum : false;

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
                                    <div className="text-2xl font-bold text-green-600">{totalDonated} T7</div>
                                    <div className="text-sm text-gray-500">Đã quyên góp</div>
                                </div>
                                <div>
                                    <div className="text-2xl font-bold text-blue-600">{campaign.goalAmount} T7</div>
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
                                <button disabled={isEnded || isGoalMet} onClick={async () => {
                                    if (isEnded) {
                                        toast.error('Chiến dịch đã kết thúc, không thể quyên góp.');
                                        return;
                                    }
                                    if (isGoalMet) {
                                        toast.error('Chiến dịch đã đạt mục tiêu, không thể quyên góp thêm.');
                                        return;
                                    }
                                    try {
                                        const amt = window.prompt('Nhập số lượng T7 muốn quyên góp');
                                        if (!amt) return;
                                        const num = Number(amt);
                                        if (Number.isNaN(num) || num <= 0) {
                                            toast.error('Số tiền không hợp lệ');
                                            return;
                                        }

                                        // ensure wallet connected
                                        let s = signer;
                                        if (!s || !account) {
                                            await connect();
                                            // after connect, try to read signer from context (rehydration may be async)
                                            // simplest: get signer from window provider
                                            const provider = new ethers.BrowserProvider(window.ethereum);
                                            s = await provider.getSigner();
                                        }

                                        const ownerWallet = campaign.owner?.walletAddress;
                                        if (!ownerWallet) {
                                            toast.error('Người nhận chưa liên kết ví');
                                            return;
                                        }

                                        const t7 = getT7Contract(s);
                                        let decimals = 18;
                                        try { decimals = await t7.decimals(); } catch (e) { /* default */ }
                                        const value = ethers.parseUnits(num.toString(), decimals);

                                        toast.loading('Đang gửi giao dịch MetaMask...');
                                        const tx = await t7.transfer(ownerWallet, value);
                                        const receipt = await tx.wait();
                                        toast.dismiss();
                                        toast.success('Giao dịch gửi thành công');

                                        // record donation in backend (requires auth)
                                        try {
                                            await donationApi.createDonation({
                                                campaign: campaign._id,
                                                amount: num,
                                                donorWallet: account || null,
                                                txHash: receipt.transactionHash || tx.hash,
                                                tokenAddress: Team7Json.address,
                                                tokenSymbol: 'T7'
                                            });
                                        } catch (err) {
                                            console.error('Failed to record donation', err);
                                        }

                                        // refresh donations and campaign data so progress updates
                                        const [dres, cres] = await Promise.all([
                                            axios.get(`http://localhost:5000/api/donations/campaign/${id}`),
                                            axios.get(`http://localhost:5000/api/campaigns/${id}`)
                                        ]);
                                        setDonations(dres.data);
                                        setCampaign(cres.data);
                                    } catch (err) {
                                        toast.dismiss();
                                        console.error(err);
                                        toast.error(err?.message || 'Lỗi khi quyên góp');
                                    }
                                }} className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg text-lg font-semibold transition-colors">
                                    Quyên góp ngay
                                </button>
                            </div>
                        </div>

                        {/* Edit form modal (simple inline) */}
                        {editing && (
                            <div className="mt-6 bg-white p-6 rounded shadow">
                                <h3 className="text-lg font-semibold mb-4">Sửa chiến dịch</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <input name="title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="border p-2 rounded" />
                                    <textarea name="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="border p-2 rounded" />
                                    <input name="goalAmount" type="number" value={formData.goalAmount} onChange={(e) => setFormData({ ...formData, goalAmount: e.target.value })} className="border p-2 rounded" />
                                    <input name="chainId" type="number" value={formData.chainId} onChange={(e) => setFormData({ ...formData, chainId: e.target.value })} className="border p-2 rounded" />
                                    <div>
                                        <label className="block text-sm">Hình ảnh mới</label>
                                        <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={async () => {
                                            try {
                                                const submit = new FormData();
                                                submit.append('title', formData.title);
                                                submit.append('description', formData.description);
                                                submit.append('goalAmount', formData.goalAmount);
                                                submit.append('chainId', formData.chainId);
                                                if (formData.startDate) submit.append('startDate', formData.startDate);
                                                if (formData.endDate) submit.append('endDate', formData.endDate);
                                                if (imageFile) submit.append('image', imageFile);
                                                await campaignApi.updateCampaign(campaign._id, submit);
                                                toast.success('Cập nhật thành công');
                                                // refresh
                                                const res = await axios.get(`http://localhost:5000/api/campaigns/${id}`);
                                                setCampaign(res.data);
                                                setEditing(false);
                                            } catch (err) {
                                                toast.error(err.response?.data?.message || 'Lỗi khi cập nhật');
                                            }
                                        }} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded">Lưu</button>
                                        <button onClick={() => setEditing(false)} className="bg-gray-200 px-4 py-2 rounded">Hủy</button>
                                    </div>
                                </div>
                            </div>
                        )}

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
                                        <div className="text-lg font-bold text-green-600">{donation.amount} T7</div>
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
