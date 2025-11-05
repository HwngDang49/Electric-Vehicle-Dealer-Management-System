# TEST CASES - QUẢN LÝ ĐƠN ĐẶT HÀNG (PURCHASE ORDERS)

## Feature: Purchase Order Management

**Epic:** EPIC 2 - Quản lý Đơn hàng Mua từ Hãng  
**Component:** Purchase Orders  
**Priority:** High

---

## DEALER MANAGER - PURCHASE ORDER MANAGEMENT

### TC-PO-DM-001: Tạo PO thành công - Dealer Manager

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerManager`
- Dealer status = `Live`
- Có ít nhất 1 Branch hợp lệ
- Có ít nhất 1 Product Active với Pricebook Active

**Test Steps:**

1. Vào trang Purchase Order Management
2. Click nút "Tạo đơn hàng mới"
3. Chọn Branch (hoặc để mặc định)
4. Thêm ít nhất 1 Product với Quantity > 0
5. Click "Tạo đơn hàng"

**Expected Result:**

- PO được tạo thành công
- PO có Status = `Submit` (vì DealerManager tạo)
- PO có `SubmittedBy` = UserId của DealerManager
- PO có `TotalAmount` = tổng (UnitPrice × Quantity) của tất cả items
- Redirect về danh sách PO hoặc hiển thị success message
- PO mới xuất hiện trong danh sách với status "Đã gửi"

---

### TC-PO-DM-002: Tạo PO thất bại - Dealer status không phải Live

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerManager`
- Dealer status = `Inactive` hoặc `Suspended` (không phải `Live`)

**Test Steps:**

1. Vào trang Purchase Order Management
2. Click "Tạo đơn hàng mới"
3. Điền đầy đủ thông tin hợp lệ
4. Click "Tạo đơn hàng"

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Dealer status need at Live to create PO"`
- PO không được tạo
- Error message hiển thị trên UI

---

### TC-PO-DM-003: Tạo PO thất bại - Không có Product

**Priority:** High  
**Test Type:** Functional / Validation / Negative  
**Preconditions:**

- User đã login với role `DealerManager`
- Dealer status = `Live`

**Test Steps:**

1. Vào trang Purchase Order Management
2. Click "Tạo đơn hàng mới"
3. Không thêm Product nào
4. Click "Tạo đơn hàng"

**Expected Result:**

- Validation error: `"does not product apper in po"` hoặc validation message tương tự
- PO không được tạo
- Form validation hiển thị lỗi

---

### TC-PO-DM-004: Tạo PO thất bại - Product không có giá hoặc giá = 0

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerManager`
- Dealer status = `Live`
- Product không có Pricebook Active hoặc FloorPrice = 0

**Test Steps:**

1. Vào trang Purchase Order Management
2. Click "Tạo đơn hàng mới"
3. Thêm Product không có giá hoặc giá = 0
4. Click "Tạo đơn hàng"

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"In purchase order has invalid price product"`
- PO không được tạo

---

### TC-PO-DM-005: Xem danh sách PO của Dealer

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerManager`
- Có ít nhất 2-3 PO trong hệ thống (của dealer này và dealer khác)

**Test Steps:**

1. Vào trang Purchase Order Management
2. Xem danh sách PO

**Expected Result:**

- Chỉ hiển thị PO của dealer hiện tại
- KHÔNG hiển thị PO của dealer khác
- Danh sách được sắp xếp theo `CreateAt` (mới nhất trước)
- Mỗi PO hiển thị: PO ID, Status, Total Amount, Create Date, Product info

---

### TC-PO-DM-006: Xem chi tiết PO

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerManager`
- Có PO tồn tại của dealer này

**Test Steps:**

1. Vào trang Purchase Order Management
2. Click vào 1 PO trong danh sách (hoặc click "Xem chi tiết")

**Expected Result:**

