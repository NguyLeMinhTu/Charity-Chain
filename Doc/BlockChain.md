# BLOCKCHAIN.md: Hướng Dẫn Phát Triển Phần Blockchain

## Giới Thiệu
Phần blockchain của dự án chịu trách nhiệm xây dựng và quản lý smart contract để xử lý các giao dịch quyên góp từ thiện. Chúng ta sử dụng Solidity để viết contract trên nền tảng Ethereum (hoặc tương đương như Binance Smart Chain cho phí thấp hơn). Công cụ chính là Hardhat để phát triển, test và deploy contract. Smart contract đảm bảo tính minh bạch: mọi donation được ghi nhận không thể thay đổi, và quỹ có thể được phân phối tự động khi đạt mục tiêu.

Lưu ý đặc biệt: Vì dự án này là phiên bản sử dụng thử (test/demo), chúng ta cần sử dụng coin hoặc token test để tránh chi phí thực tế. Sử dụng testnet (như Sepolia cho Ethereum) với test ETH (có thể lấy miễn phí từ faucet như sepoliafaucet.com). Nếu cần token tùy chỉnh, có thể tạo ERC20 token đơn giản cho donation (ví dụ: CharityToken) để test, nhưng bắt đầu với ETH native để đơn giản.

Mục tiêu: Xây dựng MVP smart contract hỗ trợ donation, query balance, và withdraw (với kiểm soát quyền hạn).

## Cấu Trúc Thư Mục
Cấu trúc thư mục cho phần blockchain được thiết kế riêng biệt để dễ quản lý, tập trung vào contract, scripts và tests. Dưới đây là chi tiết:

```
blockchain/
├── contracts/                # Thư mục chứa các file smart contract Solidity
│   └── DonationContract.sol  # Contract chính: Xử lý donation, balance, withdraw
├── scripts/                  # Scripts JavaScript để deploy và interact với contract
│   ├── deploy.js             # Script deploy contract lên testnet/mainnet
│   └── interact.js           # Script test interact (ví dụ: gọi hàm donate từ console)
├── tests/                    # Tests cho contract sử dụng Chai/Mocha
│   └── DonationContract.test.js  # File test unit cho contract
├── artifacts/                # Thư mục tự động tạo bởi Hardhat (build artifacts, ABI, bytecode)
│   └── (các file tự động)    # Không cần chỉnh sửa thủ công
├── cache/                    # Cache của Hardhat (tự động tạo)
├── hardhat.config.js         # File cấu hình Hardhat: Networks, solidity version, paths
├── .env                      # Biến môi trường: PRIVATE_KEY, RPC_URL (không commit lên Git)
├── package.json              # Dependencies: hardhat, @nomicfoundation/hardhat-toolbox, @openzeppelin/contracts (cho inheritance như Ownable)
└── README.md                 # Hướng dẫn nhanh cho phần blockchain
```

