# TEST CASES - QUẢN LÝ BÁO GIÁ VÀ ĐƠN HÀNG (DEALER STAFF)

## Feature: Sales Order Management - Dealer Staff

**Epic:** EPIC 1 - Quản lý Báo giá và Đơn hàng Bán  
**Component:** Quotes & Orders  
**Priority:** High

---

## QUOTE MANAGEMENT

### TC-QUOTE-001: Tạo báo giá thành công

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Customer tồn tại thuộc dealer này
- Có Product Active với Pricebook Active

**Test Steps:**

1. Vào trang Quotation Management
2. Click "Tạo báo giá mới"
3. Chọn Customer
4. Chọn Product (1 sản phẩm)
5. Nhập Quantity > 0
6. Click "Tạo báo giá"

**Expected Result:**

- Quote được tạo thành công với Status = `Draft`
- Quote tự động tính giá từ Pricebook (MSRP)
- Quote tự động tính promotion (nếu có)
- `TotalAmount` = (UnitPrice × Quantity) - LinePromo
- Quote hiển thị trong danh sách với status "Nháp"

---

### TC-QUOTE-002: Tạo báo giá thất bại - Customer không thuộc dealer

**Priority:** High
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Customer thuộc dealer khác

**Test Steps:**

1. Vào trang Quotation Management
2. Click "Tạo báo giá mới"
3. Chọn Customer thuộc dealer khác
4. Chọn Product và Quantity
5. Click "Tạo báo giá"

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Khách hàng không thuộc đại lý này."`
- Quote không được tạo

---

### TC-QUOTE-003: Tạo báo giá thất bại - Product không Active

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Customer hợp lệ
- Có Product với Status = `Inactive` hoặc `Discontinued`

**Test Steps:**

1. Vào trang Quotation Management
2. Click "Tạo báo giá mới"
3. Chọn Customer hợp lệ
4. Chọn Product không Active
5. Click "Tạo báo giá"

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Sản phẩm '{name}' hiện đang ở trạng thái '{status}' và không thể tạo báo giá. Chỉ sản phẩm 'Active' mới có thể được bán."`
- Quote không được tạo

---

### TC-QUOTE-004: Tạo báo giá thất bại - Product không có giá

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Customer hợp lệ
- Product không có Pricebook Active hoặc MSRP = 0

**Test Steps:**

1. Vào trang Quotation Management
2. Click "Tạo báo giá mới"
3. Chọn Product không có giá hợp lệ
4. Click "Tạo báo giá"

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Sản phẩm không có giá bán hợp lệ tại thời điểm này."`
- Quote không được tạo

---

### TC-QUOTE-005: Xem danh sách báo giá

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có nhiều Quote trong hệ thống (của dealer này và dealer khác)

**Test Steps:**

1. Vào trang Quotation Management
2. Xem danh sách Quote

**Expected Result:**

- Chỉ hiển thị Quote của dealer hiện tại
- KHÔNG hiển thị Quote của dealer khác
- Mỗi Quote hiển thị: Quote ID, Customer, Product, Total Amount, Status, Create Date
- Danh sách được sắp xếp theo CreateAt (mới nhất trước)

---

### TC-QUOTE-006: Xem chi tiết báo giá

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote tồn tại của dealer này

**Test Steps:**

1. Vào trang Quotation Management
2. Click vào 1 Quote trong danh sách

**Expected Result:**

- Modal/Page chi tiết hiển thị
- Hiển thị đầy đủ: Quote ID, Customer, Product, Quantity, Unit Price, Promotion, Total Amount, Status
- Hiển thị thông tin người tạo

---

### TC-QUOTE-007: Gửi báo giá - Draft → Send (set LockedUntil)

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote với Status = `Draft`
- Customer có email hợp lệ

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote có status `Draft`
3. Click nút "Gửi báo giá"
4. Xác nhận

**Expected Result:**

- Quote `LockedUntil` được set = CreateAt + 7 ngày
- Quote status vẫn = `Draft` (không đổi)
- Email được gửi đến Customer (nếu email service hoạt động)
- Success message hiển thị

---

### TC-QUOTE-008: Gửi báo giá thất bại - Quote status không phải Draft

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote với Status = `Finalized` hoặc `Cancelled`

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote không phải `Draft`
3. Thử gửi báo giá

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Cannot send a quote with status '{status}'. Only Draft quotes can be sent."`
- Quote không được cập nhật

---

### TC-QUOTE-009: Gửi báo giá thất bại - Customer không có email

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote với Status = `Draft`
- Customer không có email hoặc email rỗng

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote với Customer không có email
3. Thử gửi báo giá

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Customer email is required to send quotation. Please update customer email first."`
- Quote không được cập nhật

