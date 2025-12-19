# FRONTEND.md: Hướng Dẫn Phát Triển Frontend

## Giới Thiệu
Phần frontend của dự án là giao diện người dùng (UI) được xây dựng bằng React.js, nhằm cung cấp trải nghiệm thân thiện, responsive (hỗ trợ mobile/desktop) và tích hợp trực tiếp với blockchain (qua wallet như MetaMask). Frontend sẽ gọi API từ backend để lấy dữ liệu metadata (từ DB) và interact trực tiếp với smart contract để thực hiện quyên góp.

Mục tiêu: Xây dựng các trang chính để người dùng dễ dàng quyên góp và theo dõi từ thiện một cách minh bạch. Sử dụng các thư viện như React Router cho navigation, Ethers.js cho blockchain, Axios cho API calls, và Tailwind CSS/Bootstrap cho styling.

## Yêu Cầu Chung Cho Các Trang
- **Responsive Design**: Sử dụng media queries để hỗ trợ các thiết bị khác nhau.
- **Tích Hợp Wallet**: Hầu hết các trang liên quan đến quyên góp cần kết nối MetaMask (hoặc tương tự) để sign transaction.
- **Real-time Update**: Sử dụng polling hoặc WebSocket để cập nhật dữ liệu từ blockchain (ví dụ: tiến độ quỹ).
- **Bảo Mật**: Không lưu private key; tất cả transaction diễn ra client-side.
- **Localization**: Chuẩn bị cho đa ngôn ngữ (sử dụng i18n nếu cần, mặc định tiếng Việt và tiếng Anh).
- **Error Handling**: Hiển thị thông báo lỗi thân thiện (ví dụ: "Kết nối wallet thất bại").

## Các Trang Giao Diện Phải Có (Core Pages)
Đây là các trang thiết yếu để MVP hoạt động. Chúng được định nghĩa trong thư mục `frontend/src/pages/` và sử dụng React Router để route.

1. **Trang Chủ (Home Page - /)**:
   - **Mô tả**: Trang chính hiển thị danh sách các chiến dịch từ thiện đang diễn ra. Người dùng có thể tìm kiếm, lọc theo loại (ví dụ: giáo dục, y tế).
   - **Tính năng chính**:
     - Carousel hoặc grid hiển thị top campaigns (tên, mô tả ngắn, tiến độ % đạt mục tiêu, số tiền hiện tại từ blockchain).
     - Nút "Quyên góp ngay" dẫn đến trang chi tiết.
     - Header với navigation bar (Home, Campaigns, About, Login).
     - Footer với thông tin dự án.
   - **Dữ liệu nguồn**: Gọi API backend để fetch campaigns, sau đó query blockchain để lấy balance real-time.
   - **Components**: CampaignCard, SearchBar.

2. **Trang Danh Sách Chiến Dịch (Campaigns List - /campaigns)**:
   - **Mô tả**: Trang liệt kê tất cả chiến dịch, với phân trang và lọc nâng cao.
   - **Tính năng chính**:
     - Grid hoặc list view với filters (theo loại, tiến độ, thời gian).
     - Mỗi item hiển thị: Hình ảnh, tiêu đề, mục tiêu, số tiền hiện tại (từ smart contract), nút "Xem chi tiết".
   - **Dữ liệu nguồn**: API backend cho metadata, blockchain cho dữ liệu tài chính.
   - **Components**: CampaignList, FilterSidebar.

3. **Trang Chi Tiết Chiến Dịch (Campaign Detail - /campaigns/:id)**:
   - **Mô tả**: Trang xem thông tin chi tiết một chiến dịch cụ thể.
   - **Tính năng chính**:
     - Hiển thị mô tả đầy đủ, hình ảnh, video (nếu có).
     - Progress bar cho tiến độ quỹ (query blockchain).
     - Lịch sử quyên góp (danh sách transactions từ blockchain explorer như Etherscan).
     - Nút "Quyên góp" dẫn đến form donate.
     - Phần bình luận hoặc chia sẻ (tích hợp social nếu cần).
   - **Dữ liệu nguồn**: API backend cho chi tiết, blockchain cho transactions.
   - **Components**: ProgressBar, TransactionList.

