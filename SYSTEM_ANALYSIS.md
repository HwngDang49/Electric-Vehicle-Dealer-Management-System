# Phân Tích Hệ Thống - Electric Vehicle Dealer Management System

## 📋 Mục Lục

1. [Claim => Approved => Settlement](#1-claim--approved--settlement)
2. [Inventory => PO](#2-inventory--po)
3. [Invoice => PO](#3-invoice--po)
4. [Payment => PO](#4-payment--po)
5. [Purchase Orders](#5-purchase-orders)
6. [Rebates](#6-rebates)
7. [VNPay](#7-vnpay)
8. [User](#8-user)
9. [Background Services](#9-background-services)
10. [Email](#10-email)

---

## 1. Claim => Approved => Settlement

### 📊 Tổng Quan

**Claim** là yêu cầu thanh toán rebate được tạo tự động bởi background service. Sau khi được **Approve**, có thể tạo **Settlement** để thanh toán.

### 🔄 Quy Trình

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Background Service tạo Claim                             │
│    - Status: "Pending"                                       │
│    - Amount: Tính dựa trên rebate tiers                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. EVM Staff/Admin Approve Claim                            │
│    - Status: "Pending" → "Approved"                         │
│    - ResolvedAt: Được set                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Tạo Settlement (Thanh Toán)                              │
│    - Có thể thanh toán nhiều lần (partial payment)          │
│    - Có thể thanh toán qua VNPay hoặc manual                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Cập Nhật Claim Status                                    │
│    - Nếu TotalPaid >= Amount → Status: "Settled"            │
│    - Nếu TotalPaid < Amount → Giữ nguyên "Approved"         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Cập Nhật Dealer WalletBalance                            │
│    - WalletBalance += PaidAmount                            │
└─────────────────────────────────────────────────────────────┘
```

### 📝 Entities

**Claim:**

- `ClaimId`, `DealerId`, `AgreementId`, `Period`
- `Amount`, `Status` (Pending, Approved, Rejected, Settled)
- `CreatedAt`, `ResolvedAt`

**Settlement:**

- `SettlementId`, `ClaimId`
- `PaidAmount`, `PaidAt`, `ReferenceNo`

### 🔑 Key Points

- Claim được tạo tự động bởi `RebateCalculationService`
- Chỉ có thể approve/reject claims có status "Pending"
- Settlement có thể thanh toán nhiều lần (partial payment)
- Khi thanh toán đủ, Claim status → "Settled"
- WalletBalance được cộng khi tạo settlement

---

## 2. Inventory => PO

### 📊 Tổng Quan

**Inventory** (VIN) được tạo và gán cho **Purchase Order (PO)** khi PO được confirm. VIN chuyển từ trạng thái "InStock" sang "Allocated".

### 🔄 Quy Trình

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Manufacturer có VIN trong Inventory                      │
│    - Status: "InStock"                                      │
│    - OwnerType: "Manufacturer"                              │
│    - LocationType: "Manufacturer"                           │
│    - PoId: NULL                                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Dealer tạo Purchase Order                                │
│    - Status: "Draft" → "Submitted" → "Approved"             │
│    - PoItems: [ProductId, Qty]                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. EVM Staff Confirm PO (Auto hoặc Manual)                  │
│    - Kiểm tra VIN có đủ không (InStock, Manufacturer)       │
│    - Allocate VIN: InStock → Allocated                      │
│    - Gán PoId cho VIN                                       │
│    - Status: "Confirm"                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Issue Delivery (EVM Staff)                               │
│    - VIN: Allocated → InTransit                             │
│    - LocationType: "OnRoad"                                 │
│    - PO Status: "InTransit"                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Confirm Delivery (Dealer)                                │
│    - VIN: InTransit → InStock                               │
│    - OwnerType: "Manufacturer" → "Dealer"                   │
│    - LocationType: "OnRoad" → "Branch"                      │
│    - DealerId, BranchId: Được set                           │
│    - PO Status: "Delivery"                                  │
└─────────────────────────────────────────────────────────────┘
```

### 📝 Entities

**Inventory:**

- `Vin` (PK), `ProductId`, `Status` (InStock, Allocated, InTransit, Allocated)
- `OwnerType` (Manufacturer, Dealer), `OwnerId`
- `LocationType` (Manufacturer, Branch, OnRoad), `LocationId`
- `PoId`, `OrderId`, `DealerId`, `BranchId`
- `ReceivedAt`, `CreatedAt`

**PurchaseOrder:**

- `PoId`, `DealerId`, `BranchId`
- `Status` (Draft, Submitted, Approved, Confirm, InTransit, Delivery)
- `TotalAmount`, `ExpectedDate`

### 🔑 Key Points

- VIN được allocate khi PO được confirm
- VIN chuyển từ Manufacturer → Dealer khi delivery
- VIN có thể được gán cho Order (retail sales)
- VIN status: InStock → Allocated → InTransit → InStock (ở Dealer)

---

## 3. Invoice => PO

### 📊 Tổng Quan

**Invoice** được tạo từ **Purchase Order** sau khi PO được confirm. Invoice có 2 loại: **B2B** (từ PO) và **Retail** (từ Order).

### 🔄 Quy Trình

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PO được Confirm                                          │
│    - Status: "Confirm"                                      │
│    - VIN đã được allocated                                  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. EVM Staff tạo Invoice B2B                                │
│    - InvoiceType: "B2B"                                     │
│    - PoId: Liên kết với PO                                  │
│    - Amount: Tổng từ PoItems                                │
│    - Status: "Pending"                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Cập Nhật Dealer CreditUsed                               │
│    - CreditUsed += Invoice.Amount                           │
│    - CreditAvailable = CreditLimit - CreditUsed             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Dealer Thanh Toán Invoice                                │
│    - Tạo Payment                                            │
│    - Thanh toán qua VNPay hoặc manual                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Invoice Status: "Pending" → "Processing" → "Paid"        │
│    - Khi thanh toán thành công                              │
│    - CreditUsed -= Payment.Amount                           │
│    - WalletBalance -= Payment.Amount (B2B)                  │
└─────────────────────────────────────────────────────────────┘
```

### 📝 Entities

**Invoice:**

- `InvoiceId`, `InvoiceType` (B2B, Retail)
- `DealerId`, `PoId` (B2B), `SalesDocId` (Retail)
- `InvoiceNo`, `Amount`, `Status` (Pending, Processing, Paid)
- `IssuedAt`, `DueAt`

**PurchaseOrder:**

- `PoId`, `DealerId`, `BranchId`
- `Status`, `TotalAmount`
- `Invoices` (Collection)

### 🔑 Key Points

- Invoice B2B được tạo từ PO (1 PO → 1 Invoice)
- Invoice Retail được tạo từ Order (1 Order → 1 Invoice)
- Khi tạo Invoice B2B, `CreditUsed` được cộng
- Khi thanh toán Invoice, `CreditUsed` được trừ và `WalletBalance` được trừ (B2B)
- Invoice phải có status "Confirm" trước khi tạo

---

## 4. Payment => PO

### 📊 Tổng Quan

**Payment** được tạo để thanh toán **Invoice** (B2B từ PO hoặc Retail từ Order). Payment có thể thanh toán qua VNPay hoặc manual.

### 🔄 Quy Trình

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Invoice được tạo (từ PO hoặc Order)                      │
│    - Status: "Pending"                                      │
│    - Amount: Tổng giá trị                                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Dealer tạo Payment                                       │
│    - Kiểm tra WalletBalance đủ (B2B)                        │
│    - Payment Status: "Pending"                              │
│    - Invoice Status: "Pending" → "Processing"               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Thanh Toán (VNPay hoặc Manual)                           │
│    - VNPay: Tạo payment URL → Redirect → Callback           │
│    - Manual: EVM Staff confirm payment                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Confirm Payment (EVM Staff hoặc VNPay Callback)          │
│    - Payment Status: "Pending" → "Captured"                 │
│    - Invoice Status: "Processing" → "Paid"                  │
│    - CreditUsed -= Payment.Amount                           │
│    - WalletBalance -= Payment.Amount (B2B)                  │
└─────────────────────────────────────────────────────────────┘
```

### 📝 Entities

**Payment:**

- `PaymentId`, `InvoiceId`
- `Amount`, `Status` (Pending, Processing, Captured, Paid)
- `Method` (VNPay, Cash, Bank Transfer)
- `PaidAt`, `ReferenceNo`, `Note`
- `CreatedBy`

**Invoice:**

- `InvoiceId`, `InvoiceType` (B2B, Retail)
- `PoId` (B2B), `SalesDocId` (Retail)
- `Amount`, `Status` (Pending, Processing, Paid)
- `Payments` (Collection)

### 🔑 Key Points

- Payment được tạo để thanh toán Invoice
- B2B Payment: Kiểm tra WalletBalance đủ trước khi tạo
- Retail Payment: Cộng vào WalletBalance khi thanh toán
- Payment có thể thanh toán qua VNPay hoặc manual
- Khi thanh toán thành công, `CreditUsed` được trừ và `WalletBalance` được trừ (B2B)

---

## 5. Purchase Orders

### 📊 Tổng Quan

**Purchase Order (PO)** là đơn đặt hàng từ Dealer đến Manufacturer. PO trải qua nhiều trạng thái từ Draft đến Delivery.

### 🔄 Quy Trình

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Dealer tạo PO (Draft)                                    │
│    - Status: "Draft"                                        │
│    - PoItems: [ProductId, Qty, UnitWholesale]               │
│    - TotalAmount: Tính từ PoItems                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Dealer Submit PO                                         │
│    - Status: "Draft" → "Submitted"                          │
│    - SubmittedBy: UserId                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. EVM Staff Approve PO                                     │
│    - Status: "Submitted" → "Approved"                       │
│    - ApprovedBy: UserId                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. EVM Staff Confirm PO (Auto hoặc Manual)                  │
│    - Kiểm tra CreditAvailable đủ                            │
│    - Kiểm tra VIN có đủ (InStock, Manufacturer)             │
│    - Allocate VIN: InStock → Allocated                      │
│    - Gán PoId cho VIN                                       │
│    - Status: "Approved" → "Confirm"                         │
│    - CreditUsed += TotalAmount                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. EVM Staff tạo Invoice B2B                                │
│    - Invoice được tạo từ PO                                 │
│    - Invoice Status: "Pending"                              │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. EVM Staff Issue Delivery                                 │
│    - VIN: Allocated → InTransit                             │
│    - PO Status: "Confirm" → "InTransit"                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Dealer Confirm Delivery                                  │
│    - VIN: InTransit → InStock (ở Dealer)                    │
│    - OwnerType: "Manufacturer" → "Dealer"                   │
│    - PO Status: "InTransit" → "Delivery"                    │
└─────────────────────────────────────────────────────────────┘
```

### 📝 Entities

**PurchaseOrder:**

- `PoId`, `DealerId`, `BranchId`
- `Status` (Draft, Submitted, Approved, Confirm, InTransit, Delivery)
- `TotalAmount`, `ExpectedDate`
- `CreateBy`, `SubmittedBy`, `ApprovedBy`, `ConfirmedBy`
- `PoItems` (Collection), `Invoices` (Collection)

**PoItem:**

- `PoItemId`, `PoId`, `ProductId`
- `Qty`, `UnitWholesale`, `LineTotal`

### 🔑 Key Points

- PO trải qua nhiều trạng thái: Draft → Submitted → Approved → Confirm → InTransit → Delivery
- Khi confirm PO, VIN được allocate và CreditUsed được cộng
- Invoice B2B được tạo từ PO sau khi confirm
- VIN chuyển từ Manufacturer → Dealer khi delivery
- PO có thể confirm auto (FIFO) hoặc manual (chọn VIN)

---

## 6. Rebates

### 📊 Tổng Quan

**Rebates** là hệ thống tính toán và thanh toán hoa hồng cho Dealer dựa trên số lượng xe đã giao hàng theo hợp đồng rebate.

### 🔄 Quy Trình

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Admin tạo Dealer Agreement + Rebate Tiers                │
│    - Agreement Status: "Active"                             │
│    - Rebate Tiers: [Period, TierQty, RebatePerUnit, Cap]   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Orders được Giao Hàng                                    │
│    - Order Status: "Delivered" hoặc "Closed"                │
│    - Order AgreementId: Liên kết với Agreement              │
│    - Order DeliveredAt: Ngày giao hàng                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Background Service tính Rebate (mỗi 6 giờ)               │
│    - Tính tổng units delivered theo Period                  │
│    - Tìm tier phù hợp                                       │
│    - Tính rebate amount                                     │
│    - Tạo Claim với Status: "Pending"                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. EVM Staff/Admin Approve Claim                            │
│    - Claim Status: "Pending" → "Approved"                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Tạo Settlement (Thanh Toán)                              │
│    - Có thể thanh toán nhiều lần                            │
│    - Có thể thanh toán qua VNPay hoặc manual                │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Cập Nhật Claim Status                                    │
│    - Nếu TotalPaid >= Amount → Status: "Settled"            │
│    - WalletBalance += PaidAmount                            │
└─────────────────────────────────────────────────────────────┘
```

### 📝 Entities

**DealerAgreement:**

- `AgreementId`, `DealerId`, `Code`, `Title`
- `StartDate`, `EndDate`, `Status` (Draft, Active, Expired)
- `AgreementRebates` (Collection)

**AgreementRebate:**

- `RebateId`, `AgreementId`, `Period` (YYYY-MM)
- `TierQty`, `RebatePerUnit`, `CapAmount`

**Claim:**

- `ClaimId`, `DealerId`, `AgreementId`, `Period`
- `Amount`, `Status` (Pending, Approved, Rejected, Settled)
- `Settlements` (Collection)

**Settlement:**

- `SettlementId`, `ClaimId`
- `PaidAmount`, `PaidAt`, `ReferenceNo`

### 🔑 Key Points

- Rebate được tính tự động bởi background service
- Claim được tạo cho mỗi AgreementId + Period
- Settlement có thể thanh toán nhiều lần (partial payment)
- WalletBalance được cộng khi thanh toán settlement
- Rebate tiers có thể có cap amount (giới hạn tối đa)

---

## 7. VNPay

### 📊 Tổng Quan

**VNPay** là cổng thanh toán tích hợp để thanh toán Invoice (B2B/Retail) và Settlement (Rebate Claims).

### 🔄 Quy Trình

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Tạo Payment URL                                          │
│    - Invoice Payment: POST /vnpay/create                    │
│    - Settlement Payment: POST /vnpay/settlement/create      │
│    - Tạo payment URL với parameters                         │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Redirect đến VNPay                                       │
│    - User thanh toán trên VNPay                             │
│    - VNPay xử lý thanh toán                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. VNPay Callback (Return URL)                              │
│    - VNPay redirect về returnUrl                            │
│    - Handler xử lý callback                                 │
│    - Kiểm tra signature (HMAC SHA512)                       │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. VNPay IPN (Instant Payment Notification)                 │
│    - VNPay gửi IPN đến server                               │
│    - Handler xử lý IPN (async)                              │
│    - Kiểm tra signature                                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Cập Nhật Payment/Settlement                              │
│    - Nếu thành công:                                        │
│      + Payment Status: "Captured"                           │
│      + Invoice Status: "Paid"                               │
│      + Settlement ReferenceNo: VNPay transaction ref        │
│      + CreditUsed -= Amount (B2B)                           │
│      + WalletBalance -= Amount (B2B)                        │
│      + WalletBalance += Amount (Settlement)                 │
│    - Nếu thất bại:                                          │
│      + Payment/Settlement Status: Giữ nguyên hoặc xóa      │
└─────────────────────────────────────────────────────────────┘
```

### 📝 Payment Types

**Invoice Payment:**

- `vnp_TxnRef`: PaymentId
- `vnp_OrderInfo`: Invoice payment info
- Payment cho Invoice B2B hoặc Retail

**Settlement Payment:**

- `vnp_TxnRef`: `SETTLEMENT_{SettlementId}`
- `vnp_OrderInfo`: `RebateSettlement_Claim{ClaimId}_Settlement{SettlementId}`
- Payment cho Rebate Claim Settlement

### 🔑 Key Points

- VNPay hỗ trợ thanh toán Invoice và Settlement
- Payment URL được tạo với signature (HMAC SHA512)
- Callback và IPN được xử lý để cập nhật payment status
- Payment thành công → Cập nhật Invoice/Settlement status
- Payment thất bại → Xóa hoặc giữ nguyên payment record

---

## 8. User

### 📊 Tổng Quan

**User** là người dùng hệ thống với các roles khác nhau: Admin, EVMStaff, DealerManager, DealerStaff.

### 📝 Entities

**User:**

- `UserId`, `Email`, `PasswordHash`, `Salting`
- `FullName`, `Role` (Admin, EVMStaff, DealerManager, DealerStaff)
- `Status` (Active, Inactive)
- `DealerId`, `BranchId` (optional)
- `CreateAt`, `UpdateAt`

### 🔑 Roles & Permissions

**Admin:**

- ✅ Quản lý tất cả dealers, users, agreements
- ✅ Xem tất cả claims, invoices, payments
- ✅ Approve/reject claims
- ✅ Tạo rebate tiers
- ✅ Quản lý hệ thống

**EVMStaff:**

- ✅ Quản lý purchase orders
- ✅ Confirm PO, allocate VIN
- ✅ Tạo invoices
- ✅ Issue delivery
- ✅ Approve/reject claims
- ✅ Tạo settlements
- ✅ Xem tất cả claims, invoices

**DealerManager:**

- ✅ Quản lý dealer của mình
- ✅ Tạo purchase orders
- ✅ Xem claims của dealer mình
- ✅ Xem invoices, payments của dealer mình
- ✅ Confirm delivery
- ✅ Quản lý inventory của dealer

**DealerStaff:**

- ✅ Tạo orders (retail)
- ✅ Xem orders, invoices của dealer mình
- ✅ Quản lý customers
- ✅ Xem inventory của dealer mình

### 🔑 Key Points

- User được authenticate qua JWT token
- JWT token chứa: UserId, Role, DealerId, BranchId
- DealerManager/DealerStaff chỉ xem được data của dealer mình
- Admin/EVMStaff xem được tất cả data
- User có thể có DealerId và BranchId (nếu là dealer user)

---

## 9. Background Services

### 📊 Tổng Quan

**Background Services** là các service chạy định kỳ để xử lý các tác vụ tự động trong hệ thống.

### 🔄 Services

**1. RebateCalculationService:**

- **Tần suất:** Mỗi 6 giờ (Production) hoặc 30 giây (Demo)
- **Chức năng:**
  - Tính rebate dựa trên orders đã delivered
  - Tạo claims cho các agreements có rebate tiers
  - Kiểm tra duplicate claims
- **Logic:**
  - Lấy tất cả Active agreements có rebate tiers
  - Tính tổng units delivered theo Period
  - Tìm tier phù hợp
  - Tạo claim với Status: "Pending"

**2. PricebookExpirationService:**

- **Tần suất:** Mỗi 1 giờ
- **Chức năng:**
  - Chuyển pricebooks sang Expired khi qua effective_to
  - Cập nhật status: "Active" → "Expired"
- **Logic:**
  - Lấy tất cả pricebooks Active nhưng đã qua effective_to
  - Cập nhật status sang "Expired"
  - Lưu vào database

### 🔑 Key Points

- Background services chạy định kỳ tự động
- RebateCalculationService tính rebate và tạo claims
- PricebookExpirationService expire pricebooks
- Services được đăng ký trong `ServiceCollectionExtensions`
- Services có error handling để không block các service khác

---

## 10. Email

### 📊 Tổng Quan

**Email Service** được sử dụng để gửi email thông báo cho users, ví dụ: gửi quotation cho customers.

### 🔄 Quy Trình

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User thực hiện action (ví dụ: Send Quote)                │
│    - Action trigger email sending                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Email Service gửi email                                  │
│    - Sử dụng MailKit/SMTP                                   │
│    - Gửi email với HTML content                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Email được gửi đến recipient                             │
│    - Customer nhận quotation email                          │
│    - User nhận notification email                           │
└─────────────────────────────────────────────────────────────┘
```

### 📝 Email Service

**IEmailService:**

- `SendEmailAsync(toEmail, toName, subject, htmlBody)`
- `SendWelcomeEmailAsync(toEmail, fullName, temporaryPassword, role)`

**Email Templates:**

- `QuotationEmailTemplate`: Template cho quotation email
- Các template khác (nếu có)

### 🔑 Key Points

- Email service sử dụng MailKit/SMTP
- Email được gửi async (không block main process)
- Email có thể fail nhưng không ảnh hưởng đến business logic
- Email templates được tạo sẵn
- Email service có thể được sử dụng cho nhiều mục đích (quotation, notification, etc.)

---

## 📊 Sơ Đồ Tổng Quan Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                    ELECTRIC VEHICLE DEALER                  │
│                   MANAGEMENT SYSTEM                         │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   PURCHASE   │    │    ORDERS    │    │   REBATES    │
│   ORDERS     │    │   (Retail)   │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  INVENTORY   │    │   INVOICES   │    │   CLAIMS     │
│   (VINs)     │    │              │    │              │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       │                   ▼                   ▼
       │            ┌──────────────┐    ┌──────────────┐
       │            │   PAYMENTS   │    │ SETTLEMENTS  │
       │            │              │    │              │
       │            └──────┬───────┘    └──────┬───────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │    VNPay     │
                    │   Payment    │
                    └──────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   WALLET     │   │    CREDIT    │   │    EMAIL     │
│  BALANCE     │   │    USED      │   │  NOTIFICATION│
└──────────────┘   └──────────────┘   └──────────────┘
```

---

## 🔗 Mối Quan Hệ Giữa Các Phần

### 1. Purchase Order Flow

```
PO → Confirm → Allocate VIN → Create Invoice → Payment → Update WalletBalance
```

### 2. Rebate Flow

```
Orders Delivered → Background Service → Claim → Approve → Settlement → Update WalletBalance
```

### 3. Inventory Flow

```
Manufacturer VIN → PO Confirm → Allocated → Issue Delivery → InTransit → Confirm Delivery → Dealer VIN
```

### 4. Payment Flow

```
Invoice → Create Payment → VNPay → Callback/IPN → Confirm Payment → Update CreditUsed/WalletBalance
```

### 5. Settlement Flow

```
Claim → Approve → Create Settlement → VNPay → Callback → Update WalletBalance → Claim Settled
```

---

## 📝 Tóm Tắt

### Key Entities:

1. **PurchaseOrder** - Đơn đặt hàng từ Dealer
2. **Inventory** - VIN (Vehicle Identification Number)
3. **Invoice** - Hóa đơn (B2B từ PO hoặc Retail từ Order)
4. **Payment** - Thanh toán cho Invoice
5. **Claim** - Yêu cầu thanh toán rebate
6. **Settlement** - Thanh toán cho Claim
7. **DealerAgreement** - Hợp đồng rebate
8. **User** - Người dùng hệ thống

### Key Flows:

1. **PO Flow:** Draft → Submit → Approve → Confirm → Invoice → Payment → Delivery
2. **Rebate Flow:** Orders Delivered → Background Service → Claim → Approve → Settlement
3. **Inventory Flow:** Manufacturer → Allocated → InTransit → Dealer
4. **Payment Flow:** Invoice → Payment → VNPay → Confirm → Update Balance

### Key Services:

1. **RebateCalculationService** - Tính rebate tự động
2. **PricebookExpirationService** - Expire pricebooks
3. **EmailService** - Gửi email
4. **VNPay** - Thanh toán online

---

## 🎯 Kết Luận

Hệ thống Electric Vehicle Dealer Management System là một hệ thống phức tạp với nhiều module liên kết với nhau:

- **Purchase Orders** quản lý đơn đặt hàng từ Dealer
- **Inventory** quản lý VIN từ Manufacturer đến Dealer
- **Invoices** quản lý hóa đơn B2B và Retail
- **Payments** quản lý thanh toán qua VNPay hoặc manual
- **Rebates** quản lý hoa hồng cho Dealer
- **Claims & Settlements** quản lý thanh toán rebate
- **Users** quản lý người dùng với các roles khác nhau
- **Background Services** xử lý các tác vụ tự động
- **Email** gửi thông báo cho users

Tất cả các phần này hoạt động cùng nhau để tạo thành một hệ thống quản lý đại lý xe điện hoàn chỉnh.