---

### TC-QUOTE-010: Finalize báo giá - Draft → Finalized

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote với Status = `Draft`
- Quote có ít nhất 1 item

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote có status `Draft`
3. Click nút "Khóa báo giá" / "Finalize"
4. Xác nhận

**Expected Result:**

- Quote status chuyển từ `Draft` → `Finalized`
- Quote `TotalAmount` được tính lại chính xác
- Success message hiển thị
- Quote không thể chỉnh sửa sau khi Finalized

---

### TC-QUOTE-011: Finalize báo giá thất bại - Quote không có items

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote với Status = `Draft` nhưng không có items

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote không có items
3. Thử Finalize

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Quote must have at least one item to be finalized."`
- Quote status không thay đổi

---

### TC-QUOTE-012: Convert Quote to Order - Finalized → Order Draft

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote với Status = `Finalized`
- Quote `LockedUntil` chưa expired
- Product vẫn Active

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote có status `Finalized`
3. Click nút "Chuyển thành đơn hàng" / "Convert to Order"
4. Xác nhận (nếu có prompt về promotion thay đổi)

**Expected Result:**

- Nếu Quantity = 1: Tạo 1 Order
- Nếu Quantity > 1: Tạo N Orders (mỗi Order có Quantity = 1)
- Order(s) có Status = `Draft`
- Order(s) có `QuoteId` = Quote ID
- Order `TotalAmount` = (UnitPrice × Qty) - LinePromo
- Success message hiển thị
- Redirect đến Order Management hoặc hiển thị Order(s) mới

---

### TC-QUOTE-013: Convert Quote to Order thất bại - Quote chưa Finalized

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote với Status = `Draft` (chưa Finalized)

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote có status `Draft`
3. Thử Convert to Order

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Quote must be Finalized and not expired."`
- Order không được tạo

---

### TC-QUOTE-014: Convert Quote to Order thất bại - Quote đã expired

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote với Status = `Finalized`
- Quote `LockedUntil` < DateTime.Now (đã expired)

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote đã expired
3. Thử Convert to Order

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Quote must be Finalized and not expired."`
- Order không được tạo

---

### TC-QUOTE-015: Convert Quote to Order - Promotion đã thay đổi

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote với Status = `Finalized`
- Promotion của Product đã thay đổi (tăng hoặc giảm)

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote
3. Click "Convert to Order"
4. System hiển thị thông báo promotion đã thay đổi
5. Click "Xác nhận" để tiếp tục với promotion mới

**Expected Result:**

- System hiển thị preview: OldTotalAmount vs NewTotalAmount
- System hiển thị: OldLinePromo vs NewLinePromo
- User có thể xác nhận hoặc hủy
- Nếu xác nhận: Order được tạo với promotion mới
- Nếu không xác nhận: Order không được tạo

---

### TC-QUOTE-016: Cancel Quote - Draft/Finalized → Cancelled

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote với Status = `Draft` hoặc `Finalized`

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote
3. Click nút "Hủy báo giá" / "Cancel"
4. Xác nhận

**Expected Result:**

- Quote status chuyển sang `Cancelled`
- Quote không thể Convert to Order sau khi Cancel
- Success message hiển thị

---

### TC-QUOTE-017: Cancel Quote thất bại - Quote đã Convert to Order

**Priority:** Medium  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Quote đã được Convert to Order (status = `Confirmed` hoặc khác)

**Test Steps:**

1. Vào trang Quotation Management
2. Xem chi tiết Quote đã Convert to Order
3. Thử Cancel Quote

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Không thể hủy báo giá có trạng thái là '{status}'."`
- Quote status không thay đổi

---

## ORDER MANAGEMENT

### TC-ORDER-001: Tạo Order trực tiếp (không qua Quote)

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Customer tồn tại thuộc dealer này
- Có Product Active với Pricebook Active

**Test Steps:**

1. Vào trang Order Management
2. Click "Tạo đơn hàng mới"
3. Chọn Customer
4. Chọn Product
5. Nhập Quantity
6. Click "Tạo đơn hàng"

**Expected Result:**

- Order được tạo thành công với Status = `Draft`
- Order tự động tính giá từ Pricebook
- Order tự động tính promotion
- Order `TotalAmount` = (UnitPrice × Quantity) - LinePromo
- Order hiển thị trong danh sách với status "Nháp"

---

### TC-ORDER-002: Tạo Order thất bại - Customer không thuộc dealer

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Customer thuộc dealer khác

**Test Steps:**

1. Vào trang Order Management
2. Click "Tạo đơn hàng mới"
3. Chọn Customer thuộc dealer khác
4. Chọn Product và Quantity
5. Click "Tạo đơn hàng"

