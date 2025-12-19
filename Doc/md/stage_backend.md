Dưới đây là nội dung hoàn chỉnh để bạn đặt vào file `README.md` cho backend server.

***

# Backend Server – Donation DApp (Express + MongoDB)

Backend này phục vụ cho web quyên góp sử dụng blockchain, cung cấp REST API để quản lý người dùng, chiến dịch quyên góp, lịch sử quyên góp và tích hợp với smart contract on‑chain.

## Mục tiêu

- Cung cấp API bảo mật cho frontend (React/Vite) và các client khác.  
- Lưu trữ dữ liệu off‑chain (user, campaign, donation, thống kê) trong MongoDB.  
- Hỗ trợ tích hợp với blockchain (smart contract) để đảm bảo minh bạch giao dịch.

***

## Cấu trúc thư mục

```bash
server/
  package.json
  .env
  src/
    app.js
    server.js
    config/
      db.js
    models/
      User.js
      Campaign.js
      Donation.js
    routes/
      authRoutes.js
      campaignRoutes.js
      donationRoutes.js
    controllers/
      authController.js
      campaignController.js
      donationController.js
    middlewares/
      authMiddleware.js
      errorMiddleware.js
    services/
      blockchainService.js   # (tuỳ chọn, cho việc lắng nghe event on-chain)
    utils/
      # helper, logger, constants (nếu cần)
```

***

## Yêu cầu hệ thống

- Node.js (phiên bản LTS).  
- MongoDB (local hoặc MongoDB Atlas).  
- Công cụ quản lý package: npm hoặc yarn.  
- Biến môi trường cho JWT và kết nối MongoDB.

***

## Cấu hình môi trường

Tạo file `.env` ở thư mục `server/`:

```env
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster/dbname
JWT_SECRET=your_jwt_secret
# Các biến khác cho blockchain nếu cần
# RPC_URL=...
# CONTRACT_ADDRESS=...
```

***

## Giai đoạn 1 – Khởi tạo dự án & cấu hình cơ bản

### Mục tiêu

Tạo skeleton backend với Express, cấu trúc thư mục rõ ràng, kết nối được tới MongoDB.

### Các bước

1. Khởi tạo project:

```bash
mkdir server
cd server
npm init -y
```

2. Cài dependencies:

```bash
npm install express mongoose dotenv cors morgan
npm install --save-dev nodemon
```

3. Tạo cấu trúc thư mục như phần “Cấu trúc thư mục”.

4. Tạo file `src/app.js`:

```js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = app;
```

5. Tạo file `src/config/db.js`:

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('MongoDB connected');
};

module.exports = connectDB;
```

6. Tạo file `src/server.js`:

```js
require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
```

7. Cập nhật `package.json`:

```json
"scripts": {
  "dev": "nodemon src/server.js",
  "start": "node src/server.js"
}
```

### Checklist Giai đoạn 1

- [ ] Chạy `npm run dev` không lỗi.  
- [ ] `GET /api/health` trả `{ "status": "ok" }`.  
- [ ] Log “MongoDB connected” xuất hiện khi khởi động.

***

## Giai đoạn 2 – Thiết kế model & schema MongoDB

### Mục tiêu

Định nghĩa các model: `User`, `Campaign`, `Donation`.

### Các bước

1. Tạo file `src/models/User.js`:

```js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    walletAddress: { type: String },
    role: { type: String, enum: ['donor', 'org', 'admin'], default: 'donor' }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', userSchema);
```

2. Cài thêm dependencies:

```bash
npm install bcryptjs jsonwebtoken
```

3. Tạo file `src/models/Campaign.js`:

```js
const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    imageUrl: { type: String },
    goalAmount: { type: Number, required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['active', 'closed'], default: 'active' },
    chainId: { type: Number },
    contractAddress: { type: String },
    campaignIdOnChain: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Campaign', campaignSchema);
```

4. Tạo file `src/models/Donation.js`:

```js
const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema(
  {
    campaign: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donorWallet: { type: String },
    amount: { type: Number, required: true },
    txHash: { type: String, required: true, unique: true },
    blockNumber: { type: Number },
    chainId: { type: Number }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
```

### Checklist Giai đoạn 2

- [ ] Model `User`, `Campaign`, `Donation` tạo được document test không lỗi.  
- [ ] Các field cơ bản và quan hệ (ref) đúng với nghiệp vụ.

***

## Giai đoạn 3 – Module Auth (đăng ký / đăng nhập)

### Mục tiêu

Xây API auth sử dụng JWT: đăng ký, đăng nhập, lấy thông tin user hiện tại.

### Các bước

1. Tạo middleware `src/middlewares/authMiddleware.js`:

```js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};

module.exports = auth;
```

2. Tạo controller `src/controllers/authController.js`:

```js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  const { email, password, name, walletAddress, role } = req.body;
  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ message: 'Email already used' });

  const user = await User.create({ email, password, name, walletAddress, role });
  const token = generateToken(user._id);
  res.status(201).json({
    token,
    user: { id: user._id, email, name, role, walletAddress }
  });
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await user.comparePassword(password))) {
    return res.status(400).json({ message: 'Invalid credentials' });
  }
  const token = generateToken(user._id);
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      walletAddress: user.walletAddress
    }
  });
};

