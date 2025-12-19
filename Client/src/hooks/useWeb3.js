import { useState } from 'react';
import { connectWallet } from '../services/web3/web3Provider';

export const useWeb3 = () => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);

    const connect = async () => {
        setLoading(true);
        try {
            const { address } = await connectWallet();
            setAccount(address);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    return { account, connect, loading };
};