**Expected Result:**

- HTTP Status Code: `404 Not Found` hoặc `400 Bad Request`
- Error message: `"Customer with ID {id} not found for this dealer."`
- Order không được tạo

---

### TC-ORDER-003: Tạo Order thất bại - Product không Active

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Customer hợp lệ
- Có Product với Status không phải `Active`

**Test Steps:**

1. Vào trang Order Management
2. Click "Tạo đơn hàng mới"
3. Chọn Product không Active
4. Click "Tạo đơn hàng"

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Sản phẩm '{name}' hiện đang ở trạng thái '{status}' và không thể tạo đơn hàng. Chỉ sản phẩm 'Active' mới có thể được bán."`
- Order không được tạo

---

### TC-ORDER-004: Xem danh sách Order

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có nhiều Order trong hệ thống (của dealer này và dealer khác)

**Test Steps:**

1. Vào trang Order Management
2. Xem danh sách Order

**Expected Result:**

- Chỉ hiển thị Order của dealer hiện tại
- KHÔNG hiển thị Order của dealer khác
- Mỗi Order hiển thị: Order ID, Customer, Product, Status, Total Amount, Create Date
- Danh sách được sắp xếp theo CreateAt (mới nhất trước)

---

### TC-ORDER-005: Xem chi tiết Order

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order tồn tại của dealer này

**Test Steps:**

1. Vào trang Order Management
2. Click vào 1 Order trong danh sách

**Expected Result:**

- Modal/Page chi tiết hiển thị
- Hiển thị đầy đủ: Order ID, Customer, Product, Quantity, Unit Price, Promotion, Total Amount, Status, Deposit Amount
- Hiển thị thông tin Contract (nếu có)
- Hiển thị thông tin Invoice và Payment (nếu có)
- Hiển thị thông tin VIN (nếu đã allocate)

---

### TC-ORDER-006: Create Contract cho Order

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Draft`
- Order chưa có Contract

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order có status `Draft`
3. Click nút "Tạo hợp đồng"
4. Nhập RequiredDepositAmount (ví dụ: 10% của TotalAmount)
5. Upload Contract file (nếu có)
6. Click "Tạo hợp đồng"

**Expected Result:**

- Contract được tạo thành công
- Contract có `ContractNo` (format: CONTRACT-YYYY-MMDDHHmmss)
- Contract có `FileUrl` (nếu upload file)
- Order `DepositRequirement` được set
- Order `AgreementId` được gán (nếu có Active DealerAgreement)
- Success message hiển thị
- Order hiển thị "Đã có hợp đồng"

---

### TC-ORDER-007: Create Contract thất bại - Order đã có Contract

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order đã có Contract

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order đã có Contract
3. Thử tạo Contract lại

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Contract already exists for this order."`
- Contract không được tạo

---

### TC-ORDER-008: Sign Contract

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order đã có Contract (chưa signed)

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order có Contract
3. Click nút "Ký hợp đồng" / "Sign Contract"
4. Xác nhận

**Expected Result:**

- Contract `SignedAt` được set = DateTime.UtcNow
- Success message hiển thị
- Order hiển thị "Đã ký hợp đồng"

---

### TC-ORDER-009: Sign Contract thất bại - Contract chưa có ContractNo

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order có Contract nhưng `ContractNo` = null hoặc rỗng

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order có Contract không có ContractNo
3. Thử Sign Contract

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Contract number is required before signing."`
- Contract không được signed

---

### TC-ORDER-010: Sign Contract thất bại - Contract đã signed

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order có Contract đã signed (`SignedAt` có giá trị)

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order có Contract đã signed
3. Thử Sign Contract lại

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Contract has already been signed."`
- Contract không được signed lại

---

### TC-ORDER-011: Add Deposit

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order đã có Contract (đã signed hoặc chưa)
- Order `DepositAmount` < Order `TotalAmount`

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order đã có Contract
3. Click nút "Thêm tiền đặt cọc" / "Add Deposit"
4. Nhập Amount (ví dụ: 50,000,000 VND)
5. Click "Xác nhận"

**Expected Result:**

- Order `DepositAmount` được cập nhật = DepositAmount cũ + Amount mới
- DepositAmount không vượt quá `TotalAmount`
- Dealer `WalletBalance` tăng lên = Amount
- Success message hiển thị

---

### TC-ORDER-012: Add Deposit thất bại - Chưa có Contract

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Draft` chưa có Contract

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order chưa có Contract
3. Thử Add Deposit

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Contract must be created before adding deposit."`
- Deposit không được thêm

---

