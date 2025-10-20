# Admin Dealer Management

## Tổng quan
Chức năng quản lý Dealer cho trang Admin được tích hợp vào hệ thống EVDMS, cho phép quản trị viên quản lý toàn bộ thông tin và trạng thái của các dealer trong hệ thống.

## Các tính năng chính

### 1. Xem danh sách Dealer
- Hiển thị danh sách tất cả dealer với thông tin cơ bản
- Tìm kiếm dealer theo tên, mã, hoặc tên pháp lý
- Phân trang và sắp xếp dữ liệu

### 2. Tạo Dealer mới
- Form tạo dealer với các trường:
  - Mã Dealer (bắt buộc)
  - Tên Dealer (bắt buộc)
  - Tên pháp lý
  - Mã số thuế
  - Hạn mức tín dụng
- Validation dữ liệu đầu vào
- Trạng thái mặc định: "Onboarding"

### 3. Chỉnh sửa Dealer
- Cập nhật thông tin dealer hiện có
- Không thể thay đổi trạng thái (sử dụng các action riêng biệt)
- Validation dữ liệu

### 4. Xem chi tiết Dealer
- Modal hiển thị đầy đủ thông tin dealer
- Thông tin hệ thống (ID, ngày tạo, cập nhật)
- Thống kê hoạt động (cho dealer đang hoạt động)

### 5. Quản lý trạng thái Dealer
Các action có thể thực hiện dựa trên trạng thái:

#### Dealer Onboarding:
- **Kích hoạt**: Chuyển sang trạng thái "Active"

#### Dealer Active:
- **Tạm dừng**: Chuyển sang trạng thái "Suspended"
- **Đóng**: Chuyển sang trạng thái "Closed"

#### Dealer Suspended:
- **Kích hoạt lại**: Chuyển sang trạng thái "Active"
- **Đóng**: Chuyển sang trạng thái "Closed"

#### Dealer Closed:
- Không có action nào khả dụng

## Cấu trúc file

```
frontend/src/components/admin/
├── DealerManagement.jsx          # Component chính quản lý dealer
├── DealerManagement.css          # Styles cho component chính
├── CreateDealerModal.jsx         # Modal tạo dealer mới
├── CreateDealerModal.css         # Styles cho modal tạo
├── EditDealerModal.jsx           # Modal chỉnh sửa dealer
├── EditDealerModal.css           # Styles cho modal chỉnh sửa
├── DealerDetailModal.jsx         # Modal xem chi tiết dealer
├── DealerDetailModal.css         # Styles cho modal chi tiết
└── README.md                     # Tài liệu này
```

## API Endpoints sử dụng

- `GET /api/dealers` - Lấy danh sách dealer
- `GET /api/dealers/{id}` - Lấy thông tin dealer theo ID
- `POST /api/dealers` - Tạo dealer mới
- `PUT /api/dealers/{id}` - Cập nhật thông tin dealer
- `PATCH /api/dealers/{id}/activate` - Kích hoạt dealer
- `PATCH /api/dealers/{id}/suspend` - Tạm dừng dealer
- `PATCH /api/dealers/{id}/reactivate` - Kích hoạt lại dealer
- `PATCH /api/dealers/{id}/close` - Đóng dealer

## Cách sử dụng

### 1. Truy cập trang Admin
- Đăng nhập với tài khoản Admin
- Vào trang Admin Dashboard
- Click vào card "Quản lý Dealer"

### 2. Tạo dealer mới
- Click nút "Thêm Dealer"
- Điền thông tin vào form
- Click "Tạo Dealer"

### 3. Chỉnh sửa dealer
- Click nút "Chỉnh sửa" trong bảng dealer
- Cập nhật thông tin cần thiết
- Click "Cập nhật"

### 4. Xem chi tiết dealer
- Click nút "Xem chi tiết" trong bảng dealer
- Xem đầy đủ thông tin và thống kê

### 5. Thay đổi trạng thái dealer
- Click các nút action tương ứng với trạng thái hiện tại
- Xác nhận hành động

## Styling và UI/UX

- Thiết kế nhất quán với trang Dealer Staff
- Responsive design cho mobile và tablet
- Loading states và error handling
- Color scheme: #e6e6e6 (background), #7b7b7b (primary), #333333 (text)
- Status badges với màu sắc phân biệt:
  - Onboarding: Vàng (#fef3c7)
  - Active: Xanh lá (#d1fae5)
  - Suspended: Đỏ (#fee2e2)
  - Closed: Xám (#f3f4f6)

## Lưu ý kỹ thuật

1. **State Management**: Sử dụng React hooks (useState, useEffect)
2. **API Integration**: Sử dụng dealerApiService đã có sẵn
3. **Error Handling**: Hiển thị thông báo lỗi cho người dùng
4. **Loading States**: Hiển thị loading spinner khi thực hiện API calls
5. **Form Validation**: Validation phía client trước khi gửi API
6. **Responsive**: Tối ưu cho các kích thước màn hình khác nhau

## Tương lai

- Thêm tính năng phân trang
- Thêm bộ lọc nâng cao
- Thêm tính năng export/import dữ liệu
- Thêm audit log cho các thay đổi
- Tích hợp real-time updates
