import React, { useContext, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useWeb3Context } from '../context/Web3Context';
import { User, Mail, Wallet, Settings, PlusCircle, List } from 'lucide-react';
import { authApi } from '../services/api/authApi';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const { account, t7Balance, connect, disconnect, loading: web3Loading } = useWeb3Context();

    const [uploading, setUploading] = useState(false);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({ name: user.name || '', email: user.email || '', walletAddress: user.walletAddress || '', password: '' });
    const { refreshUser } = useContext(AuthContext);

    if (!user) return null;

    const fileRef = useRef(null);

    const handleFile = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            await authApi.uploadAvatar(file);
            await refreshUser();
            toast.success('Cập nhật avatar thành công');
        } catch (err) {
            toast.error('Không thể upload avatar');
        } finally {
            setUploading(false);
        }
    };

    const handleUpdate = async () => {
        try {
            const payload = { name: form.name, email: form.email };
            if (form.password) payload.password = form.password;
            // allow clearing walletAddress by empty string
            payload.walletAddress = form.walletAddress || '';
            await authApi.updateProfile(payload);
            await refreshUser();
            toast.success('Cập nhật hồ sơ thành công');
            setEditing(false);
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.message || 'Lỗi khi cập nhật hồ sơ');
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                    {/* Left column */}
                    <div className="md:w-1/3 bg-left-gradient text-white p-6 flex flex-col items-center gap-4">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-4xl font-bold text-white">
                            {user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : (user.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="text-xl font-semibold">{user.name}</div>
                        {/* Nếu role là admin - in ra quản trị viên và ngược lại */}
                        <div className="text-md text-black">{user.role === 'admin' ? 'Quản trị viên' : user.role === 'org' ? 'Tổ chức' : 'Nhà tài trợ'}</div>

                        <div className="w-full mt-3">
                            <div className="text-xs uppercase text-white/80 mb-2">Số dư T7</div>
                            <div className="text-2xl font-bold">{Number(t7Balance || 0).toFixed(4)} T7</div>
                        </div>

                        <div className="mt-auto w-full">
                            <div className="text-xs text-white/80 mb-2">Ví</div>
                            <div className="text-sm break-all">{account || user.walletAddress || 'Chưa liên kết ví'}</div>
                            <div className="mt-3 flex flex-col gap-2">
                                {account && account !== user.walletAddress && (user.role === 'admin' || user.role === 'org') && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await authApi.linkWallet(account);
                                                await refreshUser();
                                                toast.success('Liên kết ví thành công');
                                            } catch (err) {
                                                console.error(err);
                                                toast.error('Không thể liên kết ví');
                                            }
                                        }}
                                        className="px-3 py-2 bg-white text-primary rounded"
                                    >
                                        Liên kết ví
                                    </button>
                                )}

                                {account && (
                                    <button
                                        onClick={() => {
                                            try {
                                                disconnect();
                                                toast.success('Đã ngắt kết nối ví');
                                            } catch (err) {
                                                console.error(err);
                                                toast.error('Không thể ngắt kết nối');
                                            }
                                        }}
                                        className="px-3 py-2 bg-white text-red-600 rounded"
                                    >
                                        Ngắt kết nối ví
                                    </button>
                                )}

                                {!account && !user.walletAddress && (
                                    <div className="mt-0">
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await connect();
                                                    toast.success('Ví đã kết nối');
                                                } catch (err) {
                                                    console.error(err);
                                                    toast.error('Không thể kết nối ví');
                                                }
                                            }}
                                            disabled={web3Loading}
                                            className="px-3 py-2 bg-white text-primary rounded"
                                        >
                                            {web3Loading ? 'Đang kết nối...' : 'Kết nối ví'}
                                        </button>
                                    </div>
                                )}

                                {user.walletAddress && (
                                    <button
                                        onClick={async () => {
                                            try {
                                                await authApi.unlinkWallet();
                                                await refreshUser();
                                                toast.success('Đã hủy liên kết ví');
                                            } catch (err) {
                                                console.error(err);
                                                toast.error('Không thể hủy liên kết ví');
                                            }
                                        }}
                                        className="px-3 py-2 bg-white text-red-600 rounded"
                                    >
                                        Hủy liên kết ví
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right column */}
                    <div className="md:w-2/3 p-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-semibold">Thông tin tài khoản</h2>
                            <div>
                                <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
                                <button onClick={() => fileRef.current && fileRef.current.click()} className="px-4 py-2 bg-gray-100 rounded mr-2">{uploading ? 'Đang tải...' : 'Upload Avatar'}</button>
                                <button onClick={() => setEditing(!editing)} className="px-4 py-2 bg-gray-100 rounded mr-2">{editing ? 'Huỷ' : 'Sửa hồ sơ'}</button>
                                <Link to="/campaigns/create" className="px-4 py-2 bg-primary text-white rounded">Tạo chiến dịch</Link>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4">
                            {!editing ? (
                                <>
                                    <div className="p-4 border rounded">
                                        <div className="text-sm text-gray-600">Họ và tên</div>
                                        <div className="font-medium mt-1">{user.name}</div>
                                    </div>

                                    <div className="p-4 border rounded">
                                        <div className="text-sm text-gray-600">Email</div>
                                        <div className="font-medium mt-1">{user.email}</div>
                                    </div>

                                    <div className="p-4 border rounded">
                                        <div className="text-sm text-gray-600">Quyền</div>
                                        <div className="font-medium mt-1">{user.role}</div>
                                    </div>
                                </>
                            ) : (
                                <div className="p-4 border rounded space-y-3">
                                    <div>
                                        <label className="text-sm text-gray-600">Họ và tên</label>
                                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full mt-1 p-2 border rounded" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Email</label>
                                        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full mt-1 p-2 border rounded" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Mật khẩu mới (để trống nếu không đổi)</label>
                                        <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full mt-1 p-2 border rounded" />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">Địa chỉ ví</label>
                                        <input value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} className="w-full mt-1 p-2 border rounded" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleUpdate} className="px-4 py-2 bg-emerald-600 text-white rounded">Lưu</button>
                                        <button onClick={() => { setEditing(false); setForm({ name: user.name, email: user.email, walletAddress: user.walletAddress || '', password: '' }); }} className="px-4 py-2 bg-gray-200 rounded">Hủy</button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-6">
                            <h3 className="text-lg font-semibold mb-2">Các hành động</h3>
                            <div className="flex flex-wrap gap-2">
                                <Link to="/me/campaigns" className="px-3 py-2 bg-gray-100 rounded">Chiến dịch của bạn</Link>
                                {user.role === 'admin' && <Link to="/admin/campaigns" className="px-3 py-2 bg-gray-100 rounded">Danh sách chiến dịch</Link>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