### TC-ORDER-013: Add Deposit thất bại - Deposit vượt quá TotalAmount

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order đã có Contract
- Order `TotalAmount` = 500,000,000
- Order `DepositAmount` = 400,000,000

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order
3. Thử Add Deposit với Amount = 150,000,000 (tổng sẽ > TotalAmount)

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Total deposit amount cannot exceed order total amount: {totalAmount}"`
- Deposit không được thêm

---

### TC-ORDER-014: Confirm Order - Draft → Confirmed

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Draft`
- Order đã có Contract với `ContractNo` và `SignedAt`
- Order `DepositAmount` >= `DepositRequirement` (hoặc >= 10% TotalAmount)

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order đã có Contract signed và Deposit đủ
3. Click nút "Xác nhận đơn hàng" / "Confirm Order"
4. Xác nhận

**Expected Result:**

- Order status chuyển từ `Draft` → `Confirmed`
- Success message hiển thị
- Order hiển thị status "Đã xác nhận"

---

### TC-ORDER-015: Confirm Order thất bại - Chưa có Contract

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Draft` chưa có Contract

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order chưa có Contract
3. Thử Confirm Order

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Order must have a contract before confirmation."`
- Order status không thay đổi

---

### TC-ORDER-016: Confirm Order thất bại - Contract chưa signed

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Draft`
- Order có Contract nhưng `SignedAt` = null

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order có Contract chưa signed
3. Thử Confirm Order

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Contract must be signed before order confirmation."`
- Order status không thay đổi

---

### TC-ORDER-017: Confirm Order thất bại - Deposit chưa đủ

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Draft`
- Order có Contract signed
- Order `DepositAmount` < `DepositRequirement` (ví dụ: cần 10% nhưng chỉ có 5%)

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order có Deposit chưa đủ
3. Thử Confirm Order

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Minimum deposit amount required: {requiredAmount}. Current deposit: {currentAmount}"`
- Order status không thay đổi

---

### TC-ORDER-018: Confirm Order thất bại - Order status không phải Draft

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Confirmed` hoặc `Allocated` (không phải `Draft`)

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order không phải `Draft`
3. Thử Confirm Order

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Only orders with 'Draft' status can be confirmed. Current status: '{status}'."`
- Order status không thay đổi

---

### TC-ORDER-019: Allocate VIN - Confirmed → Allocated

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Confirmed` hoặc `Backordered`
- Dealer có đủ VIN `InStock` cho Product trong Order
- VIN chưa được gán cho Order khác (`OrderId` = null)

**Test Steps:**

1. Vào trang VIN Allocation Management
2. Chọn Order cần allocate VIN
3. Click "Phân bổ VIN tự động" hoặc chọn VIN thủ công
4. Click "Xác nhận"

**Expected Result:**

- Order status chuyển từ `Confirmed`/`Backordered` → `Allocated`
- VIN status chuyển từ `InStock` → `Allocated`
- VIN `OrderId` được gán
- VIN `OwnerType` = `Dealer`
- VIN `OwnerId` = CustomerId
- Success message hiển thị với danh sách VIN đã allocate

---

### TC-ORDER-020: Allocate VIN thất bại - Order status không hợp lệ

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Draft` (chưa Confirm)

**Test Steps:**

1. Vào trang VIN Allocation Management
2. Chọn Order có status `Draft`
3. Thử Allocate VIN

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Order status must be Confirmed or Backorder"`
- Order status không thay đổi
- VIN không được allocate

---

### TC-ORDER-021: Allocate VIN thất bại - Không đủ VIN InStock

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Confirmed`
- Order có Product với Quantity = 2
- Dealer chỉ có 1 VIN `InStock` cho Product đó

**Test Steps:**

1. Vào trang VIN Allocation Management
2. Chọn Order không đủ VIN
3. Thử Allocate VIN

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Allocation failed: No available VIN found for product {productId}"`
- Order status không thay đổi
- VIN không được allocate

---

### TC-ORDER-022: Backorder Order - Confirmed → Backordered

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Confirmed`
- Không đủ VIN để allocate ngay

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order có status `Confirmed`
3. Click nút "Đưa vào Backorder" / "Backorder"
4. Xác nhận

**Expected Result:**

- Order status chuyển từ `Confirmed` → `Backordered`
- Success message hiển thị
- Order có thể allocate VIN sau khi có VIN

---

### TC-ORDER-023: Backorder Order thất bại - Order status không phải Confirmed

**Priority:** Medium  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Draft` hoặc `Allocated`

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order không phải `Confirmed`
3. Thử Backorder

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Only Confirmed orders can be backordered. Current status: {status}"`
- Order status không thay đổi

---