exports.me = async (req, res) => {
  res.json({ user: req.user });
};
```

3. Tạo route `src/routes/authRoutes.js`:

```js
const router = require('express').Router();
const { register, login, me } = require('../controllers/authController');
const auth = require('../middlewares/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, me);

module.exports = router;
```

4. Gắn route vào `src/app.js`:

```js
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);
```

### Checklist Giai đoạn 3

- [ ] `POST /api/auth/register` tạo user, trả token.  
- [ ] `POST /api/auth/login` trả token với user hợp lệ.  
- [ ] `GET /api/auth/me` (Bearer token) trả thông tin user hiện tại.

***

## Giai đoạn 4 – Module Campaign (CRUD chiến dịch)

### Mục tiêu

Cung cấp API quản lý chiến dịch: tạo, xem danh sách, chi tiết, cập nhật trạng thái.

### Các bước

1. Tạo controller `src/controllers/campaignController.js`:

```js
const Campaign = require('../models/Campaign');

exports.createCampaign = async (req, res) => {
  const { title, description, imageUrl, goalAmount, chainId } = req.body;
  const campaign = await Campaign.create({
    title,
    description,
    imageUrl,
    goalAmount,
    chainId,
    owner: req.user._id
  });
  res.status(201).json(campaign);
};

exports.getCampaigns = async (req, res) => {
  const campaigns = await Campaign.find().populate('owner', 'name');
  res.json(campaigns);
};

exports.getCampaignById = async (req, res) => {
  const campaign = await Campaign.findById(req.params.id).populate('owner', 'name');
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
  res.json(campaign);
};

exports.updateCampaignStatus = async (req, res) => {
  const { status } = req.body;
  const campaign = await Campaign.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    { status },
    { new: true }
  );
  if (!campaign) {
    return res.status(404).json({ message: 'Campaign not found or not owner' });
  }
  res.json(campaign);
};
```

2. Tạo route `src/routes/campaignRoutes.js`:

```js
const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const {
  createCampaign,
  getCampaigns,
  getCampaignById,
  updateCampaignStatus
} = require('../controllers/campaignController');

router.get('/', getCampaigns);
router.get('/:id', getCampaignById);
router.post('/', auth, createCampaign);
router.patch('/:id/status', auth, updateCampaignStatus);

module.exports = router;
```

3. Gắn route vào `src/app.js`:

```js
const campaignRoutes = require('./routes/campaignRoutes');
app.use('/api/campaigns', campaignRoutes);
```

### Checklist Giai đoạn 4

- [ ] `GET /api/campaigns` trả danh sách chiến dịch.  
- [ ] `GET /api/campaigns/:id` trả chi tiết.  
- [ ] `POST /api/campaigns` (Bearer token) tạo chiến dịch.  
- [ ] `PATCH /api/campaigns/:id/status` chỉ owner có thể đổi trạng thái.

***

## Giai đoạn 5 – Module Donation & tích hợp blockchain (off‑chain)

### Mục tiêu

Lưu lịch sử donate off‑chain, chuẩn bị tích hợp với smart contract.

### Các bước

1. Tạo controller `src/controllers/donationController.js`:

```js
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

exports.createDonationRecord = async (req, res) => {
  const { campaignId, amount, txHash, blockNumber, chainId, donorWallet } = req.body;

  const campaign = await Campaign.findById(campaignId);
  if (!campaign) return res.status(404).json({ message: 'Campaign not found' });

  const donation = await Donation.create({
    campaign: campaignId,
    donor: req.user ? req.user._id : undefined,
    donorWallet: donorWallet || req.user?.walletAddress,
    amount,
    txHash,
    blockNumber,
    chainId
  });

  res.status(201).json(donation);
};

exports.getDonationsByCampaign = async (req, res) => {
  const donations = await Donation.find({ campaign: req.params.campaignId })
    .sort({ createdAt: -1 })
    .populate('donor', 'name');
  res.json(donations);
};

exports.getDonationsByUser = async (req, res) => {
  const donations = await Donation.find({ donor: req.user._id })
    .sort({ createdAt: -1 })
    .populate('campaign', 'title');
  res.json(donations);
};
```

2. Tạo route `src/routes/donationRoutes.js`:

```js
const router = require('express').Router();
const auth = require('../middlewares/authMiddleware');
const {
  createDonationRecord,
  getDonationsByCampaign,
  getDonationsByUser
} = require('../controllers/donationController');

