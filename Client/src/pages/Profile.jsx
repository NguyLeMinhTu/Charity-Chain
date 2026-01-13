import React, { useContext, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useWeb3Context } from '../context/Web3Context';
import { User, Mail, Wallet, Settings, PlusCircle, List } from 'lucide-react';
import { authApi } from '../services/api/authApi';
import toast from 'react-hot-toast';

const Profile = () => {
    const { user } = useContext(AuthContext);
    const { account, t7Balance, connect, loading: web3Loading } = useWeb3Context();

    const [uploading, setUploading] = useState(false);
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

    return (
        <div className="container mx-auto p-6">
            <div className="max-w-5xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
                <div className="md:flex">
                    {/* Left column */}
                    <div className="md:w-1/3 bg-gradient-to-b from-indigo-600 to-violet-600 text-white p-6 flex flex-col items-center gap-4">
                        <div className="h-32 w-32 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-4xl font-bold text-white">
                            {user.avatar ? <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" /> : (user.name || '?').charAt(0).toUpperCase()}
                        </div>
                        <div className="text-xl font-semibold">{user.name}</div>
                        <div className="text-sm opacity-90">{user.role}</div>

                        <div className="w-full mt-3">
                            <div className="text-xs uppercase text-white/80 mb-2">Số dư T7</div>
                            <div className="text-2xl font-bold">{Number(t7Balance || 0).toFixed(4)}</div>
                        </div>

                        <div className="mt-auto w-full">
                            <div className="text-xs text-white/80 mb-2">Ví</div>
                            <div className="text-sm break-all">{account || user.walletAddress || 'Chưa liên kết ví'}</div>
                            <div className="mt-3">
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
                                        className="px-3 py-2 bg-white text-indigo-600 rounded"
                                    >
                                        Liên kết ví
                                    </button>
                                )}
                                {!account && !user.walletAddress && (
                                    <div className="mt-2">
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
                                            className="px-3 py-2 bg-white text-indigo-600 rounded"
                                        >
                                            {web3Loading ? 'Đang kết nối...' : 'Kết nối ví'}
                                        </button>
                                    </div>
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
                                <Link to="/campaigns/create" className="px-4 py-2 bg-indigo-600 text-white rounded">Tạo chiến dịch</Link>
                            </div>
                        </div>

                        <div className="mt-4 grid grid-cols-1 gap-4">
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
