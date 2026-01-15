import { ethers } from 'ethers';

export const formatEther = (value) => {
    return ethers.utils.formatEther(value);
};

export const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
};