- Modal/Page chi tiết hiển thị
- Hiển thị đầy đủ thông tin: PO ID, Status, Dealer, Branch, Items, Total Amount, Create Date, Update Date
- Hiển thị danh sách Products với: Product Name, Quantity, Unit Price, Line Total
- Hiển thị thông tin người tạo (nếu có)

---

### TC-PO-DM-007: Xem chi tiết PO không tồn tại

**Priority:** Medium  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerManager`

**Test Steps:**

1. Truy cập trực tiếp URL: `/purchase-orders/99999` (PO không tồn tại)
2. Hoặc thử GET API với PO ID không tồn tại

**Expected Result:**

- HTTP Status Code: `404 Not Found`
- Error message: `"PO {id} not found."`
- Error message hiển thị trên UI

---

### TC-PO-DM-008: Filter PO theo Status

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- User đã login với role `DealerManager`
- Có PO với các status khác nhau: Draft, Submit, Confirm, InTransit, Delivery

**Test Steps:**

1. Vào trang Purchase Order Management
2. Chọn filter status: "Tất cả", "Draft", "Submit", "Confirm", "InTransit", "Delivery"
3. Kiểm tra danh sách được filter

**Expected Result:**

- Danh sách chỉ hiển thị PO có status tương ứng
- Khi chọn "Tất cả", hiển thị tất cả PO
- Filter hoạt động đúng

---

### TC-PO-DM-009: Search PO theo PO ID

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- User đã login với role `DealerManager`
- Có nhiều PO trong danh sách

**Test Steps:**

1. Vào trang Purchase Order Management
2. Nhập PO ID vào search box (ví dụ: "PO-10")
3. Kiểm tra kết quả

**Expected Result:**

- Danh sách chỉ hiển thị PO có ID chứa keyword
- Search không phân biệt hoa thường
- Nếu không tìm thấy, hiển thị "Không có kết quả"

---

### TC-PO-DM-010: Confirm Delivery - Tạo hóa đơn B2B → Delivery

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerManager`
- Có PO với Status = `Submit`
- PO có VIN đang ở trạng thái `InTransit`
- PO có Invoice B2B đã được tạo

**Test Steps:**

1. Vào trang Purchase Order Management
2. Xem chi tiết PO có status `Submit`
3. Click nút "Gán VIN thủ công"
4. Click nút "Tạo hóa đơn B2B"
5. Chuyển hướng sang trang Theo dõi đơn hàng -> ấn xem chi tiết đơn hàng Đã xác nhận và có hóa đơn
6. Ấn nút vận chuyển đơn hàng

**Expected Result:**

- PO status chuyển từ `Submit` → `Confirm`
- VIN status `Allocated` -> `InTransit`
- VIN `OwnerType` chuyển từ `Manufacturer` → `Dealer`
- VIN `LocationType` = `Branch`
- VIN `BranchId` và `DealerId` được cập nhật đúng
- PO status chuyển từ `Confirm` → `Intransit`
- Toast hiển thị thông báo Vận chuyển thành công
---

### TC-PO-DM-011: Confirm Delivery thất bại - PO status không phải InTransit

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerManager`
- Có PO với Status = `Submit` hoặc `Confirm` (không phải `InTransit`)

**Test Steps:**

1. Vào trang Purchase Order Management
2. Xem chi tiết PO có status không phải `InTransit`
3. Thử click "Confirm Delivery" (nếu button hiển thị)

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"PO status must be 'InTransit' to confirm delivery. Current status: {status}"`
- PO status không thay đổi
- Error message hiển thị trên UI

---

### TC-PO-DM-012: Confirm Delivery thất bại - PO không có Invoice B2B

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerManager`
- Có PO với Status = `InTransit`
- PO chưa có Invoice B2B

**Test Steps:**

1. Vào trang Purchase Order Management
2. Xem chi tiết PO `InTransit` chưa có Invoice
3. Thử Confirm Delivery

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"B2B invoice is required before delivery"`
- PO status không thay đổi
- Error message hiển thị trên UI

