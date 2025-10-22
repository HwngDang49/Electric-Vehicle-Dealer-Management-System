# Admin Management Components

## Tổng quan
Các chức năng quản lý cho trang Admin được tích hợp vào hệ thống EVDMS, cho phép quản trị viên quản lý toàn bộ hệ thống bao gồm Dealer, Branch, Product, và Pricebook.

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
├── BranchManagement.jsx          # Component quản lý chi nhánh
├── BranchManagement.css          # Styles cho branch management
├── CreateBranchModal.jsx         # Modal tạo chi nhánh
├── CreateBranchModal.css         # Styles cho modal tạo chi nhánh
├── BranchDetailModal.jsx         # Modal xem chi tiết chi nhánh
├── BranchDetailModal.css         # Styles cho modal chi tiết chi nhánh
├── ProductCatalog.jsx            # Component quản lý sản phẩm
├── ProductCatalog.css            # Styles cho product catalog
├── CreateProductModal.jsx        # Modal tạo sản phẩm
├── CreateProductModal.css        # Styles cho modal tạo sản phẩm
├── ProductDetailModal.jsx        # Modal xem chi tiết sản phẩm
├── ProductDetailModal.css        # Styles cho modal chi tiết sản phẩm
├── PricebookManagement.jsx       # Component quản lý bảng giá
├── CreatePricebookModal.jsx      # Modal tạo bảng giá
├── CustomDropdown.jsx            # Reusable custom dropdown component
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
7. **Reusable Components**: CustomDropdown component dùng chung cho các filters

## CustomDropdown Component

### Tổng quan
Component dropdown tùy chỉnh thay thế cho `<select>` tag mặc định, cung cấp UI/UX đẹp và nhất quán.

### Props
- `value`: Giá trị hiện tại được chọn
- `onChange`: Callback khi thay đổi giá trị
- `options`: Mảng các option `{ value, label, icon? }`
- `placeholder`: Text hiển thị khi chưa chọn (default: "Chọn...")
- `icon`: Icon mặc định (default: "📋")
- `minWidth`: Chiều rộng tối thiểu (default: "220px")

### Features
- ✅ Icon cho mỗi option
- ✅ Smooth animations (arrow rotation, hover effects)
- ✅ Selected state với checkmark
- ✅ Hover highlight
- ✅ Auto-close khi chọn
- ✅ Responsive và accessible
- ✅ Đồng bộ với design system

### Sử dụng
```jsx
import CustomDropdown from "./CustomDropdown";

const options = [
  { value: "", label: "Tất cả", icon: "📋" },
  { value: "active", label: "Hoạt động", icon: "✅" },
  { value: "inactive", label: "Không hoạt động", icon: "⏸️" }
];

<CustomDropdown
  value={selectedValue}
  onChange={setSelectedValue}
  options={options}
  minWidth="200px"
/>
```

---

# Pricebook Management

## Tổng quan
Chức năng quản lý Bảng giá cho phép Admin tạo và quản lý các bảng giá cho sản phẩm, có thể áp dụng global hoặc cho từng dealer cụ thể.

## Các tính năng chính

### 1. Xem danh sách Bảng giá
- Hiển thị danh sách tất cả bảng giá với thông tin cơ bản
- Tìm kiếm theo tên bảng giá
- Lọc theo trạng thái (Active, Inactive, Expired)
- Hiển thị số lượng sản phẩm trong mỗi bảng giá

### 2. Tạo Bảng giá mới
- Form tạo bảng giá với các trường:
  - Tên bảng giá (bắt buộc)
  - Dealer (tùy chọn - để trống cho Global)
  - Ngày bắt đầu (bắt buộc)
  - Ngày kết thúc (tùy chọn)
  - Trạng thái (Active/Inactive)
  - Danh sách sản phẩm với giá MSRP và giá sàn
- Validation:
  - Tên không được để trống
  - Ngày kết thúc phải sau ngày bắt đầu
  - Phải có ít nhất một sản phẩm
  - Giá MSRP và giá sàn phải > 0
  - Giá sàn không được lớn hơn giá MSRP
  - Giá không được vượt quá 1 tỷ VND

### 3. Chọn sản phẩm
- Hiển thị danh sách tất cả sản phẩm available
- Checkbox selection để chọn nhiều sản phẩm
- Thiết lập giá MSRP và giá sàn cho từng sản phẩm
- Xóa sản phẩm khỏi bảng giá

## API Endpoints sử dụng

- `GET /api/admin/pricebooks` - Lấy danh sách bảng giá
- `GET /api/admin/pricebooks?status=Active` - Lọc theo trạng thái
- `POST /api/admin/pricebooks` - Tạo bảng giá mới

## Cách sử dụng

### 1. Truy cập Quản lý Bảng giá
- Đăng nhập với tài khoản Admin
- Vào trang Admin Dashboard
- Click vào card "Quản lý Bảng giá"

### 2. Tạo bảng giá mới
1. Click nút "Thêm Bảng giá"
2. Nhập tên bảng giá
3. Chọn dealer (tùy chọn) hoặc để trống cho Global
4. Chọn ngày bắt đầu và ngày kết thúc
5. Chọn trạng thái
6. Click "Chọn sản phẩm" để hiển thị danh sách
7. Check/uncheck các sản phẩm muốn thêm vào
8. Thiết lập giá MSRP và giá sàn cho từng sản phẩm
9. Click "Tạo Bảng giá"

### 3. Xem danh sách bảng giá
- Tìm kiếm theo tên bảng giá trong ô search
- Lọc theo trạng thái bằng dropdown filter
- Xem thông tin: ID, Tên, Dealer, Ngày hiệu lực, Số sản phẩm, Trạng thái

## Lưu ý kỹ thuật

1. **Global vs Dealer Pricebook**:
   - Để trống Dealer → Bảng giá Global áp dụng cho tất cả dealer
   - Chọn Dealer → Bảng giá riêng cho dealer đó (override global)

2. **Overlap Validation**:
   - Backend kiểm tra không cho phép 2 bảng giá Active cùng dealer overlap thời gian
   - Frontend hiển thị lỗi nếu vi phạm rule này

3. **Price Validation**:
   - Giá sàn (FloorPrice) ≤ Giá MSRP (MsrpPrice)
   - Cả 2 giá phải > 0 và < 1,000,000,000 VND

4. **Status**:
   - Active: Bảng giá đang hoạt động
   - Inactive: Bảng giá tạm dừng
   - Expired: Bảng giá hết hạn (tự động sau ngày kết thúc)

## Tương lai

- Thêm chức năng xem chi tiết bảng giá
- Thêm chức năng chỉnh sửa bảng giá
- Thêm chức năng clone bảng giá
- Thêm/xóa sản phẩm từ bảng giá hiện có
- Cập nhật giá cho sản phẩm trong bảng giá
- Export/Import bảng giá
- Lịch sử thay đổi giá
