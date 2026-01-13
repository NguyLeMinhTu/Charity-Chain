import { useState, useEffect } from 'react';
import { connectWallet } from '../services/web3/web3Provider';

export const useWeb3 = () => {
    const [account, setAccount] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedAccount = localStorage.getItem('walletAccount');
        if (savedAccount) {
            setAccount(savedAccount);
        }
    }, []);

    const connect = async () => {
        setLoading(true);
        try {
            const { address } = await connectWallet();
            setAccount(address);
            localStorage.setItem('walletAccount', address);
        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const disconnect = () => {
        setAccount(null);
        localStorage.removeItem('walletAccount');
    };

    return { account, connect, disconnect, loading };
};