---

### TC-PO-DM-013: Confirm Delivery thất bại - PO không có VIN InTransit

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerManager`
- Có PO với Status = `InTransit`
- PO không có VIN nào ở trạng thái `InTransit`

**Test Steps:**

1. Vào trang Purchase Order Management
2. Xem chi tiết PO `InTransit` không có VIN InTransit
3. Thử Confirm Delivery

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"No in-transit VIN to confirm"`
- PO status không thay đổi

---

### TC-PO-DM-014: Pagination - Chuyển trang

**Priority:** Low  
**Test Type:** Functional / UI  
**Preconditions:**

- User đã login với role `DealerManager`
- Có nhiều PO (ví dụ: > 10 PO, mỗi trang 5 items)

**Test Steps:**

1. Vào trang Purchase Order Management
2. Xem trang 1 (hiển thị 5 PO đầu tiên)
3. Click "Trang tiếp theo" hoặc số trang 2
4. Kiểm tra danh sách

**Expected Result:**

- Trang 2 hiển thị 5 PO tiếp theo
- Pagination controls hoạt động đúng
- Số trang hiển thị chính xác
- Có thể quay lại trang trước

---

## EVM STAFF - PURCHASE ORDER MANAGEMENT

### TC-PO-EVM-001: Xem danh sách tất cả PO từ tất cả dealers

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO từ nhiều dealers với status: Submit, Confirm, InTransit, Delivery, Delivered

**Test Steps:**

1. Vào trang Order Tracking / Order Management
2. Xem danh sách PO

**Expected Result:**

- Hiển thị PO từ TẤT CẢ dealers
- CHỈ hiển thị PO có status từ `Submit` trở đi (không hiển thị `Draft`)
- Mỗi PO hiển thị: PO ID, Dealer Name, Status, Total Amount, Create Date
- Danh sách được sắp xếp theo `CreateAt` (mới nhất trước)
- Có pagination (mặc định 5 items/page)

---

### TC-PO-EVM-002: Filter PO theo Status - EVM Staff

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với các status: Submit, Confirm, InTransit, Delivery

**Test Steps:**

1. Vào trang Order Tracking
2. Click các tabs: "Tất cả", "Chờ xác nhận" (Submit), "Đã xác nhận" (Confirm), "Đang vận chuyển" (InTransit), "Đã giao" (Delivery)
3. Kiểm tra danh sách được filter

**Expected Result:**

- Tab "Tất cả": Hiển thị tất cả PO từ Submit trở đi
- Tab "Chờ xác nhận": Chỉ hiển thị PO status = `Submit`
- Tab "Đã xác nhận": Chỉ hiển thị PO status = `Confirm`
- Tab "Đang vận chuyển": Chỉ hiển thị PO status = `InTransit`
- Tab "Đã giao": Chỉ hiển thị PO status = `Delivery` hoặc `Delivered`
- Filter hoạt động đúng

---

### TC-PO-EVM-003: Filter PO theo Invoice - Có Invoice / Chưa có Invoice

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO đã có Invoice B2B và PO chưa có Invoice

**Test Steps:**

1. Vào trang Order Management
2. Chọn filter Invoice: "Tất cả", "Có Invoice", "Chưa có Invoice"
3. Kiểm tra danh sách

**Expected Result:**

- "Tất cả": Hiển thị tất cả PO
- "Có Invoice": Chỉ hiển thị PO đã có Invoice B2B
- "Chưa có Invoice": Chỉ hiển thị PO chưa có Invoice B2B
- Filter hoạt động đúng

---

### TC-PO-EVM-004: Search PO theo PO ID hoặc Dealer Name

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có nhiều PO từ nhiều dealers

**Test Steps:**

1. Vào trang Order Tracking
2. Nhập keyword vào search box (ví dụ: "PO-10" hoặc "Dealer ABC")
3. Kiểm tra kết quả

