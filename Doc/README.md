# Dự Án: Website Quyên Góp Từ Thiện Sử Dụng Blockchain

## Giới Thiệu
Dự án này xây dựng một nền tảng web cho phép người dùng quyên góp từ thiện một cách minh bạch và an toàn bằng công nghệ blockchain. Các giao dịch quyên góp sẽ được ghi nhận trên blockchain để đảm bảo tính không thể thay đổi, theo dõi dễ dàng và loại bỏ trung gian không cần thiết. Dự án bao gồm:

- **Frontend**: Giao diện người dùng thân thiện để quyên góp, xem chiến dịch và theo dõi tiến độ.
- **Backend**: Xử lý logic server, API và tích hợp với database cũng như blockchain.
- **Blockchain**: Smart contract để quản lý quỹ quyên góp.
- **Database**: Lưu trữ metadata như thông tin chiến dịch và người dùng.

Mục tiêu: Tạo ra một MVP (Minimum Viable Product) để chứng minh tính khả thi, sau đó có thể mở rộng.

## Công Nghệ Sử Dụng
- **Blockchain**: Ethereum (hoặc tương đương như Solana), Solidity cho smart contract, Hardhat cho phát triển và test.
- **Backend**: Node.js với Express.js, Mongoose cho kết nối MongoDB, Web3.js hoặc Ethers.js để interact với blockchain.
- **Frontend**: React.js, React Router cho navigation, Ethers.js cho kết nối wallet (ví dụ: MetaMask), Axios cho API calls.
- **Database**: MongoDB (local hoặc cloud như Atlas).
- **Công cụ khác**: Git cho version control, Docker cho containerization (tùy chọn), Jest cho testing backend, React Testing Library cho frontend.

## Yêu Cầu Hệ Thống
- Node.js >= 18.x
- Yarn hoặc NPM
- MongoDB (cài local hoặc sử dụng dịch vụ cloud)
- Tài khoản Ethereum testnet (ví dụ: Sepolia) với ETH test để deploy contract.
- MetaMask hoặc wallet tương tự để test quyên góp.

## Hướng Dẫn Cài Đặt
1. **Clone repository**:
   ```
   git clone <url-repo-cua-ban>
   cd project-root
   ```

2. **Cài đặt dependencies**:
   - Đối với backend:
     ```
     cd backend
     npm install
     ```
   - Đối với frontend:
     ```
     cd frontend
     npm install
     ```
   - Đối với blockchain:
     ```
     cd blockchain
     npm install
     ```

3. **Cấu hình môi trường**:
   - Tạo file `.env` trong từng thư mục dựa trên mẫu (nếu có):
     - Backend: `DB_URI=mongodb://localhost:27017/donationdb`, `ETH_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY`, `PRIVATE_KEY=your_private_key`.
     - Frontend: `REACT_APP_API_URL=http://localhost:5000`, `REACT_APP_CONTRACT_ADDRESS=0x...`.
     - Blockchain: Cấu hình trong `hardhat.config.js`.

4. **Khởi động database**:
   - Nếu dùng local: Chạy MongoDB daemon (`mongod`).

## Hướng Dẫn Chạy Dự Án
1. **Blockchain**:
   - Compile và deploy smart contract:
     ```
     cd blockchain
     npx hardhat compile
     npx hardhat run scripts/deploy.js --network sepolia
     ```
   - Lưu address contract để dùng ở backend/frontend.

2. **Backend**:
   ```
   cd backend
   npm start
   ```
   - Server chạy tại `http://localhost:5000`.

3. **Frontend**:
   ```
   cd frontend
   npm start
   ```
   - App chạy tại `http://localhost:3000`.

4. **Test**:
   - Backend: `npm test`.
   - Frontend: `npm test`.
   - Blockchain: `npx hardhat test`.

## Cấu Trúc Thư Mục
```
project-root/
├── backend/                  # Backend logic và API
│   ├── src/                  # Mã nguồn
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── middleware/
│   │   ├── config/
│   │   └── app.js
│   ├── tests/
│   ├── .env
│   └── package.json
├── frontend/                 # Frontend UI
│   ├── src/                  # Mã nguồn
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── assets/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   ├── public/
│   ├── tests/
│   ├── .env
│   └── package.json
├── blockchain/               # Smart contracts
│   ├── contracts/
│   ├── scripts/
│   ├── tests/
│   ├── hardhat.config.js
│   └── package.json
├── docs/                     # Tài liệu
├── .gitignore
└── README.md                 # File này
```

## Tính Năng Chính
- Tạo và quản lý chiến dịch từ thiện.
- Quyên góp qua wallet crypto (hiển thị real-time balance trên blockchain).
- Dashboard theo dõi tiến độ (tích hợp event listener từ blockchain).
- Authentication cơ bản cho admin/user.

## Bảo Mật và Lưu Ý
- Không lưu private key trên server; sử dụng ví client-side cho donate.
- Audit smart contract trước deploy mainnet (sử dụng tools như Slither).
- Phí gas: Sử dụng testnet để phát triển, optimize code để giảm chi phí.
- Pháp lý: Đảm bảo tuân thủ quy định về từ thiện và cryptocurrency tại Việt Nam.

## Đóng Góp
- Fork repo và tạo pull request.
- Báo issue nếu phát hiện bug.

## Liên Hệ
- Tác giả: [Tên của bạn]
- Email: [email@example.com]

Dự án này là mã nguồn mở dưới giấy phép MIT.