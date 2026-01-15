import { ethers } from 'ethers';

const CRONOS_CHAIN_ID = 338;
const CRONOS_CHAIN_HEX = '0x152';

export const getWeb3Provider = () => {
    if (!window.ethereum) {
        throw new Error('MetaMask not installed');
    }
    return new ethers.BrowserProvider(window.ethereum);
};

export const connectWallet = async () => {
    if (!window.ethereum) throw new Error('MetaMask not installed');

    // Try to switch MetaMask to Cronos
    try {
        await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: CRONOS_CHAIN_HEX }] });
    } catch (err) {
        // 4902 - chain is not added to MetaMask
        console.debug('Could not switch chain:', err?.code || err?.message || err);
    }

    // Request accounts and build provider/signer
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    return { provider, signer, address };
};