**Expected Result:**

- Danh sách chỉ hiển thị PO có PO ID hoặc Dealer Name chứa keyword
- Search không phân biệt hoa thường
- Nếu không tìm thấy, hiển thị "Không có kết quả"

---

### TC-PO-EVM-005: Xem chi tiết PO

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO tồn tại

**Test Steps:**

1. Vào trang Order Tracking
2. Click vào 1 PO trong danh sách (hoặc click "Xem chi tiết")

**Expected Result:**

- Modal/Page chi tiết hiển thị
- Hiển thị đầy đủ thông tin: PO ID, Dealer Name, Branch, Status, Items, Total Amount, Create Date
- Hiển thị danh sách Products với: Product Name, Quantity, Unit Price, Line Total
- Hiển thị thông tin người tạo, người submit, người confirm (nếu có)
- Hiển thị thông tin Invoice (nếu có)

---

### TC-PO-EVM-006: Confirm PO - Auto (FIFO allocation)

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Submit`
- Dealer có `CreditAvailable` đủ để thanh toán PO
- Manufacturer có đủ VIN `InStock` cho tất cả products trong PO
- Có ít nhất số lượng VIN cần thiết cho mỗi product

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO có status `Submit`
3. Click nút "Xác nhận đơn hàng" / "Auto Confirm"
4. Xác nhận action

**Expected Result:**

- PO status chuyển từ `Submit` → `Confirm`
- VIN được allocate tự động theo FIFO (First In First Out)
- VIN status chuyển từ `InStock` → `Allocated`
- VIN `PoId` được gán
- PO `ConfirmedBy` = UserId của EVM Staff
- `CreditUsed` của dealer tăng lên (nhưng chưa trừ `CreditLimit`)
- Success message hiển thị
- Danh sách PO được refresh

---

### TC-PO-EVM-007: Confirm PO thất bại - PO status không phải Submit

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Draft` hoặc `Confirm` (không phải `Submit`)

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO có status không phải `Submit`
3. Thử Confirm PO

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Required ur status is submit has been confirmed"`
- PO status không thay đổi
- Error message hiển thị trên UI

---

### TC-PO-EVM-008: Confirm PO thất bại - PO không có items

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Submit` nhưng không có items (PoItems.Count = 0)

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO không có items
3. Thử Confirm PO

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"PO must contain at least 1 line item"`
- PO status không thay đổi

---

### TC-PO-EVM-009: Confirm PO thất bại - Credit Available không đủ

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Submit`
- PO `TotalAmount` > Dealer `CreditAvailable`

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO có TotalAmount vượt quá CreditAvailable
3. Thử Confirm PO

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"PO total {amount} exceeds available credit. Credit used: {used}, Credit limit: {limit}, Available: {available}"`
- PO status không thay đổi
- VIN không được allocate
- Error message hiển thị trên UI với thông tin chi tiết

---

### TC-PO-EVM-010: Confirm PO thất bại - Không đủ VIN InStock

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Submit`
- PO có Product với Quantity = 5
- Manufacturer chỉ có 3 VIN `InStock` cho Product đó

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO có Product không đủ VIN
3. Thử Confirm PO

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"not enough inventory for product {productId}. Need {qty}, available {available} (InStock, Manufacturer)."`
- PO status không thay đổi
- VIN không được allocate
- Error message hiển thị rõ số lượng cần và số lượng có sẵn

---

