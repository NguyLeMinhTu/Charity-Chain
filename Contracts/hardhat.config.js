// hardhat.config.js — CommonJS configuration for Hardhat
require('dotenv').config();
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');

const RPC_URL = process.env.RPC_URL;
const DEPLOYER_PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;
const POLYGONSCAN_API_KEY = process.env.POLYGONSCAN_API_KEY;
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY;

module.exports = {
    solidity: {
        compilers: [{ version: '0.8.19' }]
    },
    paths: {
        sources: './src',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts'
    },
    networks: {
        hardhat: {
            chainId: 1337
        },
        mumbai: {
            url: RPC_URL || '',
            accounts: DEPLOYER_PRIVATE_KEY ? [DEPLOYER_PRIVATE_KEY] : []
        }
    },
    etherscan: {
        apiKey: {
            mainnet: ETHERSCAN_API_KEY || '',
            goerli: ETHERSCAN_API_KEY || '',
            polygon: POLYGONSCAN_API_KEY || '',
            polygonMumbai: POLYGONSCAN_API_KEY || ''
        }
    }
};