4. **Trang Quyên Góp (Donation Page - /donate/:campaignId)**:
   - **Mô tả**: Trang form để thực hiện quyên góp, có thể là modal hoặc trang riêng.
   - **Tính năng chính**:
     - Kết nối wallet (MetaMask).
     - Input số tiền (ETH hoặc token), preview phí gas.
     - Nút "Xác nhận quyên góp" để sign và gửi transaction đến smart contract.
     - Thông báo success/fail, redirect về trang chi tiết sau khi hoàn tất.
   - **Dữ liệu nguồn**: Interact trực tiếp với smart contract qua Ethers.js.
   - **Components**: WalletConnectButton, DonationForm.

5. **Trang Đăng Nhập/Đăng Ký (Authentication - /login và /register)**:
   - **Mô tả**: Trang cho user đăng nhập/đăng ký để quản lý tài khoản (không bắt buộc cho donate, nhưng cần cho admin tạo campaign).
   - **Tính năng chính**:
     - Form email/password, hoặc OAuth (Google/Wallet connect).
     - Redirect đến dashboard sau login.
   - **Dữ liệu nguồn**: API backend cho auth (JWT token).
   - **Components**: AuthForm.

6. **Trang Dashboard (Dashboard - /dashboard)**:
   - **Mô tả**: Trang cá nhân cho user/admin.
   - **Tính năng chính**:
     - Đối với user: Xem lịch sử quyên góp, tổng đóng góp.
     - Đối với admin: Tạo/mở rộng campaign, rút quỹ (nếu đạt mục tiêu), xem analytics.
     - Protected route (yêu cầu login).
   - **Dữ liệu nguồn**: API backend cho user data, blockchain cho lịch sử.
   - **Components**: UserHistory, AdminPanel.

## Các Trang Giao Diện Có Thể Mở Rộng (Expansion Pages)
Những trang này không bắt buộc cho MVP nhưng có thể thêm để nâng cao trải nghiệm, tùy theo nhu cầu mở rộng dự án. Chúng có thể được triển khai ở giai đoạn sau.

1. **Trang Về Chúng Tôi (About Us - /about)**:
   - **Mô tả**: Giới thiệu về dự án, sứ mệnh, đội ngũ, lợi ích của blockchain trong từ thiện.
   - **Tính năng chính**: Nội dung tĩnh, infographic về quy trình minh bạch.
   - **Lý do mở rộng**: Tăng độ tin cậy và thu hút người dùng mới.

2. **Trang Liên Hệ (Contact - /contact)**:
   - **Mô tả**: Form liên hệ để gửi feedback hoặc yêu cầu hỗ trợ.
   - **Tính năng chính**: Integration với email service (như EmailJS) hoặc API backend.
   - **Lý do mở rộng**: Cải thiện hỗ trợ người dùng.

3. **Trang Blog/Tin Tức (Blog - /blog)**:
   - **Mô tả**: Danh sách bài viết về các chiến dịch thành công, tin tức từ thiện.
   - **Tính năng chính**: Pagination, search, rich text editor cho admin.
   - **Lý do mở rộng**: Tăng engagement và SEO.

4. **Trang Thống Kê (Statistics - /stats)**:
   - **Mô tả**: Tổng quan toàn cầu: Tổng quỹ quyên góp, số campaign, top donor.
   - **Tính năng chính**: Charts (sử dụng Chart.js), dữ liệu aggregate từ blockchain và DB.
   - **Lý do mở rộng**: Hiển thị tác động xã hội.

5. **Trang Hỗ Trợ Đa Ngôn Ngữ hoặc Theme Dark/Light**:
   - **Mô tả**: Không phải trang riêng mà là tính năng toàn app.
   - **Tính năng chính**: Switch ngôn ngữ (i18next), toggle theme.
   - **Lý do mở rộng**: Tiếp cận người dùng quốc tế.

6. **Trang NFT Reward (NFT - /nft)**:
   - **Mô tả**: Trang cho donor nhận NFT làm phần thưởng (nếu donate trên mức nhất định).
   - **Tính năng chính**: Mint NFT qua smart contract, hiển thị gallery.
   - **Lý do mở rộng**: Tăng động lực quyên góp.

## Hướng Dẫn Phát Triển
- **Routing**: Sử dụng `react-router-dom` trong `App.js` để định nghĩa routes.
- **State Management**: Context API hoặc Redux cho global state (ví dụ: user auth, wallet address).
- **Testing**: Sử dụng React Testing Library cho unit test components.
- **Deployment**: Build với `npm run build`, deploy lên Vercel/Netlify.
- **Mở Rộng**: Bắt đầu với core pages, sau đó thêm expansion dựa trên feedback.

Nếu cần thêm chi tiết hoặc code mẫu cho một trang cụ thể, hãy tham khảo thư mục `frontend/src/pages/`.