### TC-PO-EVM-011: Confirm PO - Manual (chọn VIN)

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Submit`
- Dealer có `CreditAvailable` đủ
- Manufacturer có đủ VIN `InStock`
- Có ít nhất số lượng VIN cần thiết cho mỗi product

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO có status `Submit`
3. Click nút "Chọn VIN thủ công" / "Manual Confirm"
4. Chọn VIN cho từng product (chọn đúng số lượng cần)
5. Click "Xác nhận"

**Expected Result:**

- PO status chuyển từ `Submit` → `Confirm`
- Chỉ các VIN được chọn được allocate
- VIN status chuyển từ `InStock` → `Allocated`
- VIN `PoId` được gán
- PO `ConfirmedBy` = UserId của EVM Staff
- Success message hiển thị
- Danh sách PO được refresh

---

### TC-PO-EVM-012: Confirm PO Manual thất bại - Chọn sai số lượng VIN

**Priority:** High  
**Test Type:** Functional / Validation / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Submit`
- PO có Product với Quantity = 5

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO
3. Click "Manual Confirm"
4. Chọn số lượng VIN khác với Quantity (ví dụ: chọn 3 thay vì 5)
5. Click "Xác nhận"

**Expected Result:**

- Validation error: Số lượng VIN phải bằng Quantity
- PO không được confirm
- Error message hiển thị yêu cầu chọn đúng số lượng

---

### TC-PO-EVM-013: Tạo Invoice B2B cho PO

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Confirm`
- PO chưa có Invoice B2B

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết PO có status `Confirm` chưa có Invoice
3. Click nút "Tạo Invoice B2B"
4. Xác nhận

**Expected Result:**

- Invoice B2B được tạo thành công
- Invoice có `InvoiceType` = `B2B`
- Invoice có `PoId` = PO ID
- Invoice có `Amount` = PO `TotalAmount`
- Invoice có `Status` = `Pending`
- Invoice `DealerId` = PO `DealerId`
- `CreditUsed` của dealer tăng lên = Invoice Amount
- Success message hiển thị
- PO hiển thị "Đã có Invoice" trong danh sách

---

### TC-PO-EVM-014: Tạo Invoice B2B thất bại - PO status không phải Confirm

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Submit` (chưa Confirm)

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết PO có status `Submit`
3. Thử tạo Invoice B2B

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"PO need stay Confirmed to create Invoices"`
- Invoice không được tạo
- Error message hiển thị trên UI

---

### TC-PO-EVM-015: Tạo Invoice B2B thất bại - PO đã có Invoice

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Confirm`
- PO đã có Invoice B2B

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết PO đã có Invoice
3. Thử tạo Invoice B2B lại

**Expected Result:**

- API trả về InvoiceId hiện tại (không tạo mới)
- Hoặc error message: Invoice đã tồn tại
- Không tạo Invoice trùng lặp

---

### TC-PO-EVM-016: Issue Delivery - Confirm → InTransit

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Confirm`
- PO đã có Invoice B2B
- PO có VIN đang ở trạng thái `Allocated`

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO có status `Confirm` và đã có Invoice
3. Click nút "Gửi hàng" / "Issue Delivery"
4. Xác nhận

**Expected Result:**

- PO status chuyển từ `Confirm` → `InTransit`
- VIN status chuyển từ `Allocated` → `InTransit`
- VIN `LocationType` = `OnRoad`
- VIN vẫn thuộc `OwnerType` = `Manufacturer`
- Success message hiển thị
- Danh sách PO được refresh

---

### TC-PO-EVM-017: Issue Delivery thất bại - PO status không phải Confirm

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Submit` (chưa Confirm)

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO có status `Submit`
3. Thử Issue Delivery

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"PO must be Confirm to issue delivery"`
- PO status không thay đổi
- Error message hiển thị trên UI

---

### TC-PO-EVM-018: Issue Delivery thất bại - PO chưa có Invoice B2B

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Confirm`
- PO chưa có Invoice B2B

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO `Confirm` chưa có Invoice
3. Thử Issue Delivery

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"B2B invoice is required before delivery"`
- PO status không thay đổi
- Error message hiển thị trên UI

---

### TC-PO-EVM-019: Issue Delivery thất bại - Không đủ VIN Allocated

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO với Status = `Confirm`
- PO có Invoice B2B
- PO có Product với Quantity = 5 nhưng chỉ có 3 VIN `Allocated`

**Test Steps:**

1. Vào trang Order Tracking
2. Xem chi tiết PO không đủ VIN Allocated
3. Thử Issue Delivery

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"not enough allocated VIN for product {productId}. Required {qty}, allocated {allocated}."`
- PO status không thay đổi
- VIN không được chuyển sang InTransit

