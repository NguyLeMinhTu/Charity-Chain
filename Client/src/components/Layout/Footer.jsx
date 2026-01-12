import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

const Footer = () => {
    const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

    return (
        <footer className="bg-gray-900 text-white/90 pt-10 pb-6 mt-12 border-t border-white/5">
            <div className="container mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 items-start">
                    {/* Brand */}
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="T7 Logo" className="h-12 w-12 rounded-full shadow-sm ring-2 ring-white/10" />
                            <div>
                                <div className="text-lg font-extrabold tracking-tight">T7 - Charity</div>
                                <div className="text-xs text-white/60">Connecting donors with transparent campaigns</div>
                            </div>
                        </div>
                        <p className="text-sm text-white/60 max-w-sm">T7 - Charity is a community-driven platform that helps creators and organizations raise funds transparently using blockchain-powered donations.</p>
                        <button onClick={scrollToTop} className="mt-2 w-max text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-1 rounded-md">Back to top</button>
                    </div>

                    {/* Quick links */}
                    <div>
                        <h4 className="font-semibold mb-3">Quick Links</h4>
                        <ul className="flex flex-col gap-2 text-sm text-white/70">
                            <li><Link to="/" className="hover:text-white">Trang chủ</Link></li>
                            <li><Link to="/campaigns" className="hover:text-white">Chiến dịch</Link></li>
                            <li><Link to="/campaigns/create" className="hover:text-white">Tạo chiến dịch</Link></li>
                            <li><Link to="/me/donations" className="hover:text-white">Quyên góp của tôi</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-semibold mb-3">Liên hệ</h4>
                        <div className="text-sm text-white/70 flex flex-col gap-2">
                            <div>Email: <a href="mailto:hello@t7-charity.org" className="hover:text-white">hello@t7-charity.org</a></div>
                            <div>Số điện thoại: <a href="tel:+84900000000" className="hover:text-white">+84 900 000 000</a></div>
                            <div>Địa chỉ: Hà Nội, Việt Nam</div>
                        </div>
                    </div>

                    {/* Socials / small description */}
                    <div>
                        <h4 className="font-semibold mb-3">Kết nối với chúng tôi</h4>
                        <div className="flex items-center gap-3">
                            <a href="https://twitter.com/" target="_blank" rel="noreferrer" className="p-2 rounded-md bg-white/5 hover:bg-white/10">
                                <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M20.947 7.248c.014.203.014.406.014.61 0 6.205-4.722 13.35-13.35 13.35-2.65 0-5.107-.777-7.177-2.106.369.043.737.057 1.123.057 2.193 0 4.213-.747 5.818-2.012-2.051-.043-3.78-1.393-4.376-3.257.285.043.57.072.869.072.42 0 .84-.057 1.23-.143-2.15-.43-3.77-2.33-3.77-4.61v-.057c.632.353 1.355.56 2.12.586-1.255-.84-2.08-2.27-2.08-3.885 0-.856.23-1.65.632-2.337 2.293 2.814 5.728 4.66 9.6 4.85-.072-.34-.102-.698-.102-1.056 0-2.558 2.074-4.632 4.632-4.632 1.33 0 2.531.56 3.375 1.466 1.053-.205 2.044-.592 2.936-1.123-.346 1.08-1.08 1.99-2.04 2.56 0 .02.014.043.014.064z" />
                                </svg>
                            </a>
                            <a href="https://github.com/" target="_blank" rel="noreferrer" className="p-2 rounded-md bg-white/5 hover:bg-white/10">
                                <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M12 .5C5.73.5.75 5.48.75 11.76c0 4.95 3.2 9.15 7.64 10.62.56.1.77-.24.77-.53 0-.26-.01-1.12-.02-2.03-3.11.68-3.77-1.5-3.77-1.5-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .17 1.58.98 1.58.98 1 .98 2.63.7 3.27.54.1-.42.39-.7.71-.86-2.48-.28-5.09-1.24-5.09-5.54 0-1.22.44-2.21 1.16-2.99-.12-.28-.5-1.4.11-2.92 0 0 .95-.3 3.11 1.15.9-.25 1.87-.38 2.83-.38.96 0 1.93.13 2.83.38 2.16-1.45 3.11-1.15 3.11-1.15.61 1.52.23 2.64.11 2.92.72.78 1.16 1.77 1.16 2.99 0 4.31-2.62 5.26-5.11 5.54.4.35.77 1.03.77 2.07 0 1.5-.01 2.72-.01 3.09 0 .29.2.64.78.53C20.05 20.9 23.25 16.7 23.25 11.76 23.25 5.48 18.27.5 12 .5z" />
                                </svg>
                            </a>
                            <a href="https://t.me/" target="_blank" rel="noreferrer" className="p-2 rounded-md bg-white/5 hover:bg-white/10">
                                <svg className="w-5 h-5 text-white/90" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                                    <path d="M12 0C5.372 0 0 5.372 0 12c0 6.627 5.372 12 12 12s12-5.373 12-12c0-6.628-5.372-12-12-12zm5.325 8.237l-1.692 8.01c-.128.57-.462.713-.94.445l-2.6-1.918-1.254 1.207c-.139.139-.255.255-.523.255l.187-2.66 4.84-4.37c.21-.187-.046-.291-.324-.104l-5.98 3.77-2.576-.805c-.56-.175-.573-.56.117-.827L16.02 6.3c.5-.185.94.121.72.657z" />
                                </svg>
                            </a>
                        </div>
                        <p className="text-xs text-white/50 mt-4">Follow us for updates and new campaigns.</p>
                    </div>
                </div>

                <div className="mt-8 border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-white/60">&copy; 2025 T7 - Charity. All rights reserved.</p>
                    <div className="text-sm text-white/60">Made with ❤️ by T7 Team</div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;