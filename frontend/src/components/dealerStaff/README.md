# Components Structure

Thư mục này chứa các React components đã được tách riêng từ file App.jsx ban đầu để dễ dàng quản lý và phát triển.

## Cấu trúc thư mục

```
src/components/
├── Sidebar.jsx          # Component sidebar với navigation
├── Sidebar.css         # Styles cho Sidebar component
├── Header.jsx           # Component header với search và user info
├── Header.css          # Styles cho Header component
├── Dashboard.jsx        # Component dashboard chính
├── Dashboard.css       # Styles cho Dashboard component
├── CustomerManagement.jsx  # Component quản lý khách hàng
├── CustomerManagement.css  # Styles cho CustomerManagement
├── AddCustomerForm.jsx     # Component form thêm khách hàng
├── AddCustomerForm.css     # Styles cho AddCustomerForm
├── index.js            # Export file cho tất cả components
└── README.md           # File này
```

## Components

### Sidebar

- **File**: `Sidebar.jsx` + `Sidebar.css`
- **Chức năng**: Hiển thị navigation menu với các tính năng chính của hệ thống
- **Props**:
  - `sidebarCollapsed`: boolean - trạng thái thu gọn sidebar
  - `activeItem`: string - item đang được chọn
  - `onToggleSidebar`: function - xử lý thu gọn/mở rộng sidebar
  - `onNavClick`: function - xử lý click vào navigation item

### Header

- **File**: `Header.jsx` + `Header.css`
- **Chức năng**: Hiển thị search bar, notifications và user profile
- **Props**:
  - `searchQuery`: string - giá trị search hiện tại
  - `onSearchChange`: function - xử lý thay đổi search input
  - `onSearchSubmit`: function - xử lý submit search
  - `onClearSearch`: function - xử lý xóa search
  - `showUserDropdown`: boolean - hiển thị user dropdown
  - `onToggleUserDropdown`: function - xử lý toggle user dropdown
  - `showNotifications`: boolean - hiển thị notifications
  - `onToggleNotifications`: function - xử lý toggle notifications
  - `notificationCount`: number - số lượng notifications

### Dashboard

- **File**: `Dashboard.jsx` + `Dashboard.css`
- **Chức năng**: Hiển thị dashboard chính với metrics và quick actions
- **Props**: Không có props (static content)

### CustomerManagement

- **File**: `CustomerManagement.jsx` + `CustomerManagement.css`
- **Chức năng**: Quản lý danh sách khách hàng với các tính năng CRUD
- **Props**: Không có props (quản lý state nội bộ)
- **Tính năng**:
  - Hiển thị danh sách khách hàng
  - Thống kê số lượng khách hàng
  - Tìm kiếm và lọc khách hàng
  - Nút thêm khách hàng mới
  - Các thao tác chỉnh sửa, xem, xóa

### AddCustomerForm

- **File**: `AddCustomerForm.jsx` + `AddCustomerForm.css`
- **Chức năng**: Form thêm khách hàng mới với validation
- **Props**:
  - `onClose`: function - xử lý đóng form
  - `onAddCustomer`: function - xử lý thêm khách hàng mới
- **Tính năng**:
  - Form nhập thông tin khách hàng đầy đủ
  - Validation các trường bắt buộc
  - Giao diện responsive
  - Background gradient đẹp mắt

## Cách sử dụng

```jsx
import {
  Sidebar,
  Header,
  Dashboard,
  CustomerManagement,
  AddCustomerForm,
} from "./components";

// Hoặc import riêng lẻ
import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import Dashboard from "./components/Dashboard";
import CustomerManagement from "./components/CustomerManagement";
import AddCustomerForm from "./components/AddCustomerForm";
```

## Lợi ích của cấu trúc mới

1. **Tách biệt trách nhiệm**: Mỗi component có trách nhiệm riêng biệt
2. **Dễ bảo trì**: Code được tổ chức rõ ràng, dễ tìm và sửa lỗi
3. **Tái sử dụng**: Components có thể được sử dụng ở nhiều nơi khác nhau
4. **Phát triển tính năng**: Dễ dàng thêm tính năng mới cho từng component
5. **Testing**: Dễ dàng viết unit test cho từng component riêng biệt

## Chuẩn bị cho phát triển tính năng

Cấu trúc này đã sẵn sàng để phát triển các tính năng cho từng nút trên sidebar:

- **Quản lý khách hàng**: Có thể tạo component `CustomerManagement.jsx`
- **Xem danh mục**: Có thể tạo component `CategoryView.jsx`
- **Quản lý báo giá**: Có thể tạo component `QuoteManagement.jsx`
- **Quản lý đơn hàng**: Có thể tạo component `OrderManagement.jsx`
- **Lịch nhận giao xe**: Có thể tạo component `DeliverySchedule.jsx`
- **Lịch hẹn lái thử**: Có thể tạo component `TestDriveSchedule.jsx`
- **Quản lý thanh toán**: Có thể tạo component `PaymentManagement.jsx`
- **Feedback**: Có thể tạo component `Feedback.jsx`
