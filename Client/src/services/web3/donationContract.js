import { ethers } from 'ethers';
import DonationContractABI from '../../../artifacts/contracts/DonationContract.sol/DonationContract.json';

export const getDonationContract = (signer) => {
    const contractAddress = import.meta.env.VITE_DONATION_CONTRACT_ADDRESS;
    return new ethers.Contract(contractAddress, DonationContractABI.abi, signer);
};