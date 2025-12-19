Dưới đây là nội dung mẫu để bạn đặt vào `blockchain/README.md` cho phần smart contract thử nghiệm.

***

# Blockchain – Donation DApp (Smart Contract thử nghiệm)

Phần này mô tả smart contract thử nghiệm cho hệ thống quyên góp, dùng Solidity và mạng thử (ví dụ: Hardhat + localhost, Sepolia testnet). Contract chịu trách nhiệm nhận tiền donate, lưu tổng số tiền và sự kiện giao dịch để backend có thể đồng bộ.[1][2]

***

## Mục tiêu

- Tạo smart contract đơn giản, an toàn ở mức cơ bản, phục vụ giai đoạn thử nghiệm.[2][3]
- Hỗ trợ: nhận donation, lưu tổng tiền, emit event, optional: quản lý nhiều chiến dịch.[4][1]

***

## Kiến trúc & lựa chọn công nghệ

- Ngôn ngữ: Solidity \(\ge 0.8.x\).[5][2]
- Dev environment: Hardhat (khuyến nghị) hoặc Truffle.[6][4]
- Mạng:  
  - Local: Hardhat network hoặc Ganache.  
  - Testnet: Sepolia, Mumbai/Polygon Amoy, BSC Testnet, tùy frontend/backend.[7][4]

Cấu trúc thư mục gợi ý:

```bash
blockchain/
  hardhat.config.js
  package.json
  .env
  contracts/
    Donation.sol
  scripts/
    deploy.js
    seedCampaigns.js      # (tuỳ chọn)
  test/
    donation.test.js
```

***

## Giai đoạn 1 – Khởi tạo dự án blockchain

### Mục tiêu

Tạo project Hardhat cơ bản, có thể compile và deploy contract mẫu.

### Các bước

1. Khởi tạo:

```bash
mkdir blockchain
cd blockchain
npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npx hardhat init   # hoặc `npx hardhat` rồi chọn "Create a JavaScript project"
```

2. Cấu hình `hardhat.config.js` (rút gọn):

```js
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config();

const { SEPOLIA_RPC_URL, PRIVATE_KEY } = process.env;

module.exports = {
  solidity: '0.8.20',
  networks: {
    hardhat: {},
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  }
};
```

3. Tạo `.env`:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/your_key
PRIVATE_KEY=0xabc...         # ví test dùng để deploy
```

### File được tạo / thay đổi

- `package.json`, `hardhat.config.js`, `.env`.  
- Thư mục `contracts/`, `scripts/`, `test/` từ Hardhat.[4][6]

### Checklist Giai đoạn 1

- [ ] `npx hardhat compile` chạy thành công.  
- [ ] Mạng `hardhat` có thể chạy lệnh `npx hardhat test` (test mẫu).  

***

## Giai đoạn 2 – Viết smart contract Donation thử nghiệm

### Mục tiêu

Viết contract nhận donation, lưu tổng số tiền và emit event; có thể hỗ trợ nhiều chiến dịch theo `campaignId`.[8][1]

### Mô hình đơn giản (1 contract, nhiều campaign)

- Mỗi campaign có: owner, goal, tổng tiền raise, trạng thái.[4]
- Hàm `createCampaign` cho phép admin/owner tạo chiến dịch.  
- Hàm `donate` nhận ETH, cập nhật tổng, emit event.[9][2]

### Code mẫu `contracts/Donation.sol`

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Donation {
    struct Campaign {
        address payable owner;
        uint256 goalAmount;
        uint256 raisedAmount;
        bool isActive;
    }

    mapping(uint256 => Campaign) public campaigns;
    uint256 public nextCampaignId;

    event CampaignCreated(
        uint256 indexed campaignId,
        address indexed owner,
        uint256 goalAmount
    );

    event Donated(
        uint256 indexed campaignId,
        address indexed donor,
        uint256 amount
    );

    event Withdrawn(
        uint256 indexed campaignId,
        address indexed owner,
        uint256 amount
    );

    modifier onlyOwner(uint256 _campaignId) {
        require(
            campaigns[_campaignId].owner == msg.sender,
            "Not campaign owner"
        );
        _;
    }

    modifier campaignActive(uint256 _campaignId) {
        require(campaigns[_campaignId].isActive, "Campaign not active");
        _;
    }

    function createCampaign(uint256 _goalAmount) external returns (uint256) {
        require(_goalAmount > 0, "Goal must be > 0");

        uint256 campaignId = nextCampaignId;
        campaigns[campaignId] = Campaign({
            owner: payable(msg.sender),
            goalAmount: _goalAmount,
            raisedAmount: 0,
            isActive: true
        });

        nextCampaignId++;

        emit CampaignCreated(campaignId, msg.sender, _goalAmount);
        return campaignId;
    }

    function donate(uint256 _campaignId)
        external
        payable
        campaignActive(_campaignId)
    {
        require(msg.value > 0, "Amount must be > 0");
        Campaign storage campaign = campaigns[_campaignId];

        campaign.raisedAmount += msg.value;

        emit Donated(_campaignId, msg.sender, msg.value);
    }

    function withdraw(uint256 _campaignId)
        external
        onlyOwner(_campaignId)
        campaignActive(_campaignId)
    {
        Campaign storage campaign = campaigns[_campaignId];
        uint256 amount = campaign.raisedAmount;
        require(amount > 0, "Nothing to withdraw");

        campaign.raisedAmount = 0;
        campaign.isActive = false;

        (bool success, ) = campaign.owner.call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(_campaignId, msg.sender, amount);
    }

    function getCampaign(uint256 _campaignId)
        external
        view
        returns (
            address owner,
            uint256 goalAmount,
            uint256 raisedAmount,
            bool isActive
        )
    {
        Campaign storage c = campaigns[_campaignId];
        return (c.owner, c.goalAmount, c.raisedAmount, c.isActive);
    }
}
```