router.post('/', auth, createDonationRecord);
router.get('/campaign/:campaignId', getDonationsByCampaign);
router.get('/me', auth, getDonationsByUser);

module.exports = router;
```

3. Gắn route vào `src/app.js`:

```js
const donationRoutes = require('./routes/donationRoutes');
app.use('/api/donations', donationRoutes);
```

4. (Tuỳ chọn) Tạo `src/services/blockchainService.js` để:
   - Kết nối RPC node (ethers.js/web3.js).  
   - Lắng nghe event `Donated` từ smart contract.  
   - Khi có event mới, tự động tạo `Donation` trong MongoDB.

### Checklist Giai đoạn 5

- [ ] `POST /api/donations` (Bearer token) lưu record với `txHash`.  
- [ ] `GET /api/donations/campaign/:campaignId` trả lịch sử donate theo chiến dịch.  
- [ ] `GET /api/donations/me` trả lịch sử donate của user hiện tại.  
- [ ] (Nếu có) Service blockchain có thể tạo record từ event.

***

## Giai đoạn 6 – Error handling, validation, security

### Mục tiêu

Chuẩn hóa lỗi, validate input và tăng cường bảo mật.

### Các bước

1. Tạo middleware `src/middlewares/errorMiddleware.js`:

```js
const errorHandler = (err, req, res, next) => {
  console.error(err);
  const status = err.statusCode || 500;
  res.status(status).json({ message: err.message || 'Server Error' });
};

module.exports = errorHandler;
```

2. Gắn vào cuối `src/app.js`:

```js
const errorHandler = require('./middlewares/errorMiddleware');
app.use(errorHandler);
```

3. Thêm validation:
   - Cài `express-validator` hoặc Joi/Yup.  
   - Validate body cho các endpoint: email, password, goalAmount, amount, v.v.

4. Bảo mật:
   - Cấu hình CORS (chỉ cho phép origin frontend trong production).  
   - Không log JWT/secret.  
   - Dùng HTTPS trên môi trường thật.

### Checklist Giai đoạn 6

- [ ] Lỗi trả về dạng JSON thống nhất, có HTTP status phù hợp.  
- [ ] Request với input sai bị chặn / báo lỗi rõ ràng.  
- [ ] CORS, dotenv, log được cấu hình hợp lý.

***

## Giai đoạn 7 – Production & Deploy

### Mục tiêu

Chuẩn bị để deploy backend lên môi trường thật.

### Các bước

- Đảm bảo `npm run start` chạy ổn.  
- Cấu hình biến môi trường trên server (PORT, MONGODB_URI, JWT_SECRET, RPC_URL, CONTRACT_ADDRESS, …).  
- Dùng MongoDB Atlas hoặc instance sản xuất.  
- Thiết lập healthcheck (`/api/health`).  
- Cấu hình log (ví dụ kết hợp với PM2 hoặc hệ thống log ngoài).

### Checklist Giai đoạn 7

- [ ] Backend chạy ổn định ở production, không dùng nodemon.  
- [ ] Kết nối được DB sản xuất.  
- [ ] Healthcheck pass.

***

## Tính năng mở rộng (Backend)

Sau khi backend cơ bản hoàn thành, có thể mở rộng:

- **Phân quyền nâng cao**  
  - Middleware kiểm tra `role` để phân quyền: admin, org, donor.  
  - API quản trị: duyệt chiến dịch, khoá user, xem báo cáo.

- **Thống kê & báo cáo**  
  - Endpoint thống kê: tổng tiền raise theo khoảng thời gian, top campaign, top donor.  
  - Dashboard cho admin/tổ chức.

- **Webhooks, email, background jobs**  
  - Gửi email cảm ơn sau mỗi donation.  
  - Nhắc nhở chiến dịch sắp hết hạn.  
  - Sync định kỳ dữ liệu từ blockchain (nếu có nhiều node).

- **Realtime (Socket.io)**  
  - Cập nhật realtime tổng donate trên trang chi tiết campaign khi có donation mới.  

- **Caching & tối ưu hiệu năng**  
  - Dùng Redis để cache thống kê nặng, danh sách campaign phổ biến.  

- **Audit & logging nâng cao**  
  - Lưu audit log cho thao tác quan trọng: cập nhật campaign, thay đổi role, v.v.  
  - Tích hợp hệ thống log bên ngoài (ELK stack, Cloud logging).

***

## Chạy Backend

```bash
cd server
npm install
npm run dev   # môi trường phát triển
# hoặc
npm run start # môi trường production
```

API sẽ chạy trên `http://localhost:<PORT>` (mặc định 5000 nếu không set `PORT`).