### TC-ORDER-024: Schedule Delivery - Allocated → Ready

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Allocated`
- Order có VIN đang ở trạng thái `Allocated`

**Test Steps:**

1. Vào trang Delivery Schedule Management
2. Chọn Order có status `Allocated`
3. Nhập thông tin giao hàng:
   - Delivery Date (ngày trong tương lai)
   - Delivery Address
   - Contact Phone
   - Contact Name
4. Click "Đặt lịch giao hàng"

**Expected Result:**

- Order status chuyển từ `Allocated` → `Ready`
- Order `ScheduledDeliveryDate` được set
- Order `DeliveryAddress`, `DeliveryContactPhone`, `ReceiverName` được cập nhật
- Success message hiển thị

---

### TC-ORDER-025: Schedule Delivery thất bại - Order chưa có VIN Allocated

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Confirmed` (chưa Allocate VIN)

**Test Steps:**

1. Vào trang Delivery Schedule Management
2. Chọn Order chưa có VIN Allocated
3. Thử Schedule Delivery

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Order must have allocated VINs before scheduling delivery"`
- Order status không thay đổi

---

### TC-ORDER-026: Schedule Delivery thất bại - Delivery date trong quá khứ

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Allocated`

**Test Steps:**

1. Vào trang Delivery Schedule Management
2. Chọn Order
3. Nhập Delivery Date = ngày hôm qua
4. Click "Đặt lịch giao hàng"

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Delivery date cannot be in the past"`
- Order không được schedule

---

### TC-ORDER-027: Complete Delivery - Ready → Delivered

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Ready`
- Order có `ScheduledDeliveryDate`

**Test Steps:**

1. Vào trang Delivery Schedule Management
2. Chọn Order có status `Ready`
3. Click nút "Hoàn tất giao hàng" / "Complete Delivery"
4. Upload Delivery Document (nếu có)
5. Click "Xác nhận"

**Expected Result:**

- Order status chuyển từ `Ready` → `Delivered`
- Order `DeliveredAt` được set = DateTime.UtcNow
- Order `DeliveryDocUrl` được lưu (nếu upload)
- VIN status chuyển từ `Allocated` → `Delivered`
- Success message hiển thị

---

### TC-ORDER-028: Complete Delivery thất bại - Order status không phải Ready

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Allocated` (chưa Schedule Delivery)

**Test Steps:**

1. Vào trang Delivery Schedule Management
2. Chọn Order có status `Allocated`
3. Thử Complete Delivery

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Order status must be 'Ready' to complete delivery"`
- Order status không thay đổi

---

### TC-ORDER-029: Create Retail Invoice

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Confirmed` trở đi (đã Confirm)
- Order chưa có Invoice

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order đã Confirm
3. Click nút "Tạo hóa đơn" / "Create Invoice"
4. Xác nhận

**Expected Result:**

- Invoice Retail được tạo thành công
- Invoice có `InvoiceType` = `Retail`
- Invoice có `SalesDocId` = Order ID
- Invoice có `Amount` = Order `TotalAmount` (tổng OrderItems.LineTotal)
- Invoice có `Status` = `Pending`
- Success message hiển thị

---

### TC-ORDER-030: Create Retail Invoice thất bại - Order đã có Invoice

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order đã có Invoice Retail

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order đã có Invoice
3. Thử tạo Invoice lại

**Expected Result:**

- API trả về InvoiceId hiện tại (không tạo mới)
- Hoặc error message: Order đã có Invoice
- Không tạo Invoice trùng lặp

---

### TC-ORDER-031: Create Retail Payment (Cash)

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order đã có Invoice Retail với Status = `Pending`
- Invoice `Amount` = 500,000,000
- Order `DepositAmount` = 50,000,000
- Outstanding Amount = 450,000,000

**Test Steps:**

1. Vào trang Payment Management
2. Chọn Order có Invoice
3. Click "Thanh toán"
4. Chọn "Thanh toán tiền mặt"
5. Nhập Amount = Outstanding Amount (450,000,000)
6. Click "Xác nhận"

**Expected Result:**

- Payment được tạo thành công
- Payment `Method` = `Cash`
- Payment `Status` = `Captured`
- Payment `Amount` = Outstanding Amount
- Invoice `Status` chuyển từ `Pending` → `Paid` (nếu đủ tiền)
- Dealer `WalletBalance` tăng lên = Payment Amount
- Success message hiển thị

---

### TC-ORDER-032: Create Retail Payment thất bại - Amount không đúng

**Priority:** High  
**Test Type:** Functional / Validation / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order đã có Invoice Retail
- Outstanding Amount = 450,000,000

**Test Steps:**

1. Vào trang Payment Management
2. Chọn Order có Invoice
3. Click "Thanh toán"
4. Nhập Amount khác Outstanding Amount (ví dụ: 400,000,000 hoặc 500,000,000)
5. Click "Xác nhận"

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Số tiền thanh toán phải bằng tổng giá trị trừ tiền cọc và trừ tất cả các khoản đã thanh toán (còn lại: {outstandingAmount})"`
- Payment không được tạo

