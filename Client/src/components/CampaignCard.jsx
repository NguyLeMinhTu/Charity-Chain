import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye } from 'lucide-react';

const CampaignCard = ({ campaign }) => {
    const formatNumber = (v) => {
        const n = Number(v) || 0;
        return n.toLocaleString();
    };

    const goal = Number(campaign.goalAmount) || 0;
    const raised = Number(campaign.raisedAmount ?? campaign.raised ?? 0) || 0;
    const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

    const { user } = useContext(AuthContext);

    const isOwnerOrAdmin = user && (user.role === 'admin' || (campaign.owner && campaign.owner._id === user._id));

    return (
        <article className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all">
            {/* Header (image + title) */}
            <div className="relative h-52 w-full bg-gray-100">
                {campaign.imageUrl ? (
                    <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover opacity-80" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}

                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Status badge top-left */}
                <div className="absolute top-3 left-3">
                    {(() => {
                        const s = (campaign.status || '').toLowerCase();
                        const isActive = ['fundraising', 'active'].includes(s);
                        const isClosed = ['stopped', 'closed'].includes(s);
                        const isCompleted = s === 'completed';
                        const label = isCompleted ? 'Đã hoàn thành' : isActive ? 'Đang hoạt động' : isClosed ? 'Đã đóng' : (campaign.approvalStatus === 'pending' ? 'Chờ duyệt' : campaign.status || '');
                        const cls = isCompleted ? 'bg-emerald-600 text-white' : isActive ? 'bg-primary text-white' : isClosed ? 'bg-red-600 text-white' : 'bg-yellow-500 text-white';
                        return label ? <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>{label}</span> : null;
                    })()}
                </div>

                {/* Title */}
                <div className="absolute left-4 bottom-4 right-4">
                    <h3 className="text-white text-lg font-bold leading-tight truncate drop-shadow-sm">{campaign.title}</h3>
                </div>
            </div>

            {/* Body */}
            <div className="p-4 space-y-3">
                <p className="text-sm text-gray-700 line-clamp-3">{campaign.description}</p>

                <div>
                    <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div className="bg-progress-gradient h-2" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600 mt-2">
                        <div className="font-medium text-gray-800">{formatNumber(raised)} T7</div>
                        <div className="text-sm text-gray-500">{progress}%</div>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center text-sm font-semibold text-gray-700">
                            {campaign.owner?.avatar ? (
                                <img src={campaign.owner.avatar} alt={campaign.owner.name} className="h-full w-full object-cover" />
                            ) : (
                                (campaign.owner?.name || 'U').charAt(0).toUpperCase()
                            )}
                        </div>
                        <div className="text-sm">
                            <div className="text-gray-800 font-medium">{campaign.owner?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">Mục tiêu: <span className="text-primary font-semibold">{formatNumber(goal)} T7</span></div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link to={`/campaigns/${campaign._id}`} className="inline-flex items-center gap-2 bg-primary hover-bg-primary-dark text-white px-4 py-2 rounded-lg text-sm font-semibold">
                            <Eye className="w-4 h-4" />
                        </Link>
                    </div>
                </div>
            </div>
        </article>
    );
};

export default CampaignCard;