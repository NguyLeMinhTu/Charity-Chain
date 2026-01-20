import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { useWeb3Context } from '../../context/Web3Context';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';
import { authApi } from '../../services/api/authApi';
import { User, Lock, Wallet, X } from 'lucide-react';

const Navbar = () => {
    const { account, connect, disconnect, loading, t7Balance } = useWeb3Context();
    const { user, logout, login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [authTab, setAuthTab] = useState('login'); // 'login' | 'register' | 'wallet'
    const [form, setForm] = useState({ email: '', password: '', name: '' });
    const [submitting, setSubmitting] = useState(false);
    const [avatarOpen, setAvatarOpen] = useState(false);

    const handleConnect = async () => {
        try {
            await connect();
            toast.success('Đã kết nối ví thành công!');
        } catch (error) {
            toast.error('Không thể kết nối ví');
        }
    };

    const handleDisconnect = () => {
        disconnect();
        toast.success('Đã huỷ kết nối ví');
    };

    const handleLogout = () => {
        // also clear web3 wallet state so UI doesn't show connected wallet after logout
        try {
            disconnect();
        } catch (e) {
            // ignore if disconnect not available
        }
        logout();
        toast.success('Đã đăng xuất');
        navigate('/');
    };

    const shortenAddress = (addr = '') => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

    const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await login({ email: form.email, password: form.password });
            toast.success('Đăng nhập thành công');
            setModalOpen(false);
            setForm({ email: '', password: '', name: '' });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Đăng nhập thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await authApi.register({ name: form.name, email: form.email, password: form.password, role: 'org' });
            // auto-login after register
            await login({ email: form.email, password: form.password });
            toast.success('Đăng ký thành công');
            setModalOpen(false);
            setForm({ email: '', password: '', name: '' });
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Đăng ký thất bại');
        } finally {
            setSubmitting(false);
        }
    };

    const handleWalletLink = async () => {
        try {
            await connect();
            toast.success('Đã liên kết ví');
            setModalOpen(false);
        } catch (err) {
            toast.error('Không thể liên kết ví');
        }
    };

    return (
        <>
            <header className="bg-primary text-white sticky top-0 z-50 shadow-lg backdrop-blur">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">

                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-4">
                        <img src={logo} alt="VIECHA Logo" className="h-14 w-14 rounded-full shadow-lg ring-2 ring-purple-200" />
                        <span className="text-2xl font-bold text-white">VIECHA</span>
                    </Link>

                    {/* Khu vưc điều hướng chính */}
                    <nav className="hidden lg:flex items-center gap-10">
                        <Link to="/" className="text-white/90 text-base hover-text-accent transition font-bold">Trang chủ</Link>
                        <Link to="/campaigns" className="text-white/90 text-base hover-text-accent transition font-bold">Chiến dịch</Link>
                        <Link to="/me/donations" className="text-white/90 text-base hover-text-accent transition font-bold">Quyên góp của tôi</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {/* Right side: always show balance, user name and avatar (or placeholders) */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="relative">
                                <button onClick={() => setAvatarOpen((s) => !s)} className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full overflow-hidden bg-white/20 flex items-center justify-center text-white font-bold">
                                        {user?.avatar ? (
                                            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                                        ) : (
                                            (user?.name || (account ? shortenAddress(account) : '?')).charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start leading-tight">
                                        <div className="text-sm font-medium">{user?.name || (account ? shortenAddress(account) : 'Khách')}</div>
                                        <div className="text-xs text-white/80">T7: {Number(t7Balance || 0).toFixed(4)}</div>
                                    </div>
                                </button>

                                {avatarOpen && (
                                    <div className="absolute right-0 mt-2 w-56 bg-white rounded shadow-lg text-sm text-gray-800 overflow-hidden">
                                        {user ? (
                                            <>
                                                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">Hồ sơ</Link>
                                                <Link to="/campaigns/create" className="block px-4 py-2 hover:bg-gray-100">Tạo chiến dịch</Link>
                                                <Link to="/me/campaigns" className="block px-4 py-2 hover:bg-gray-100">Chiến dịch của bạn</Link>
                                                {user.role === 'admin' && (
                                                    <Link to="/admin/campaigns" className="block px-4 py-2 hover:bg-gray-100">Danh sách chiến dịch</Link>
                                                )}
                                                <button onClick={handleLogout} className="w-full text-left px-4 py-2 hover:bg-gray-100">Đăng xuất</button>
                                            </>
                                        ) : (
                                            <>
                                                {account ? (
                                                    <>
                                                        <div className="px-4 py-2">{shortenAddress(account)}</div>
                                                        <button onClick={handleDisconnect} className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600">Huỷ liên kết</button>
                                                    </>
                                                ) : (
                                                    <button onClick={() => setModalOpen(true)} className="w-full text-left px-4 py-2 hover:bg-gray-100">Đăng nhập / Liên kết ví</button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <button onClick={() => setOpen(!open)} className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:bg-white/10">
                            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile dropdown */}
                {open && (
                    <div className="md:hidden bg-white border-t shadow-sm">
                        <div className="container mx-auto px-4 py-3 flex flex-col gap-3">
                            <Link to="/campaigns" onClick={() => setOpen(false)} className="py-2">Chiến dịch</Link>
                            <Link to="/campaigns/create" onClick={() => setOpen(false)} className="py-2">Tạo chiến dịch</Link>
                            <Link to="/me/donations" onClick={() => setOpen(false)} className="py-2">Quyên góp của tôi</Link>
                            {account ? (
                                <>
                                    <div className="py-2">{shortenAddress(account)}</div>
                                    <div className="py-2">T7: {Number(t7Balance || 0).toFixed(4)}</div>
                                    {user && user.role !== 'donor' ? (
                                        <>
                                            <Link to="/profile" onClick={() => setOpen(false)} className="w-full text-left py-2">Hồ sơ</Link>
                                            <Link to="/campaigns/create" onClick={() => setOpen(false)} className="w-full text-left py-2">Tạo chiến dịch</Link>
                                            <Link to="/me/campaigns" onClick={() => setOpen(false)} className="w-full text-left py-2">Chiến dịch của bạn</Link>
                                            {user.role === 'admin' && (
                                                <Link to="/admin/campaigns" onClick={() => setOpen(false)} className="w-full text-left py-2">Danh sách chiến dịch</Link>
                                            )}
                                            <button onClick={() => { handleLogout(); setOpen(false); }} className="w-full text-left py-2 text-red-600">Đăng xuất</button>
                                        </>
                                    ) : (
                                        <>
                                            <button onClick={() => { handleDisconnect(); setOpen(false); }} className="w-full text-left py-2 text-red-600">Huỷ liên kết</button>
                                        </>
                                    )}
                                </>
                            ) : (
                                <button onClick={() => { setModalOpen(true); setOpen(false); }} className="w-full text-left py-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" viewBox="0 0 318 318" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                        <g fill="none" fillRule="nonzero">
                                            <path fill="#E27625" d="M274.1 35.1L203.1 113.6 239.7 152.9 290.8 65.1z" />
                                            <path fill="#E4761B" d="M44.9 35.1L63.5 65.1 79.9 152.9 27.7 65.1z" />
                                            <path fill="#E4761B" d="M132.8 206.9L84.6 183.9 107.3 206.9 132.8 206.9z" />
                                            <path fill="#E4761B" d="M185.2 206.9L210.7 206.9 233.4 183.9 185.2 206.9z" />
                                        </g>
                                    </svg>
                                    Tài khoản
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Account Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpen(false)} />
                    <div className="relative bg-white rounded-lg max-w-md w-full mx-4 p-6 shadow-lg">
                        <div className="flex items-center justify-between mb-4">

                            <button onClick={() => setModalOpen(false)} className="text-gray-500 p-2 rounded hover:bg-gray-100" aria-label="Đóng">
                                <X size={18} />
                            </button>
                            <h3 className="text-lg font-semibold">Tài khoản</h3>
                        </div>

                        <div className="flex gap-2 mb-4">
                            <button onClick={() => setAuthTab('login')} className={`flex-1 py-2 rounded flex items-center justify-center gap-2 ${authTab === 'login' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                <User size={16} /> Đăng nhập
                            </button>
                            <button onClick={() => setAuthTab('wallet')} className={`flex-1 py-2 rounded flex items-center justify-center gap-2 ${authTab === 'wallet' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                <Wallet size={16} /> Liên kết ví
                            </button>
                        </div>

                        {authTab === 'login' && (
                            <form onSubmit={handleLoginSubmit} className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 border rounded px-3 py-2">
                                    <User size={18} className="text-gray-500" />
                                    <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full outline-none" />
                                </div>
                                <div className="flex items-center gap-2 border rounded px-3 py-2">
                                    <Lock size={18} className="text-gray-500" />
                                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mật khẩu" className="w-full outline-none" />
                                </div>
                                <button disabled={submitting} className="bg-primary text-white py-2 rounded flex items-center justify-center gap-2">{submitting ? 'Đang...' : (<><Lock size={16} />Đăng nhập</>)}</button>
                                <div className="text-sm text-gray-500">Dành cho tổ chức và admin.</div>
                                <div className="text-sm text-gray-700">Chưa có tài khoản? <button type="button" onClick={() => setAuthTab('register')} className="text-primary font-medium">Đăng ký tại đây</button></div>
                            </form>
                        )}

                        {authTab === 'register' && (
                            <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 border rounded px-3 py-2">
                                    <User size={18} className="text-gray-500" />
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="Tên tổ chức / người gây quỹ" className="w-full outline-none" />
                                </div>
                                <div className="flex items-center gap-2 border rounded px-3 py-2">
                                    <User size={18} className="text-gray-500" />
                                    <input name="email" value={form.email} onChange={handleChange} placeholder="Email" className="w-full outline-none" />
                                </div>
                                <div className="flex items-center gap-2 border rounded px-3 py-2">
                                    <Lock size={18} className="text-gray-500" />
                                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Mật khẩu" className="w-full outline-none" />
                                </div>
                                <button disabled={submitting} className="bg-primary text-white py-2 rounded flex items-center justify-center gap-2">{submitting ? 'Đang...' : (<><User size={16} />Đăng ký</>)}</button>
                                <div className="text-sm text-gray-500">Đăng ký cho người tạo chiến dịch (role sẽ là tổ chức).</div>
                            </form>
                        )}

                        {authTab === 'wallet' && (
                            <div className="flex flex-col gap-3">
                                <div className="text-sm text-gray-700">Người quyên góp chỉ cần liên kết ví để tham gia.</div>
                                <button onClick={handleWalletLink} className="bg-amber-500 text-white py-2 rounded flex items-center justify-center gap-2"><Wallet size={16} /> Liên kết ví {loading ? '...' : ''}</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </>
    );
};

export default Navbar;