---

### TC-ORDER-033: Create Retail Payment - VNPay (Online)

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order đã có Invoice Retail với Status = `Pending`

**Test Steps:**

1. Vào trang Payment Management
2. Chọn Order có Invoice
3. Click "Thanh toán"
4. Chọn "Thanh toán online (VNPay)"
5. Click "Thanh toán"

**Expected Result:**

- Payment được tạo với Status = `Pending`
- Payment `Method` = `VNPay`
- System redirect đến VNPay payment page
- Hoặc hiển thị payment URL để user thanh toán

---

### TC-ORDER-034: Close Order - Delivered → Closed

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Delivered`
- Order đã có Invoice Retail
- Order đã thanh toán đủ: Deposit + Payments >= Invoice Amount

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order có status `Delivered` và đã thanh toán đủ
3. Click nút "Đóng đơn hàng" / "Close Order"
4. Xác nhận

**Expected Result:**

- Order status chuyển từ `Delivered` → `Closed`
- Success message hiển thị
- Order không thể thực hiện thêm action

---

### TC-ORDER-035: Close Order thất bại - Chưa thanh toán đủ

**Priority:** High  
**Test Type:** Functional / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với Status = `Delivered`
- Order có Invoice với Amount = 500,000,000
- Order DepositAmount = 50,000,000
- Total Payments = 400,000,000
- Outstanding = 50,000,000 (chưa đủ)

**Test Steps:**

1. Vào trang Order Management
2. Xem chi tiết Order chưa thanh toán đủ
3. Thử Close Order

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Chưa thanh toán đủ tổng tiền sau khi trừ đặt cọc."`
- Order status không thay đổi

---

### TC-ORDER-036: Filter Order theo Status

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có Order với các status: Draft, Confirmed, Allocated, Ready, Delivered, Closed

**Test Steps:**

1. Vào trang Order Management
2. Chọn filter status: "Tất cả", "Draft", "Confirmed", "Allocated", "Ready", "Delivered", "Closed"
3. Kiểm tra danh sách được filter

**Expected Result:**

- Danh sách chỉ hiển thị Order có status tương ứng
- Filter hoạt động đúng

---

### TC-ORDER-037: Search Order theo Order ID hoặc Customer

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- User đã login với role `DealerStaff`
- Có nhiều Order trong danh sách

**Test Steps:**

1. Vào trang Order Management
2. Nhập keyword vào search box (ví dụ: "Order-10" hoặc tên Customer)
3. Kiểm tra kết quả

**Expected Result:**

- Danh sách chỉ hiển thị Order có ID hoặc Customer name chứa keyword
- Search không phân biệt hoa thường

---

## CUSTOMER MANAGEMENT

### TC-CUST-001: Tạo Customer thành công

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- User đã login với role `DealerStaff`

**Test Steps:**

1. Vào trang Customer Management
2. Click "Tạo khách hàng mới"
3. Nhập: FullName, Phone, Email, Address, CitizenId
4. Click "Tạo"

**Expected Result:**

- Customer được tạo với `Status` = `Active`
- Thuộc về dealer hiện tại
- Hiển thị trong danh sách

---

### TC-CUST-002: Tạo Customer thất bại - Thiếu FullName

**Priority:** High  
**Test Type:** Validation / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`

**Test Steps:**

1. Vào trang Customer Management
2. Click "Tạo khách hàng mới"
3. Để trống FullName, nhập các field khác hợp lệ
4. Click "Tạo"

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Full name is required."`
- Customer không được tạo

---

### TC-CUST-003: Tạo Customer thất bại - Phone trùng trong cùng dealer

**Priority:** High  
**Test Type:** Validation / API / Negative  
**Preconditions:**

- Đã có Customer với Phone = 0901234567 thuộc dealer hiện tại

**Test Steps:**

1. Tạo Customer mới với Phone = 0901234567

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Phone number already exists for this dealer."`
- Customer không được tạo

---

### TC-CUST-004: Tạo Customer thất bại - Email không hợp lệ

**Priority:** High  
**Test Type:** Validation / API / Negative  
**Preconditions:**

- User đã login với role `DealerStaff`

**Test Steps:**

1. Nhập Email = "abc@"
2. Click "Tạo"

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Email is invalid."`
- Customer không được tạo

---

### TC-CUST-005: Xem danh sách Customer (chỉ của dealer hiện tại)

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- Có nhiều Customer thuộc nhiều dealer

