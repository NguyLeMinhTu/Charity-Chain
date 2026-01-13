import { ethers } from 'ethers';
import Team7Json from '../../../Team7.json';

export const getT7Contract = (signerOrProvider) => {
    const address = import.meta.env.VITE_T7_CONTRACT_ADDRESS || Team7Json.address;
    const abi = Team7Json.abi || Team7Json;
    return new ethers.Contract(address, abi, signerOrProvider);
};

export const getT7Balance = async (signerOrProvider, account) => {
    if (!account) return '0';
    const contract = getT7Contract(signerOrProvider);
    const raw = await contract.balanceOf(account);
    let decimals = 18;
    try {
        decimals = await contract.decimals();
    } catch (e) {
        // default 18
    }
    return ethers.formatUnits(raw, decimals);
};
