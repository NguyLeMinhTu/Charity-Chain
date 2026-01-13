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
            setAccount(savedAccount);
            // cannot fetch signer without user interaction; balance will load on connect
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