**Test Steps:**

1. Vào trang Customer Management
2. Xem danh sách

**Expected Result:**

- Chỉ hiển thị Customer của dealer hiện tại
- Mỗi dòng hiển thị: Name, Phone, Email, Status, CreatedAt
- Sắp xếp CreatedAt giảm dần

---

### TC-CUST-006: Xem chi tiết Customer

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- Có Customer hợp lệ

**Test Steps:**

1. Click vào 1 Customer trong danh sách

**Expected Result:**

- Hiển thị: Profile, Contacts, Orders, Payments, Notes, Documents

---

### TC-CUST-007: Cập nhật Customer thành công

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- Có Customer hợp lệ

**Test Steps:**

1. Mở chi tiết Customer
2. Click "Chỉnh sửa"
3. Cập nhật Address và Email hợp lệ
4. Lưu

**Expected Result:**

- Thông tin được cập nhật
- Hiển thị thông báo thành công

---

### TC-CUST-008: Cập nhật Customer thất bại - Email trùng trong dealer

**Priority:** High  
**Test Type:** Validation / API / Negative  
**Preconditions:**

- Đã có Customer A với Email = a@demo.com
- Customer B thuộc cùng dealer

**Test Steps:**

1. Sửa Customer B, đặt Email = a@demo.com
2. Lưu

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Email already exists for this dealer."`
- Không lưu thay đổi

---

### TC-CUST-009: Deactivate Customer

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- Customer đang `Active`

**Test Steps:**

1. Mở Customer
2. Click "Deactivate"
3. Xác nhận

**Expected Result:**

- `Status` chuyển `Inactive`
- Customer không thể tạo Order mới

---

### TC-CUST-010: Reactivate Customer

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- Customer đang `Inactive`

**Test Steps:**

1. Mở Customer
2. Click "Reactivate"
3. Xác nhận

**Expected Result:**

- `Status` chuyển `Active`

---

### TC-CUST-011: Search Customer theo tên/phone/email

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- Có nhiều Customer

**Test Steps:**

1. Nhập keyword vào search box

**Expected Result:**

- Danh sách lọc theo keyword, không phân biệt hoa thường

---

### TC-CUST-012: Filter Customer theo Status

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- Có Customer ở các trạng thái Active, Inactive

**Test Steps:**

1. Chọn filter "Tất cả", "Active", "Inactive"

**Expected Result:**

- Danh sách hiển thị đúng theo filter

---

### TC-CUST-013: Phân quyền - DealerStaff chỉ xem Customer của dealer mình

**Priority:** High  
**Test Type:** Security / API  
**Preconditions:**

- Tồn tại Customer của dealer khác

**Test Steps:**

1. Gọi API get detail của Customer thuộc dealer khác

**Expected Result:**

- HTTP Status Code: `404 Not Found` hoặc `403 Forbidden`

---

### TC-CUST-014: Upload giấy tờ tùy thân cho Customer

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- Có Customer hợp lệ

**Test Steps:**

1. Mở tab Documents
2. Upload file PDF/JPG < 10MB

**Expected Result:**

- Tệp được lưu, hiển thị link tải

---

### TC-CUST-015: Upload thất bại - Định dạng không hỗ trợ

**Priority:** Medium  
**Test Type:** Validation / Negative  
**Preconditions:**

- Có Customer hợp lệ

**Test Steps:**

1. Upload file `.exe`

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Unsupported file type."`

---

### TC-CUST-016: Ghi chú (Notes) cho Customer

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- Có Customer hợp lệ

**Test Steps:**

1. Thêm note "Khách quan tâm VF9 màu trắng"

**Expected Result:**

- Note được lưu với CreatedBy, CreatedAt

---

### TC-CUST-017: Merge Customer trùng (theo Phone)

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- Hai Customer có cùng Phone, khác Email

**Test Steps:**

1. Chọn 2 bản ghi và click "Merge"
2. Chọn bản ghi giữ lại

**Expected Result:**

- Gộp thành 1 Customer
- Bảo toàn Orders/Payments liên quan

---

### TC-CUST-018: Xóa mềm Customer (Soft Delete)

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- Customer không có Order đang hoạt động

**Test Steps:**

1. Click "Delete"
2. Xác nhận

**Expected Result:**

- `DeletedAt` được set
- Không xuất hiện trong danh sách mặc định

---

### TC-CUST-019: Xóa thất bại - Customer có Order đang hoạt động

**Priority:** High  
**Test Type:** Validation / Negative  
**Preconditions:**

- Customer có Order status != `Closed`/`Cancelled`

**Test Steps:**

1. Thử Delete

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message: `"Cannot delete customer with active orders."`

