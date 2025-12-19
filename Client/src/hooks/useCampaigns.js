import { useState, useEffect } from 'react';
import { campaignApi } from '../services/api/campaignApi';

export const useCampaigns = () => {
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCampaigns = async () => {
            try {
                const response = await campaignApi.getCampaigns();
                setCampaigns(response.data);
            } catch (error) {
                console.error('Error fetching campaigns:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCampaigns();
    }, []);

    return { campaigns, loading };
};