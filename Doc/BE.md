# BACKEND.md: Hướng Dẫn Phát Triển Backend

## Giới Thiệu
Phần backend của dự án chịu trách nhiệm xử lý logic server-side, cung cấp API cho frontend, kết nối với database (MongoDB) để lưu trữ metadata, và tích hợp với blockchain (qua Web3.js hoặc Ethers.js) để interact với smart contract. Backend được xây dựng bằng Node.js với Express.js, sử dụng Mongoose cho ORM, và JWT cho authentication.

Mục tiêu: Cung cấp các endpoint an toàn, hiệu quả để quản lý dữ liệu và giao dịch. Backend không xử lý trực tiếp transaction blockchain (để tránh rủi ro bảo mật), mà chỉ cung cấp metadata và trigger client-side actions. Các endpoint sẽ được định nghĩa trong thư mục `backend/src/routes/`.

## Yêu Cầu Chung Cho Các Endpoint
- **API Style**: RESTful, sử dụng JSON cho request/response.
- **Authentication**: Sử dụng JWT bearer token cho các endpoint protected (ví dụ: tạo campaign yêu cầu admin role).
- **Validation**: Sử dụng Joi hoặc express-validator để kiểm tra input.
- **Error Handling**: Trả về chuẩn HTTP status (200 OK, 400 Bad Request, 401 Unauthorized, 500 Internal Server Error) với message JSON.
- **Rate Limiting**: Áp dụng để chống DDoS (sử dụng express-rate-limit).
- **Logging**: Sử dụng Winston hoặc Morgan để log request.
- **Tích Hợp Blockchain**: Các endpoint liên quan sẽ gọi smart contract (ví dụ: query balance), nhưng transaction chính (như donate) diễn ra client-side.
- **Documentation**: Sử dụng Swagger (tích hợp express-swagger-generator) để auto-gen API docs tại `/api-docs`.

## Các Endpoint Phải Có (Core Endpoints)
Đây là các endpoint thiết yếu cho MVP, tập trung vào quản lý campaign, user, và hỗ trợ donation. Chúng được nhóm theo resource.

1. **User Authentication**:
   - **POST /api/auth/register**:
     - **Mô tả**: Đăng ký user mới (email, password, wallet address tùy chọn).
     - **Request Body**: { email: string, password: string, walletAddress?: string }
     - **Response**: { token: string, user: { id, email } }
     - **Protected**: Không.
   - **POST /api/auth/login**:
     - **Mô tả**: Đăng nhập và trả về JWT token.
     - **Request Body**: { email: string, password: string }
     - **Response**: { token: string, user: { id, email, role } }
     - **Protected**: Không.
   - **GET /api/auth/me**:
     - **Mô tả**: Lấy thông tin user hiện tại.
     - **Response**: { id, email, walletAddress, role }
     - **Protected**: Có (JWT).

2. **Campaign Management**:
   - **GET /api/campaigns**:
     - **Mô tả**: Lấy danh sách tất cả campaign (có thể thêm query params cho filter: ?type=education&status=active).
     - **Response**: Array of { id, title, description, goal, currentAmount (từ blockchain), owner }
     - **Protected**: Không (public).
   - **GET /api/campaigns/:id**:
     - **Mô tả**: Lấy chi tiết một campaign.
     - **Response**: { id, title, ..., contractAddress }
     - **Protected**: Không.
   - **POST /api/campaigns**:
     - **Mô tả**: Tạo campaign mới (deploy smart contract tự động qua backend nếu cần).
     - **Request Body**: { title: string, description: string, goal: number, type: string }
     - **Response**: { id, ... }
     - **Protected**: Có (admin role).
   - **PUT /api/campaigns/:id**:
     - **Mô tả**: Cập nhật campaign (chỉ metadata, không ảnh hưởng blockchain).
     - **Request Body**: { title?: string, description?: string }
     - **Response**: Updated campaign.
     - **Protected**: Có (owner hoặc admin).
   - **DELETE /api/campaigns/:id**:
     - **Mô tả**: Xóa campaign (nếu chưa có donation, hoặc mark inactive).
     - **Response**: { message: "Deleted" }
     - **Protected**: Có (owner hoặc admin).