- **Giải thích**:
  - **contracts/**: Chứa code Solidity chính.
  - **scripts/**: Để automate deploy và test CLI.
  - **tests/**: Đảm bảo contract hoạt động đúng.
  - **hardhat.config.js**: Cấu hình networks (local, testnet), compiler version (ví dụ: Solidity 0.8.20).
  - Thư mục **artifacts/** và **cache/** tự động tạo khi compile, không cần thêm vào Git.

## Các Giai Đoạn Phát Triển
Quy trình phát triển theo mô hình Agile, với các giai đoạn chính. Mỗi giai đoạn mô tả file được tạo ra hoặc cập nhật. Thời gian tổng ước tính: 2-4 tuần cho phần blockchain. Tập trung vào testnet để sử dụng coin/token test (test ETH hoặc ERC20 test token).

1. **Lập Kế Hoạch và Thiết Kế (Planning & Design - 0.5-1 tuần)**:
   - **Mô tả**: Xác định yêu cầu contract: Hàm donate (nhận ETH/token), getBalance, withdraw (chỉ owner), event DonationReceived. Thiết kế pseudocode Solidity. Quyết định sử dụng native coin (ETH) hoặc token ERC20 cho donation test.
   - **File tạo ra**:
     - `hardhat.config.js`: Tạo file cơ bản với config default (networks: hardhat local, sepolia testnet).
     - `package.json`: Tạo và install dependencies (`npx hardhat init`, thêm `@openzeppelin/contracts` cho security features như Ownable).
     - `.env`: Tạo với biến như `SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY`, `PRIVATE_KEY=your_test_wallet_key`.
   - **File cập nhật**: Không có (giai đoạn khởi tạo).
   - **Lưu ý test**: Lấy test ETH từ faucet để chuẩn bị wallet.

2. **Phát Triển (Development - 1-2 tuần)**:
   - **Mô tả**: Viết code contract, scripts deploy. Nếu dùng token, tạo ERC20 contract đơn giản (CharityToken.sol) để mint test token.
   - **File tạo ra**:
     - `contracts/DonationContract.sol`: Viết contract chính, inherit Ownable từ OpenZeppelin. Thêm hàm: receive() cho native ETH, donate() nếu dùng token, withdraw().
     - `scripts/deploy.js`: Script sử dụng ethers.js để deploy contract (hardhat deploy).
     - Nếu dùng token: `contracts/CharityToken.sol` (ERC20 basic, mint 1 triệu token test cho owner).
   - **File cập nhật**:
     - `hardhat.config.js`: Cập nhật solidity version, thêm network sepolia với RPC và private key từ .env.
     - `package.json`: Cập nhật scripts như "deploy": "hardhat run scripts/deploy.js --network sepolia".
   - **Lưu ý test**: Compile contract (`npx hardhat compile`) để kiểm tra lỗi syntax. Sử dụng local hardhat network để test nhanh mà không cần test coin.

3. **Kiểm Tra (Testing - 0.5-1 tuần)**:
   - **Mô tả**: Viết unit tests để kiểm tra các hàm (donate, withdraw, events). Test với test coin/token trên local network.
   - **File tạo ra**:
     - `tests/DonationContract.test.js`: Sử dụng Chai để test (ví dụ: expect(balance).to.equal(0), test donate tăng balance).
     - Nếu dùng token: Thêm test cho mint và transfer token.
   - **File cập nhật**:
     - `contracts/DonationContract.sol`: Fix bug từ test (ví dụ: thêm modifier onlyOwner cho withdraw).
     - `hardhat.config.js`: Thêm plugins cho gas reporter hoặc coverage nếu cần.
   - **Lưu ý test**: Chạy `npx hardhat test`. Sử dụng test ETH trên local (hardhat cung cấp accounts giả với ETH unlimited). Nếu token, mint test token trong test setup.

4. **Triển Khai (Deployment - 0.5 tuần)**:
   - **Mô tả**: Deploy contract lên testnet, verify trên Etherscan để dễ query.
   - **File tạo ra**: Không mới, nhưng artifacts/ sẽ có ABI và address sau deploy.
   - **File cập nhật**:
     - `scripts/deploy.js`: Cập nhật để log contract address sau deploy.
     - `.env`: Cập nhật private key nếu cần.
     - `hardhat.config.js`: Thêm etherscan API key cho verify (`npx hardhat verify --network sepolia CONTRACT_ADDRESS`).
   - **Lưu ý test**: Deploy lên Sepolia với test ETH (phí gas thấp). Nếu dùng token, deploy CharityToken trước, sau đó pass address vào DonationContract constructor.

5. **Bảo Trì và Cải Tiến (Maintenance & Iteration - Liên tục)**:
   - **Mô tả**: Monitor contract trên testnet, fix bug, thêm features (ví dụ: multisig cho withdraw). Nếu mở rộng, tích hợp layer 2 cho phí thấp hơn.
   - **File tạo ra**:
     - `scripts/interact.js`: Script để gọi hàm từ console (ví dụ: donate test token).
   - **File cập nhật**:
     - `contracts/DonationContract.sol`: Thêm hàm mới (ví dụ: pause contract nếu cần).
     - `tests/*.test.js`: Cập nhật tests cho features mới.
     - `hardhat.config.js`: Thêm network mainnet khi sẵn sàng (nhưng giữ test cho dự án thử).
   - **Lưu ý test**: Sử dụng tools như Tenderly để simulate transaction với test coin. Audit contract bằng Slither hoặc Mythril trước bất kỳ update nào.

## Hướng Dẫn Sử Dụng
- **Compile**: `npx hardhat compile`.
- **Test**: `npx hardhat test`.
- **Deploy**: `npx hardhat run scripts/deploy.js --network sepolia` (sử dụng test ETH).
- **Interact**: Sử dụng ethers.js trong backend/frontend để gọi contract (ABI từ artifacts).
- **Token Test**: Nếu dùng CharityToken, mint test token cho wallet test (ví dụ: 1000 tokens) để donate.

## Bảo Mật và Lưu Ý
- Không deploy lên mainnet cho dự án thử; giữ ở testnet để tránh mất coin thực.
- Audit contract trước khi dùng thực tế (dù là test, để tránh bug).
- Gas Optimization: Sử dụng uint256 thay vì uint, tránh loop không cần thiết.
- Nếu cần token, bắt đầu với ERC20 basic; mint test token unlimited trên local/testnet.

Nếu cần code mẫu Solidity hoặc script, hãy tham khảo các file trong thư mục.