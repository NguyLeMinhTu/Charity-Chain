Dưới đây là nội dung mẫu để bạn đặt vào `client/README.md` cho phần frontend React/Vite.

***

# Frontend – Donation DApp (React + Vite)

Frontend là ứng dụng web cho người dùng tương tác với hệ thống quyên góp: xem/tạo chiến dịch, thực hiện donate, theo dõi lịch sử, kết nối ví và xem trạng thái giao dịch.[1][2]

***

## Mục tiêu

- Cung cấp giao diện SPA (Single Page Application) thân thiện để thao tác với backend API và smart contract.[3][1]
- Quản lý luồng: đăng nhập, quản lý chiến dịch, donate on‑chain, đồng bộ dữ liệu on‑chain / off‑chain.[4][5]

***

## Stack & cấu trúc thư mục

- Bundler: Vite + React.[6][1]
- Router: React Router (khuyến nghị).[2]
- HTTP client: fetch/axios.[3]
- Web3: ethers.js hoặc wagmi/viem (tùy chọn).[7][8]

Cấu trúc thư mục gợi ý:

```bash
client/
  index.html
  vite.config.js
  package.json
  .env
  src/
    main.jsx
    App.jsx
    routes/
      index.jsx
    pages/
      Home.jsx
      CampaignList.jsx
      CampaignDetail.jsx
      CreateCampaign.jsx
      MyDonations.jsx
      Login.jsx
      Register.jsx
    components/
      Layout/
        Navbar.jsx
        Footer.jsx
      Campaign/
        CampaignCard.jsx
        CampaignForm.jsx
      Donation/
        DonationList.jsx
        DonateButton.jsx
      Common/
        Loader.jsx
        ProtectedRoute.jsx
    services/
      api/
        axiosClient.js
        authApi.js
        campaignApi.js
        donationApi.js
      web3/
        web3Provider.js
        donationContract.js
    context/
      AuthContext.jsx
      CampaignContext.jsx     # nếu muốn
    hooks/
      useAuth.js
      useCampaigns.js
      useWeb3.js
    styles/
      index.css
    utils/
      format.js
      constants.js
```

***

## Cấu hình môi trường

Tạo file `.env` trong `client/`:

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_CHAIN_ID=11155111              # ví dụ: Sepolia
VITE_DONATION_CONTRACT_ADDRESS=0x...
```

Trong Vite, biến môi trường phía client phải bắt đầu bằng `VITE_`.[1]

***

## Giai đoạn 1 – Khởi tạo dự án & cấu hình cơ bản

### Mục tiêu

Tạo project React + Vite, cấu hình router, layout cơ bản.

### Các bước

1. Khởi tạo:

```bash
npm create vite@latest client -- --template react
cd client
npm install
```

2. Cài thêm dependencies:

```bash
npm install react-router-dom axios
# Nếu dùng ethers:
npm install ethers
```

3. Cấu hình entry `src/main.jsx`:

```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/index.css';
import { AuthProvider } from './context/AuthContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
```

4. Tạo layout cơ bản `src/App.jsx`:

```jsx
import Layout from './components/Layout/Layout';
import AppRoutes from './routes';

function App() {
  return (
    <Layout>
      <AppRoutes />
    </Layout>
  );
}

export default App;
```

5. Tạo `src/routes/index.jsx`:

```jsx
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import CampaignList from '../pages/CampaignList';
import CampaignDetail from '../pages/CampaignDetail';
import CreateCampaign from '../pages/CreateCampaign';
import MyDonations from '../pages/MyDonations';
import Login from '../pages/Login';
import Register from '../pages/Register';
import ProtectedRoute from '../components/Common/ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/campaigns" element={<CampaignList />} />
      <Route path="/campaigns/:id" element={<CampaignDetail />} />
      <Route
        path="/campaigns/create"
        element={
          <ProtectedRoute>
            <CreateCampaign />
          </ProtectedRoute>
        }
      />
      <Route
        path="/me/donations"
        element={
          <ProtectedRoute>
            <MyDonations />
          </ProtectedRoute>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}
```

6. Tạo `Layout` cơ bản:

`src/components/Layout/Navbar.jsx`:

```jsx
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Donation DApp</Link>
      <Link to="/campaigns">Campaigns</Link>
      {user && <Link to="/campaigns/create">Create Campaign</Link>}
      {user && <Link to="/me/donations">My Donations</Link>}
      {!user && <Link to="/login">Login</Link>}
      {!user && <Link to="/register">Register</Link>}
      {user && <button onClick={logout}>Logout</button>}
    </nav>
  );
}
```

`src/components/Layout/Layout.jsx`:

```jsx
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="app">
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
```

### Checklist Giai đoạn 1

- [ ] `npm run dev` chạy được, chuyển trang giữa các route không lỗi.  
- [ ] Navbar hiển thị và điều hướng cơ bản hoạt động.  

***

## Giai đoạn 2 – Tích hợp API backend (auth, campaign, donation)

### Mục tiêu

Xây tầng `services/api` để giao tiếp với backend Express + MongoDB.[2][3]

### Các bước

1. Tạo `src/services/api/axiosClient.js`:

```js
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default axiosClient;
```

2. Tạo `src/services/api/authApi.js`:

```js
import axiosClient from './axiosClient';

