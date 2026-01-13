import { ethers } from 'ethers';
import DonationJson from '../../../Donation.json';

export const getDonationContract = (signer) => {
    const contractAddress = import.meta.env.VITE_DONATION_CONTRACT_ADDRESS || DonationJson.address;
    const abi = DonationJson.abi || DonationJson;
    return new ethers.Contract(contractAddress, abi, signer);
};