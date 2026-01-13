import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { campaignApi } from '../../services/api/campaignApi';

// Simple breadcrumb generator based on URL path segments.
// Accepts optional `labels` prop to map path segments to friendly names.
const Breadcrumbs = ({ labels = {} }) => {
    const location = useLocation();
    const { pathname } = location;
    const [campaignTitle, setCampaignTitle] = useState(null);

    // default friendly labels
    const defaultLabels = {
        '/campaigns': 'Chiến dịch',
        '/campaigns/create': 'Tạo chiến dịch',
        '/profile': 'Hồ sơ',
        '/me/campaigns': 'Chiến dịch của bạn',
    };

    const mergedLabels = { ...defaultLabels, ...labels };

    const parts = pathname.split('/').filter(Boolean);

    // If URL is /campaigns/:id where :id looks like a mongo ObjectId, fetch the campaign title
    useEffect(() => {
        setCampaignTitle(null);
        if (parts.length >= 2 && parts[0] === 'campaigns') {
            const last = parts[parts.length - 1];
            const isObjectId = /^[0-9a-fA-F]{24}$/.test(last);
            if (isObjectId) {
                (async () => {
                    try {
                        const res = await campaignApi.getCampaignById(last);
                        const c = res?.data?.campaign || res?.data;
                        if (c && (c.title || c.name)) {
                            setCampaignTitle(c.title || c.name);
                        }
                    } catch (err) {
                        // ignore failures; leave the ID displayed
                        console.error('Failed to load campaign title for breadcrumb', err);
                    }
                })();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pathname]);

    if (pathname === '/' || parts.length === 0) return null;

    const crumbs = parts.map((part, idx) => {
        const to = '/' + parts.slice(0, idx + 1).join('/');
        const raw = decodeURIComponent(part);
        // if this is the last part of a campaigns/:id path and we fetched a title, use it
        const isLast = idx === parts.length - 1;
        let label = mergedLabels[to] || mergedLabels[raw] || raw.replace(/-/g, ' ');
        if (parts[0] === 'campaigns' && isLast && campaignTitle) {
            label = campaignTitle;
        }
        return { to, label };
    });

    return (
        <nav aria-label="Breadcrumb" className="text-sm text-gray-600 mb-4">
            <ol className="flex items-center gap-2">
                <li>
                    <Link to="/" className="text-gray-600 hover:underline">Trang chủ</Link>
                </li>
                {crumbs.map((c, i) => (
                    <li key={c.to} className="flex items-center gap-2">
                        <span className="text-gray-400">/</span>
                        {i === crumbs.length - 1 ? (
                            <span className="font-medium text-gray-800">{capitalize(c.label)}</span>
                        ) : (
                            <Link to={c.to} className="text-gray-600 hover:underline">{capitalize(c.label)}</Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

function capitalize(s) {
    if (!s) return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export default Breadcrumbs;