3. **Donation Support**:
   - **GET /api/donations/:campaignId**:
     - **Mô tả**: Lấy lịch sử donation cho một campaign (query từ blockchain events).
     - **Response**: Array of { txHash: string, amount: number, donor: string, timestamp: date }
     - **Protected**: Không.
   - **POST /api/donations/notify**:
     - **Mô tả**: Webhook để nhận event từ blockchain (ví dụ: khi có donation mới, update DB).
     - **Request Body**: { event: string, data: object }
     - **Response**: { message: "Processed" }
     - **Protected**: Có (secret key).

## Các Endpoint Có Thể Mở Rộng (Expansion Endpoints)
Những endpoint này không bắt buộc cho MVP nhưng có thể thêm để nâng cao tính năng, tùy theo nhu cầu mở rộng dự án. Chúng có thể được triển khai ở giai đoạn sau.

1. **Analytics**:
   - **GET /api/analytics/campaign/:id**:
     - **Mô tả**: Lấy thống kê chi tiết (tổng donation, số donor, chart data).
     - **Response**: { totalDonations: number, donorCount: number, ... }
     - **Lý do mở rộng**: Hỗ trợ dashboard admin.

2. **User Management**:
   - **PUT /api/users/:id**:
     - **Mô tả**: Cập nhật profile user (ví dụ: thêm wallet address).
     - **Request Body**: { walletAddress?: string }
     - **Response**: Updated user.
     - **Protected**: Có (tự user hoặc admin).
   - **GET /api/users/donations**:
     - **Mô tả**: Lấy lịch sử donation của user (dựa trên wallet address).
     - **Response**: Array of donations.
     - **Protected**: Có.
     - **Lý do mở rộng**: Cá nhân hóa trải nghiệm user.

3. **Withdrawal**:
   - **POST /api/withdraw/:campaignId**:
     - **Mô tả**: Yêu cầu rút quỹ từ smart contract (chỉ khi đạt goal, multisig confirm).
     - **Request Body**: { amount: number, toAddress: string }
     - **Response**: { txHash: string }
     - **Protected**: Có (admin).
     - **Lý do mở rộng**: Hoàn tất vòng đời campaign.

4. **Notifications**:
   - **POST /api/notifications/subscribe**:
     - **Mô tả**: Đăng ký push notification cho campaign (tích hợp WebSocket hoặc Firebase).
     - **Request Body**: { campaignId: string, userId: string }
     - **Response**: { message: "Subscribed" }
     - **Protected**: Có.
     - **Lý do mở rộng**: Tăng engagement.

5. **Integration**:
   - **GET /api/integrations/blockchain/:contractAddress**:
     - **Mô tả**: Query trực tiếp dữ liệu từ smart contract (ví dụ: balance).
     - **Response**: { balance: number }
     - **Protected**: Không.
     - **Lý do mở rộng**: Hỗ trợ third-party integration.

## Hướng Dẫn Phát Triển
- **Routing**: Định nghĩa routes trong `routes/` và mount vào `app.js`.
- **Controllers & Services**: Tách logic vào controllers (handle request) và services (business logic, như blockchainService.js).
- **Testing**: Sử dụng Jest/Supertest cho unit và integration test (ví dụ: test endpoint POST /api/campaigns).
- **Deployment**: Sử dụng PM2 cho production, deploy lên Heroku/AWS với env vars.
- **Mở Rộng**: Bắt đầu với core endpoints, sau đó thêm expansion dựa trên yêu cầu.

Nếu cần code mẫu cho một endpoint cụ thể, hãy tham khảo thư mục `backend/src/`.