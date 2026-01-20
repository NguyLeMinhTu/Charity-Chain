// Client/src/context/Web3Context.jsx - Context quản lý kết nối Web3 và trạng thái ví người dùng.

import { createContext, useContext, useState, useEffect } from 'react';
import { connectWallet, getWeb3Provider } from '../services/web3/web3Provider';
import { getT7Balance } from '../services/web3/t7Token';

const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
    const [account, setAccount] = useState(null);
    const [signer, setSigner] = useState(null);
    const [t7Balance, setT7Balance] = useState('0');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const savedAccount = localStorage.getItem('walletAccount');
        if (savedAccount) {
            // Dịch vụ này có thể không thành công nếu người dùng đã thu hồi quyền truy cập.
            (async () => {
                try {
                    const provider = getWeb3Provider();
                    // try to get signer if permission exists
                    try {
                        const s = await provider.getSigner();
                        const address = await s.getAddress();
                        if (address && address.toLowerCase() === savedAccount.toLowerCase()) {
                            setSigner(s);
                            setAccount(address);
                        } else {
                            setAccount(savedAccount);
                        }
                        // fetch balance using provider (works read-only) or signer
                        const balance = await getT7Balance(provider, savedAccount);
                        setT7Balance(balance);
                    } catch (err) {
                        // signer not available but still try to fetch balance via provider
                        try {
                            const balance = await getT7Balance(provider, savedAccount);
                            setAccount(savedAccount);
                            setT7Balance(balance);
                        } catch (e) {
                            console.error('Failed to rehydrate web3 state', e);
                        }
                    }
                } catch (err) {
                    // provider not available
                    console.error('No web3 provider during rehydrate', err);
                    setAccount(savedAccount);
                }
            })();
        }
    }, []);

    const connect = async () => {
        setLoading(true);
        try {
            const { signer: s, address } = await connectWallet();
            setSigner(s);
            setAccount(address);
            localStorage.setItem('walletAccount', address);

            // fetch T7 balance
            try {
                const balance = await getT7Balance(s, address);
                setT7Balance(balance);
            } catch (err) {
                console.error('Failed to fetch T7 balance', err);
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
        } finally {
            setLoading(false);
        }
    };

    const disconnect = () => {
        setAccount(null);
        setSigner(null);
        setT7Balance('0');
        localStorage.removeItem('walletAccount');
    };

    return (
        <Web3Context.Provider value={{ account, signer, t7Balance, connect, disconnect, loading }}>
            {children}
        </Web3Context.Provider>
    );
};

export const useWeb3Context = () => {
    const context = useContext(Web3Context);
    if (!context) {
        throw new Error('useWeb3Context must be used within Web3Provider');
    }
    return context;
};