---

### TC-PO-EVM-020: Pagination - Chuyển trang

**Priority:** Low  
**Test Type:** Functional / UI  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có nhiều PO (ví dụ: > 10 PO, mỗi trang 5 items)

**Test Steps:**

1. Vào trang Order Tracking
2. Xem trang 1 (hiển thị 5 PO đầu tiên)
3. Click "Trang tiếp theo" hoặc số trang 2
4. Kiểm tra danh sách

**Expected Result:**

- Trang 2 hiển thị 5 PO tiếp theo
- Pagination controls hoạt động đúng
- Số trang hiển thị chính xác
- Có thể quay lại trang trước

---

### TC-PO-EVM-021: Xem chi tiết PO không tồn tại

**Priority:** Medium  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `EVMStaff`

**Test Steps:**

1. Truy cập trực tiếp URL với PO ID không tồn tại
2. Hoặc thử GET API với PO ID không tồn tại

**Expected Result:**

- HTTP Status Code: `404 Not Found`
- Error message: `"PO {id} not found."`
- Error message hiển thị trên UI

---

## CROSS-ROLE TEST CASES

### TC-PO-CROSS-001: Dealer Manager không thể xem PO của dealer khác

**Priority:** High  
**Test Type:** Security / Authorization  
**Preconditions:**

- User đã login với role `DealerManager` của Dealer A
- Có PO của Dealer B trong hệ thống

**Test Steps:**

1. Vào trang Purchase Order Management
2. Xem danh sách PO
3. Thử truy cập trực tiếp API với PO ID của Dealer B

**Expected Result:**

- Danh sách chỉ hiển thị PO của Dealer A
- Không thể truy cập PO của Dealer B
- API trả về 403 Forbidden hoặc 404 Not Found khi truy cập PO của dealer khác

---

### TC-PO-CROSS-002: EVM Staff có thể xem PO của tất cả dealers

**Priority:** High  
**Test Type:** Security / Authorization  
**Preconditions:**

- User đã login với role `EVMStaff`
- Có PO từ nhiều dealers khác nhau

**Test Steps:**

1. Vào trang Order Tracking
2. Xem danh sách PO
3. Kiểm tra PO từ các dealers khác nhau

**Expected Result:**

- Hiển thị PO từ TẤT CẢ dealers
- Có thể xem chi tiết PO của bất kỳ dealer nào
- Không có restriction về dealer

---

### TC-PO-CROSS-003: Unauthorized access - User không có quyền

**Priority:** High  
**Test Type:** Security / Authorization  
**Preconditions:**

- User đã login với role `DealerStaff` (không phải Manager)
- DealerStaff không có quyền tạo PO (tùy hệ thống)

**Test Steps:**

1. Thử truy cập API tạo PO
2. Thử truy cập API confirm PO (chỉ EVM Staff)

**Expected Result:**

- API trả về 403 Forbidden hoặc 401 Unauthorized
- Error message: User không có quyền thực hiện action này

---

## SUMMARY

**Total Test Cases:** 43

### Dealer Manager: 14 test cases

- **High Priority:** 9 test cases
- **Medium Priority:** 4 test cases
- **Low Priority:** 1 test case

### EVM Staff: 21 test cases

- **High Priority:** 14 test cases
- **Medium Priority:** 5 test cases
- **Low Priority:** 2 test cases

### Cross-Role: 3 test cases

- **High Priority:** 3 test cases

**Test Type Breakdown:**

- Functional: 35 test cases
- Security: 4 test cases
- Validation: 4 test cases
