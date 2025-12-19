import { ethers } from 'ethers';

export const getWeb3Provider = () => {
    if (!window.ethereum) {
        throw new Error('MetaMask not installed');
    }
    return new ethers.BrowserProvider(window.ethereum);
};

export const connectWallet = async () => {
    const provider = getWeb3Provider();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { signer, address };
};