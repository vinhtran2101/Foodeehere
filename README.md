> # FOODEE — Online Food Ordering System  
> ### Delivering your favorite food, fast & easy  
> **Frontend:** React + Vite • **Backend:** Spring Boot 3 • **Database:** MySQL  

### Foodee – Hệ thống đặt & quản lý đồ ăn trực tuyến
----------------------------------------------------

Foodee là website đặt món – đặt bàn – quản lý nhà hàng, xây dựng theo mô hình Full-Stack với kiến trúc 3 lớp.
Hệ thống phục vụ 2 nhóm người dùng: Khách hàng & Quản trị viên, cho phép đặt món trực tuyến, theo dõi đơn hàng, quản lý thực đơn, người dùng và doanh thu.

Dự án được phát triển như một sản phẩm thực tế, có đầy đủ phân tích – thiết kế – lập trình – kiểm thử – triển khai theo hướng Agile/Scrum.

## 1. Mục tiêu & Giá trị dự án

- Foodee được xây dựng để giải quyết bài toán thực tế:

Các quán với thương hiệu riêng không muốn phụ thuộc vào GrabFood / ShopeeFood

Cần sở hữu nền tảng riêng để quản lý khách hàng – doanh thu – thực đơn

Tối ưu trải nghiệm đặt món của người dùng: nhanh, tiện lợi, rõ ràng

Hỗ trợ mở rộng như thanh toán online, chatbot AI, đặt bàn trước

- Giá trị mang lại:

Giao diện hiện đại & thân thiện, sử dụng trên mọi thiết bị

Quản lý vận hành dễ dàng (thực đơn / đơn hàng / khách hàng)

Dễ mở rộng, tích hợp AI hoặc thanh toán điện tử

Sẵn sàng triển khai thực tế cho mô hình F&B mini

## 2. Kiến trúc hệ thống
Foodee/
│── BE_Foodee/      # Spring Boot 3 – REST API, Security, JPA, MySQL
│── FE_Foodee/      # React + Vite – UI/UX hiện đại
│── .vscode/
│── .gitignore
│── README.md

- Kiến trúc 3 lớp:

Presentation Layer (ReactJS + TailwindCSS)

Business Layer (Spring Boot, Spring Security, JWT)

Data Layer (MySQL)

## 3. Công nghệ sử dụng
- Frontend

React + Vite

React Router

Axios

Tailwind CSS

Context API

- Backend

Java 21

Spring Boot 3.5

Spring Security + JWT

JPA / Hibernate

- MySQL

Maven

Khác

Postman (kiểm thử API)

MySQL Workbench (mô hình ERD)

GitHub (quản lý mã nguồn)

Chatbot AI (Groq API – optional)

## 4. Chức năng chính
# A. Khách hàng

Đăng ký / đăng nhập (JWT)

Xem thực đơn & chi tiết món ăn

Tìm kiếm – lọc món

Thêm/Xóa/Chỉnh sửa giỏ hàng

Đặt món (COD & có thể mở rộng thanh toán online)

Xem lịch sử đơn hàng

Đặt bàn online

Xem tin tức của nhà hàng

Cập nhật thông tin cá nhân

Chatbot AI tư vấn món ăn (nếu bật)

# B. Quản trị viên

Quản lý người dùng

Quản lý món ăn (Thêm – Sửa – Xóa)

Quản lý danh mục & loại món

Quản lý đơn hàng (xem / duyệt / cập nhật trạng thái / hủy)

Quản lý tin tức

Quản lý đặt bàn

Xem doanh thu, báo cáo thống kê

## 5. Thiết kế cơ sở dữ liệu

- Hệ thống được mô hình hóa bằng ERD gồm các bảng chính:

Users – Roles – User_Roles

Products – Categories – ProductTypes

Carts – CartItems

Orders – OrderItems – Payments

Bookings

News

Cấu trúc SQL rõ ràng, chuẩn hóa 3NF, đảm bảo ràng buộc khóa ngoại & toàn vẹn dữ liệu.

## 6. Hướng phát triển

Tích hợp thanh toán online (Momo / VNPay)

Tối ưu hiệu năng backend & caching

Triển khai bản mobile (React Native)

Triển khai server thực tế (Docker + VPS)

Thêm hệ thống khuyến mãi / voucher / loyalty
-------------------------------------------------------------------------------------
-------------------------------------------------------------------------------------
