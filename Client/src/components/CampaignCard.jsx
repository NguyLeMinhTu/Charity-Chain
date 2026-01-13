import React from 'react';
import { Link } from 'react-router-dom';

const CampaignCard = ({ campaign }) => {
    const formatNumber = (v) => {
        const n = Number(v) || 0;
        return n.toLocaleString();
    };

    const goal = Number(campaign.goalAmount) || 0;
    const raised = Number(campaign.raisedAmount ?? campaign.raised ?? 0) || 0;
    const progress = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

    return (
        <article className="max-w-sm bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transform hover:-translate-y-1 transition-all">
            <div className="h-40 w-full bg-gray-100 overflow-hidden">
                {campaign.imageUrl ? (
                    <img src={campaign.imageUrl} alt={campaign.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
            </div>
            <div className="p-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">{campaign.title}</h2>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">{campaign.description}</p>

                <div className="mb-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-400 to-green-600 h-2" style={{ width: `${progress}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                        <span>{formatNumber(raised)} ETH quyên góp</span>
                        <span>{progress}%</span>
                    </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="text-sm text-gray-500">Mục tiêu</div>
                        <div className="text-green-600 font-semibold">{formatNumber(goal)} ETH</div>
                    </div>
                    <div>
                        {(() => {
                            const s = campaign.status;
                            const isActive = ['fundraising', 'active'].includes(s);
                            const isClosed = ['stopped', 'closed'].includes(s);
                            const label = isActive ? 'Đang hoạt động' : isClosed ? 'Đã đóng' : s;
                            const cls = isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
                            return (
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${cls}`}>
                                    {label}
                                </span>
                            );
                        })()}
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-500">Bởi: <span className="text-gray-800 font-medium">{campaign.owner?.name || 'Unknown'}</span></div>
                    <Link to={`/campaigns/${campaign._id}`} className="ml-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm">Xem chi tiết</Link>
                </div>
            </div>
        </article>
    );
};

export default CampaignCard;