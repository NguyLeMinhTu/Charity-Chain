# Blockchain - Charity Chain

## Mô Tả
Smart contract xử lý donation cho dự án từ thiện, đảm bảo tính minh bạch và bảo mật.

## Cài Đặt

```bash
npm install
```

## Các Lệnh

### Compile contract
```bash
npx hardhat compile
```

### Chạy tests
```bash
npx hardhat test
```

### Deploy lên mạng local
```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Deploy lên Sepolia testnet
```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### Verify contract trên Etherscan
```bash
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

## Cấu Hình

Tạo file `.env` với nội dung:
```
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_test_wallet_private_key (bắt đầu với 0x)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## Lấy Test ETH

- Sepolia Faucet: https://sepoliafaucet.com
- Infura Faucet: https://www.infura.io/faucet/sepolia

## Tính Năng Contract

- ✅ Nhận donation (ETH)
- ✅ Theo dõi donation của từng người
- ✅ Withdraw cho owner
- ✅ Events để tracking
- ✅ Security với OpenZeppelin Ownable
