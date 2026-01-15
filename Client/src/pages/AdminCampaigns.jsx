import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../services/api/axiosClient';
import toast from 'react-hot-toast';

const AdminCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPendingOnly, setShowPendingOnly] = useState(false);
    const navigate = useNavigate();

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get('/campaigns');
            // API may return { campaigns: [...] } or an array; normalize
            setCampaigns(Array.isArray(data) ? data : data.campaigns || []);
        } catch (err) {
            console.error(err);
            toast.error('Không thể lấy danh sách chiến dịch');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCampaigns();
    }, []);

    const setApproval = async (id, status) => {
        try {
            await axiosClient.patch(`/campaigns/${id}/approval`, { approvalStatus: status });
            toast.success('Cập nhật phê duyệt thành công');
            fetchCampaigns();
        } catch (err) {
            console.error(err);
            toast.error('Không thể cập nhật phê duyệt');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Bạn có chắc muốn xoá chiến dịch này?')) return;
        try {
            await axiosClient.delete(`/campaigns/${id}`);
            toast.success('Xoá thành công');
            fetchCampaigns();
        } catch (err) {
            console.error(err);
            toast.error('Không thể xoá chiến dịch');
        }
    };

    const handleEdit = (id) => {
        // navigate to an edit page; adjust route if your app uses a different path
        navigate(`/campaigns/${id}/edit`);
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-extrabold">Danh sách chiến dịch (Admin)</h1>
                <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={showPendingOnly} onChange={(e) => setShowPendingOnly(e.target.checked)} />
                    <span>Chỉ hiển thị chờ phê duyệt</span>
                </label>
            </div>

            {loading ? (
                <div>Đang tải...</div>
            ) : (
                <div className="overflow-x-auto bg-white rounded-lg shadow">
                    <table className="min-w-full table-fixed text-sm text-left">
                        <thead className="bg-primary-10">
                            <tr>
                                <th className="px-3 py-2 text-xs w-20">Ảnh</th>
                                <th className="px-3 py-2 text-xs w-64">Tên chiến dịch</th>
                                <th className="px-3 py-2 text-xs">Tổ chức</th>
                                <th className="px-3 py-2 text-xs">Địa chỉ ví</th>
                                <th className="px-3 py-2 text-xs">Trạng thái</th>
                                <th className="px-3 py-2 text-xs">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            {campaigns.filter((c) => (showPendingOnly ? c.approvalStatus === 'pending' : true)).length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-gray-600">Không có chiến dịch nào</td>
                                </tr>
                            )}

                            {campaigns
                                .filter((c) => (showPendingOnly ? c.approvalStatus === 'pending' : true))
                                .map((c) => (
                                    <tr key={c._id} className="border-t">
                                        <td className="px-3 py-2 align-middle">
                                            {c.imageUrl || c.image || c.coverImage || (c.images && c.images[0]) ? (
                                                <img
                                                    src={c.imageUrl || c.image || c.coverImage || (c.images && c.images[0])}
                                                    alt={c.title}
                                                    className="h-10 w-16 object-cover rounded"
                                                    onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = 'https://via.placeholder.com/160x96?text=No+Image'; }}
                                                />
                                            ) : (
                                                <div className="h-10 w-16 bg-gray-100 flex items-center justify-center rounded text-gray-500 text-xs">No image</div>
                                            )}
                                        </td>

                                        <td className="px-4 py-3 align-middle">
                                            <div title={c.title} className="font-medium max-w-[18rem] truncate">{c.title}</div>
                                            <div className="text-xs text-gray-500 truncate">{c._id}</div>
                                        </td>

                                        <td className="px-3 py-2 align-middle">
                                            <div className="text-sm font-medium">{c.owner?.name || 'Không rõ'}</div>
                                            <div className="text-xs text-gray-500">{c.owner?.email || ''}</div>
                                        </td>

                                        <td className="px-3 py-2 align-middle">
                                            <div className="text-sm">{c.owner?.wallet || c.owner?.address || c.owner?.walletAddress || '—'}</div>
                                        </td>

                                        <td className="px-3 py-2 align-middle">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : c.approvalStatus === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                {String(c.approvalStatus || 'approved').replace(/(^|_)([a-z])/g, (m, p, ch) => ch.toUpperCase())}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3 align-middle">
                                            <div className="flex items-center gap-2">
                                                {c.approvalStatus === 'pending' && (
                                                    <button onClick={() => setApproval(c._id, 'approved')} className="px-2 py-1 bg-green-600 text-white rounded-md text-xs hover:opacity-95">Phê duyệt</button>
                                                )}
                                                <button onClick={() => handleEdit(c._id)} className="px-2 py-1 bg-blue-400 text-white rounded-md text-xs hover:opacity-95">Sửa</button>
                                                <button onClick={() => handleDelete(c._id)} className="px-2 py-1 bg-red-400 text-white rounded-md text-xs hover:opacity-95">Xoá</button>
                                                {c.approvalStatus !== 'rejected' && (
                                                    <button onClick={() => setApproval(c._id, 'rejected')} className="px-2 py-1 bg-rose-400 text-white rounded-md text-xs hover:opacity-95">Từ chối</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminCampaigns;