const authApi = {
  register(data) {
    return axiosClient.post('/auth/register', data);
  },
  login(data) {
    return axiosClient.post('/auth/login', data);
  },
  me() {
    return axiosClient.get('/auth/me');
  }
};

export default authApi;
```

3. Tạo `src/services/api/campaignApi.js`:

```js
import axiosClient from './axiosClient';

const campaignApi = {
  getAll() {
    return axiosClient.get('/campaigns');
  },
  getById(id) {
    return axiosClient.get(`/campaigns/${id}`);
  },
  create(data) {
    return axiosClient.post('/campaigns', data);
  },
  updateStatus(id, status) {
    return axiosClient.patch(`/campaigns/${id}/status`, { status });
  }
};

export default campaignApi;
```

4. Tạo `src/services/api/donationApi.js`:

```js
import axiosClient from './axiosClient';

const donationApi = {
  create(data) {
    return axiosClient.post('/donations', data);
  },
  getByCampaign(campaignId) {
    return axiosClient.get(`/donations/campaign/${campaignId}`);
  },
  getMyDonations() {
    return axiosClient.get('/donations/me');
  }
};

export default donationApi;
```

### Checklist Giai đoạn 2

- [ ] Gọi `authApi.login` với tài khoản hợp lệ trả về token.  
- [ ] `campaignApi.getAll` trả về danh sách từ backend.  
- [ ] `donationApi.getByCampaign` trả về danh sách donation khi backend đã có dữ liệu.

***

## Giai đoạn 3 – Quản lý Auth (Context + ProtectedRoute)

### Mục tiêu

Quản lý trạng thái đăng nhập ở frontend, bảo vệ route cần login.[9][2]

### Các bước

1. Tạo `src/context/AuthContext.jsx`:

```jsx
import { createContext, useEffect, useState } from 'react';
import authApi from '../services/api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const { data } = await authApi.me();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (credentials) => {
    const { data } = await authApi.login(credentials);
    localStorage.setItem('access_token', data.token);
    setUser(data.user);
  };

  const register = async (payload) => {
    const { data } = await authApi.register(payload);
    localStorage.setItem('access_token', data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}
```

2. Tạo hook `src/hooks/useAuth.js`:

```js
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

export const useAuth = () => useContext(AuthContext);
```

3. Tạo `src/components/Common/ProtectedRoute.jsx`:

```jsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
```

4. Dùng `useAuth` trong `Login`, `Register` để gọi `login`/`register`.

### Checklist Giai đoạn 3

- [ ] Khi login thành công, token được lưu và `AuthContext.user` cập nhật.  
- [ ] Route `/campaigns/create`, `/me/donations` chỉ truy cập khi đã đăng nhập.  
- [ ] Logout xoá token, user trở về null.

***

## Giai đoạn 4 – Màn hình Campaign (list/detail/create)

### Mục tiêu

Xây UI chính cho chiến dịch: danh sách, chi tiết, tạo mới.[10][4]

### Các bước

1. `src/pages/CampaignList.jsx`:

- Gọi `campaignApi.getAll()` để lấy danh sách.  
- Hiển thị bằng `CampaignCard`.

2. `src/components/Campaign/CampaignCard.jsx`:

- Nhận `campaign` props, hiển thị: title, owner name, goal, raised (có thể lấy từ backend hoặc tạm thời).  
- Link tới `/campaigns/:id`.

3. `src/pages/CampaignDetail.jsx`:

- Lấy `id` từ URL params.  
- Gọi `campaignApi.getById(id)` và `donationApi.getByCampaign(id)`.  
- Hiển thị thông tin chiến dịch + danh sách donation (`DonationList`).  
- Có `DonateButton` để mở luồng donate on‑chain.

4. `src/pages/CreateCampaign.jsx`:

- Form nhập title, description, imageUrl, goalAmount.  
- Submit gọi `campaignApi.create`.  
- Có thể redirect sang `/campaigns/:id` sau khi tạo.

### Checklist Giai đoạn 4

- [ ] `/campaigns` hiển thị đầy đủ danh sách từ backend.  
- [ ] Trang chi tiết hiển thị thông tin và lịch sử donation.  
- [ ] Tạo chiến dịch mới thành công và lưu được ở backend.

***

## Giai đoạn 5 – Tích hợp Web3 (kết nối ví & donate on‑chain)

### Mục tiêu

Cho phép người dùng kết nối ví (MetaMask) và gửi giao dịch `donate` tới smart contract test.[8][7]

### Các bước

1. Tạo `src/services/web3/web3Provider.js`:

```js
import { ethers } from 'ethers';

export const getProvider = () => {
  if (!window.ethereum) throw new Error('No crypto wallet found');
  return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  await provider.send('eth_requestAccounts', []);
  return provider.getSigner();
};
```

2. Tạo `src/services/web3/donationContract.js`:

```js
import { ethers } from 'ethers';
import { getProvider, getSigner } from './web3Provider';
import donationAbi from '../../abi/Donation.json'; // export ABI từ artifacts

const CONTRACT_ADDRESS = import.meta.env.VITE_DONATION_CONTRACT_ADDRESS;

export const getDonationContractRead = async () => {
  const provider = getProvider();
  return new ethers.Contract(CONTRACT_ADDRESS, donationAbi.abi, provider);
};

export const getDonationContractWrite = async () => {
  const signer = await getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, donationAbi.abi, signer);
};
```

3. Tạo hook `src/hooks/useWeb3.js`:

```js
import { useState } from 'react';
import { getDonationContractWrite } from '../services/web3/donationContract';

