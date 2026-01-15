import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import heroVolunteers from '../assets/hero-img.jpg';
import { useCampaigns } from '../hooks/useCampaigns';
import CampaignCard from '../components/CampaignCard';
import Loader from '../components/Common/Loader';

const fmt = (v) => {
    const n = Number(v) || 0;
    return n.toLocaleString();
};

const Home = () => {
    const { campaigns, loading } = useCampaigns();

    const stats = useMemo(() => {
        const totalCampaigns = campaigns.length;
        const totalRaised = campaigns.reduce((s, c) => s + (Number(c.raisedAmount ?? c.raised ?? 0) || 0), 0);
        const organizers = new Set(campaigns.map((c) => c.owner?._id).filter(Boolean)).size;
        return { totalCampaigns, totalRaised, organizers };
    }, [campaigns]);

    const featured = useMemo(() => {
        return [...campaigns]
            .sort((a, b) => (Number(b.raisedAmount ?? b.raised ?? 0) || 0) - (Number(a.raisedAmount ?? a.raised ?? 0) || 0))
            .slice(0, 6);
    }, [campaigns]);

    return (
        <main className="min-h-screen bg-gray-50">
            {/* Hero */}
            <section className="relative w-screen left-1/2 transform -translate-x-1/2 -mt-1 md:-mt-2 lg:-mt-3 h-[480px] md:h-[600px] lg:h-[720px] overflow-hidden">
                <img src={heroVolunteers} alt="Tình nguyện viên" className="absolute inset-0 w-full h-full object-cover object-center brightness-90" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/30" />

                {/* decorative side blobs */}
                <div className="absolute -left-36 top-20 w-72 h-72 bg-gradient-to-br from-indigo-500 to-pink-400 rounded-full opacity-30 filter blur-3xl transform rotate-12" />
                <div className="absolute -right-44 bottom-8 w-96 h-96 bg-gradient-to-br from-amber-400 to-red-500 rounded-full opacity-25 filter blur-3xl transform -rotate-12" />

                <div className="relative z-10 container mx-auto px-6 h-full flex items-center">
                    <div className="max-w-3xl text-white">
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold leading-tight drop-shadow-lg">
                            <span className="bg-clip-text text-[#ffeded]">Kết nối gây quỹ</span>
                            <span className="block text-xl md:text-3xl font-semibold mt-2 text-white/90">và ủng hộ cộng đồng trực tuyến</span>
                        </h1>
                        <p className="mt-4 text-lg md:text-xl text-white/85">Minh bạch, an toàn và tiện lợi — cùng nhau tạo khác biệt.</p>

                        <div className="mt-8 flex flex-wrap gap-3">
                            <Link to="/campaigns" className="inline-flex items-center bg-white text-primary px-5 py-3 rounded-md font-semibold shadow hover:shadow-lg">Khám phá chiến dịch</Link>
                            <Link to="/campaigns/create" className="inline-flex items-center bg-accent-20 text-white px-5 py-3 rounded-md font-semibold hover-bg-primary-30">Bắt đầu quyên góp</Link>
                        </div>
                    </div>
                </div>
            </section>
            {/* Stats */}
            <section className="container mx-auto px-6 -mt-16 md:-mt-24">
                <div className="bg-white/90 backdrop-blur rounded-xl shadow p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex flex-col items-start">
                        <div className="text-sm text-gray-500">Chiến dịch</div>
                        <div className="mt-2 text-2xl font-bold text-primary">Hơn 100 Chiến dịch</div>
                    </div>

                    <div className="flex flex-col items-start">
                        <div className="text-sm text-gray-500">Tổng quyên góp</div>
                        <div className="mt-2 text-2xl font-bold text-primary">Hơn 100,000 T7</div>
                    </div>

                    <div className="flex flex-col items-start">
                        <div className="text-sm text-gray-500">Người tổ chức</div>
                        <div className="mt-2 text-2xl font-bold text-primary">Hơn 50 Người tổ chức</div>
                    </div>
                </div>
            </section>

            {/* Featured campaigns */}
            <section className="container mx-auto px-6 py-12">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-3xl font-extrabold">Chiến dịch nổi bật</h2>
                    <Link to="/campaigns" className="text-primary font-medium">Xem tất cả</Link>
                </div>

                {loading ? (
                    <div className="py-12 flex justify-center">
                        <Loader />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featured.length ? featured.map((c) => (
                            <CampaignCard key={c._id} campaign={c} />
                        )) : (
                            <div className="col-span-full text-gray-600">Chưa có chiến dịch nào để hiển thị.</div>
                        )}
                    </div>
                )}
            </section>
        </main>
    );
};

export default Home;