> Đây là contract test / demo, chưa xử lý tất cả edge case, bảo mật nâng cao và không nên dùng production.[10][11]

### File được tạo / thay đổi

- Mới: `contracts/Donation.sol`.[3][1]

### Checklist Giai đoạn 2

- [ ] `npx hardhat compile` thành công không lỗi.  
- [ ] ABI và bytecode được sinh trong `artifacts/`.

***

## Giai đoạn 3 – Script deploy contract lên mạng test

### Mục tiêu

Viết script deploy để lấy địa chỉ contract, dùng cho backend/frontend.[6][4]

### Các bước

1. Tạo `scripts/deploy.js`:

```js
const hre = require('hardhat');

async function main() {
  const Donation = await hre.ethers.getContractFactory('Donation');
  const donation = await Donation.deploy();
  await donation.deployed();

  console.log('Donation contract deployed to:', donation.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

2. Deploy local:

```bash
npx hardhat node       # chạy node local
npx hardhat run scripts/deploy.js --network localhost
```

3. Deploy testnet (ví dụ Sepolia):

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

### File được tạo / thay đổi

- Mới: `scripts/deploy.js`.  
- Cập nhật: `hardhat.config.js` (thêm mạng testnet).[4]

### Checklist Giai đoạn 3

- [ ] Deploy local thành công, log địa chỉ contract.  
- [ ] Deploy testnet thành công (nếu cấu hình RPC + PRIVATE_KEY).  
- [ ] Lưu lại địa chỉ contract để dùng cho backend/frontend.

***

## Giai đoạn 4 – Test cơ bản (Remix / Hardhat test)

### Mục tiêu

Test những hành vi chính: tạo campaign, donate, withdraw.[8][4]

### Các bước

1. Test nhanh với Hardhat (rút gọn) – file `test/donation.test.js` (pseudo):

```js
const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Donation', () => {
  it('should create a campaign and accept donations', async () => {
    const [owner, donor] = await ethers.getSigners();
    const Donation = await ethers.getContractFactory('Donation');
    const donation = await Donation.deploy();
    await donation.deployed();

    const goal = ethers.utils.parseEther('1');
    const txCreate = await donation.connect(owner).createCampaign(goal);
    const receiptCreate = await txCreate.wait();
    const campaignId = 0;

    const amount = ethers.utils.parseEther('0.1');
    await donation.connect(donor).donate(campaignId, { value: amount });

    const [, , raisedAmount] = await donation.getCampaign(campaignId);
    expect(raisedAmount).to.equal(amount);
  });
});
```

2. Chạy test:

```bash
npx hardhat test
```

### Checklist Giai đoạn 4

- [ ] Test tạo campaign, donate chạy pass.  
- [ ] `raisedAmount` cập nhật đúng với số tiền donate.  

***

## Giai đoạn 5 – Tích hợp với backend / frontend

### Mục tiêu

Chuẩn hóa cách frontend/backend tương tác contract test.[12][7]

### Thông tin contract cần expose

- `CONTRACT_ADDRESS` trên mạng test.  
- `CONTRACT_ABI` (JSON) – lấy từ `artifacts/contracts/Donation.sol/Donation.json`.  

### Quy ước mapping với backend

- `campaignIdOnChain` của backend `Campaign` sẽ trùng với `campaignId` (uint256) trong contract.  
- Luồng gợi ý:
  - Backend tạo campaign off‑chain (MongoDB) và có thể thêm API để lấy `campaignIdOnChain`.  
  - Frontend khi user muốn donate:
    - Gọi `donationContract.donate(campaignIdOnChain, { value: amountInWei })` qua ví.[13][9]
    - Sau khi tx confirm, frontend gửi `txHash`, `amount`, `campaignId` cho backend để lưu `Donation` off‑chain.  

### Checklist Giai đoạn 5

- [ ] Frontend connect được contract trên mạng test.  
- [ ] Backend lưu được txHash/amount/campaign mapping đúng với campaignId on‑chain.  

***

## Tính năng mở rộng cho smart contract (sau thử nghiệm)

Khi contract thử nghiệm ổn, có thể mở rộng:

- Quản lý thời gian & điều kiện chiến dịch  
  - Thêm `deadline`, `minDonation`, logic auto close khi đạt goal hoặc hết hạn.[4]

- Donate bằng token ERC‑20  
  - Hỗ trợ donate bằng stablecoin (USDT/USDC testnet) thay vì chỉ ETH.[5]

- Cơ chế refund  
  - Cho phép refund nếu hết hạn mà không đạt goal (kiểu crowdfunding).[6][4]

- Tăng cường bảo mật  
  - Thêm modifier `nonReentrant` (OpenZeppelin) cho hàm `withdraw`.  
  - Kiểm tra các vấn đề như donation attack / internal accounting.[11]

- Event chi tiết hơn  
  - Event thêm trường `timestamp`, `goalReached` để backend dễ xử lý.[13]

- Hỗ trợ nhiều tổ chức / đa chain  
  - Mapping thêm `orgId`, hoặc deploy nhiều contract cho từng tổ chức.  
  - Triển khai cùng contract lên nhiều mạng (Polygon, BSC) và lưu chainId.

***

## Lệnh hữu ích

```bash
# Compile
npx hardhat compile

# Chạy node local
npx hardhat node

# Deploy local
npx hardhat run scripts/deploy.js --network localhost

# Deploy testnet
npx hardhat run scripts/deploy.js --network sepolia

# Test
npx hardhat test
```

***

Nội dung này thiết kế để dùng trực tiếp làm `blockchain/README.md` cho phần smart contract thử nghiệm trong dự án quyên góp của bạn.