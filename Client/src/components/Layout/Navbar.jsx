import { Link, useNavigate } from 'react-router-dom';
import { useContext, useState } from 'react';
import { useWeb3Context } from '../../context/Web3Context';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import logo from '../../assets/logo.png';
import logo_metamask from '../../assets/MetaMask_Fox.svg.png';

const Navbar = () => {
    const { account, connect, disconnect, loading, t7Balance } = useWeb3Context();
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);

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

    const handleAdminLogout = () => {
        logout();
        toast.success('Admin đã đăng xuất');
        navigate('/');
    };

    const shortenAddress = (addr = '') => (addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : '');

    return (
        <>
            <div className="bg-gray-900 text-white text-center py-1/2 text-sm">KẾT NỐI NHÀ TÀI TRỢ ĐẾN CÁC CHIẾN DỊCH MINH BẠCH</div>
            <header className="bg-gradient-to-r from-indigo-600 via-violet-800 to-pink-600 text-white sticky top-0 z-50 shadow-lg backdrop-blur">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">

                    {/* Logo và tiêu đề */}
                    <Link to="/" className="flex items-center gap-4">
                        <img src={logo} alt="T7 Logo" className="h-14 w-14 rounded-full shadow-lg ring-2 ring-white/30" />
                        <div>
                            <div className="text-2xl via-violet-500 font-extrabold tracking-tight">T7 - CHARITY</div>
                        </div>
                    </Link>

                    {/* Khu vưc điều hướng chính */}
                    <nav className="hidden lg:flex items-center gap-10">
                        <Link to="/" className="text-white/90 text-xl hover:text-white transition font-medium">Trang chủ</Link>
                        <Link to="/campaigns" className="text-white/90 text-xl hover:text-white transition font-medium">Chiến dịch</Link>
                        <Link to="/campaigns/create" className="text-white/90 text-xl hover:text-white transition font-medium">Tạo chiến dịch</Link>
                        <Link to="/me/donations" className="text-white/90 text-xl hover:text-white transition font-medium">Quyên góp của tôi</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {account && (
                            <div className="hidden md:flex items-center gap-3">
                                <div className="px-4 py-2 bg-white/10 text-white rounded-full text-sm font-semibold">{shortenAddress(account)}</div>
                                <div className="px-3 py-2 bg-white/20 text-white rounded-full text-sm font-semibold">T7: {Number(t7Balance || 0).toFixed(4)}</div>
                            </div>
                        )}

                        {account ? (
                            <div className="flex items-center gap-3">
                                <button onClick={handleDisconnect} className="hidden md:inline-block bg-white text-indigo-700 px-4 py-2 rounded-xl font-semibold shadow hover:scale-105 transition-transform">Huỷ liên kết</button>
                                {user && user.role === 'admin' ? (
                                    <button onClick={handleAdminLogout} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-semibold">Đăng xuất admin</button>
                                ) : null}

                                {/* avatar */}
                                <div className="flex items-center gap-2">
                                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">{(user?.name || account)?.charAt(0).toUpperCase()}</div>
                                </div>

                                <button onClick={() => setOpen(!open)} className="lg:hidden inline-flex items-center justify-center p-2 rounded-md text-white/90 hover:bg-white/10">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <button onClick={handleConnect} disabled={loading} className="bg-white text-amber-700 px-4 py-2 rounded-xl font-semibold shadow hover:scale-105 transition-transform disabled:opacity-60 flex items-center gap-2">
                                    {loading ? (
                                        <span className="inline-flex items-center gap-2">
                                            <svg className="w-4 h-4 animate-spin text-indigo-700" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"></circle>
                                                <path className="opacity-75" d="M4 12a8 8 0 018-8" strokeWidth="4"></path>
                                            </svg>
                                            Đang...
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-2">
                                            Liên kết ví
                                            <img src={logo_metamask} alt="MetaMask Logo" className="w-5 h-5" />
                                        </span>
                                    )}
                                </button>
                                <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-md text-white/90 hover:bg-white/10">
                                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        )}
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
                                    {user && user.role === 'admin' && (
                                        <button onClick={() => { handleAdminLogout(); setOpen(false); }} className="w-full text-left py-2 text-red-600">Đăng xuất admin</button>
                                    )}
                                    <button onClick={() => { handleDisconnect(); setOpen(false); }} className="w-full text-left py-2 text-red-600">Huỷ liên kết</button>
                                </>
                            ) : (
                                <button onClick={() => { handleConnect(); setOpen(false); }} className="w-full text-left py-2 flex items-center gap-2">
                                    <svg className="w-4 h-4" viewBox="0 0 318 318" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                                        <g fill="none" fillRule="nonzero">
                                            <path fill="#E27625" d="M274.1 35.1L203.1 113.6 239.7 152.9 290.8 65.1z" />
                                            <path fill="#E4761B" d="M44.9 35.1L63.5 65.1 79.9 152.9 27.7 65.1z" />
                                            <path fill="#E4761B" d="M132.8 206.9L84.6 183.9 107.3 206.9 132.8 206.9z" />
                                            <path fill="#E4761B" d="M185.2 206.9L210.7 206.9 233.4 183.9 185.2 206.9z" />
                                        </g>
                                    </svg>
                                    Kết nối ví
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </>
    );
};

export default Navbar;