---

### TC-CUST-020: Import Customer từ CSV

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- File CSV hợp lệ gồm 100 dòng

**Test Steps:**

1. Chọn file CSV
2. Click "Import"

**Expected Result:**

- Tạo mới/Update theo key (Phone/Email)
- Hiển thị báo cáo kết quả (thành công/lỗi)

---

### TC-CUST-021: Export danh sách Customer ra CSV

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- Có danh sách hiện tại với filter/search

**Test Steps:**

1. Click "Export CSV"

**Expected Result:**

- Tải về file CSV theo list đã lọc

---

### TC-CUST-022: Pagination danh sách Customer

**Priority:** Medium  
**Test Type:** Functional / UI  
**Preconditions:**

- Có > 100 Customers

**Test Steps:**

1. Chuyển các trang 1, 2, 3...
2. Đổi page size (10/25/50)

**Expected Result:**

- Phân trang hoạt động mượt, tổng số đúng

---

### TC-CUST-023: Liên kết Customer với Order history

**Priority:** High  
**Test Type:** Functional / API  
**Preconditions:**

- Customer có nhiều Orders

**Test Steps:**

1. Mở tab Orders trong chi tiết Customer

**Expected Result:**

- Hiển thị danh sách Orders của Customer (đúng dealer)

---

### TC-CUST-024: Gửi email cho Customer (nếu có email)

**Priority:** Medium  
**Test Type:** Functional / Integration  
**Preconditions:**

- Customer có Email hợp lệ

**Test Steps:**

1. Click "Gửi email"
2. Nhập nội dung, gửi

**Expected Result:**

- Hiển thị trạng thái gửi (queued/sent)

---

### TC-CUST-025: Đồng ý xử lý dữ liệu (Consent/GDPR)

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- Customer có trường Consent

**Test Steps:**

1. Tích chọn "Đồng ý"
2. Lưu

**Expected Result:**

- Consent timestamp và user được ghi nhận

---

### TC-CUST-026: Validate CitizenId (CCCD/CMND) trùng hoặc sai định dạng

**Priority:** High  
**Test Type:** Validation / API / Negative  
**Preconditions:**

- Có quy tắc: 9 hoặc 12 số

**Test Steps:**

1. Nhập CitizenId = "1234"
2. Hoặc nhập trùng CitizenId đã tồn tại trong dealer

**Expected Result:**

- HTTP Status Code: `400 Bad Request`
- Error message phù hợp

---

### TC-CUST-027: Đặt Customer làm Default Contact cho Dealer Agreement

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- Dealer có Active DealerAgreement

**Test Steps:**

1. Chọn Customer
2. Set "Default Agreement Contact"

**Expected Result:**

- Thông tin liên hệ được gắn vào Agreement

---

### TC-CUST-028: Tự động chuẩn hóa dữ liệu tên/phone

**Priority:** Medium  
**Test Type:** Functional  
**Preconditions:**

- Bật rule chuẩn hóa (trim, title case, bỏ khoảng trắng)

**Test Steps:**

1. Tạo Customer với " nguyễn văn a "
2. Phone = " 0901 234 567 "

**Expected Result:**

- Lưu tên = "Nguyễn Văn A"
- Phone = "0901234567"

---

### TC-CUST-029: Gắn Customer vào Campaign/Promotion scope (nếu có)

**Priority:** Medium  
**Test Type:** Functional / API  
**Preconditions:**

- Có Campaign hoặc Promotion scope theo khách hàng

**Test Steps:**

1. Liên kết Customer với campaign

**Expected Result:**

- Customer hiển thị trong scope tương ứng

---

### TC-CUST-030: Kiểm tra giới hạn tạo khách theo ngày (rate limit)

**Priority:** Medium  
**Test Type:** Performance / Negative  
**Preconditions:**

- Rule: Mỗi DealerStaff chỉ được tạo <= N khách/ngày

**Test Steps:**

1. Tạo liên tiếp > N khách

**Expected Result:**

- HTTP Status Code: `429 Too Many Requests` hoặc `400 Bad Request`
- Thông báo giới hạn

---

## SUMMARY

**Total Test Cases:** 67

### Quote Management: 17 test cases

- **High Priority:** 12 test cases
- **Medium Priority:** 5 test cases

### Order Management: 20 test cases

- **High Priority:** 15 test cases
- **Medium Priority:** 5 test cases

### Customer Management: 30 test cases

- **High Priority:** 12 test cases
- **Medium Priority:** 18 test cases

**Test Type Breakdown:**

- Functional: 52 test cases
- Validation: 12 test cases
- Security: 1 test case
- Integration: 1 test case
- Performance: 1 test case