export const useWeb3 = () => {
  const [txPending, setTxPending] = useState(false);

  const donateOnChain = async (campaignId, amountInEth) => {
    const contract = await getDonationContractWrite();
    const value = window.ethers
      ? window.ethers.parseEther(amountInEth.toString())
      : null;

    setTxPending(true);
    try {
      const tx = await contract.donate(campaignId, {
        value
      });
      const receipt = await tx.wait();
      setTxPending(false);
      return { tx, receipt };
    } catch (err) {
      setTxPending(false);
      throw err;
    }
  };

  return { donateOnChain, txPending };
};
```

4. Tạo `DonateButton` trong `src/components/Donation/DonateButton.jsx`:

```jsx
import { useState } from 'react';
import { useWeb3 } from '../../hooks/useWeb3';
import donationApi from '../../services/api/donationApi';
import { useAuth } from '../../hooks/useAuth';

export default function DonateButton({ campaign }) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const { donateOnChain, txPending } = useWeb3();
  const { user } = useAuth();

  const handleDonate = async () => {
    if (!amount) return;

    setLoading(true);
    try {
      // 1. Gửi transaction on-chain
      const { tx, receipt } = await donateOnChain(
        campaign.campaignIdOnChain ?? 0,
        amount
      );

      // 2. Gửi thông tin sang backend
      await donationApi.create({
        campaignId: campaign._id,
        amount: Number(amount),
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        chainId: Number(import.meta.env.VITE_CHAIN_ID),
        donorWallet: user?.walletAddress
      });

      // TODO: hiển thị thông báo thành công, reload danh sách donation
    } catch (err) {
      // TODO: xử lý lỗi / hiển thị thông báo
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        type="number"
        min="0"
        step="0.001"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount (ETH)"
      />
      <button onClick={handleDonate} disabled={loading || txPending}>
        {loading || txPending ? 'Processing...' : 'Donate'}
      </button>
    </div>
  );
}
```

> Lưu ý: cần map `campaign.campaignIdOnChain` với `campaignId` trên contract như mô tả trong phần backend/blockchain.

### Checklist Giai đoạn 5

- [ ] MetaMask có thể kết nối, user ký giao dịch donate.  
- [ ] Sau khi donate thành công, backend có record donation với `txHash`.  
- [ ] Số tiền hiển thị ở UI khớp với dữ liệu backend (và contract nếu bạn cũng đọc trực tiếp on‑chain).

***

## Giai đoạn 6 – UX, error handling, loading, bảo mật

### Mục tiêu

Hoàn thiện trải nghiệm người dùng và xử lý lỗi hợp lý.[11][2]

### Các bước

- Thêm component `Loader`, hiển thị khi gọi API hoặc chờ transaction.  
- Hiển thị message lỗi (form validation, lỗi API, lỗi transaction).  
- Xử lý state khi token hết hạn (logout tự động, điều hướng tới login).  
- Chia nhỏ component để dễ tái sử dụng.

### Checklist Giai đoạn 6

- [ ] Người dùng luôn thấy trạng thái (loading/error/success) rõ ràng.  
- [ ] Lỗi gọi API / transaction được hiển thị thân thiện.  
- [ ] Redirect hợp lý khi chưa đăng nhập.

***

## Tính năng mở rộng (Frontend)

Khi core flow đã ổn, có thể bổ sung:

- **Bộ lọc & tìm kiếm chiến dịch**  
  - Filter theo category, tổ chức, mục tiêu, số tiền đã đạt.  

- **Trang dashboard cá nhân**  
  - Thống kê số tiền đã donate, lịch sử, các campaign đã tạo.  

- **Hiển thị dữ liệu on‑chain trực tiếp**  
  - Đọc trực tiếp `raisedAmount` từ contract để so sánh với dữ liệu backend.  

- **Hỗ trợ nhiều mạng**  
  - UI cho phép chọn mạng (testnet khác nhau), hiển thị warning nếu người dùng ở sai network.  

- **Thiết kế UI/UX nâng cao**  
  - Dùng UI library (MUI, Ant Design, Chakra UI, Tailwind) để giao diện đẹp hơn.  

***

## Chạy frontend

```bash
cd client
npm install
npm run dev
```

- Ứng dụng sẽ chạy ở `http://localhost:5173` (mặc định Vite).  
- Đảm bảo `VITE_API_BASE_URL` trỏ đúng tới backend (`http://localhost:5000/api`).