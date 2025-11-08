-- ============================================
-- SQL QUERIES TO CHECK CLAIM STATUS
-- ============================================

-- 1. Xem TẤT CẢ claims và status của chúng
SELECT 
    claim_id,
    dealer_id,
    agreement_id,
    period,
    amount,
    status,                    -- <-- Trạng thái hiện tại
    created_at,
    resolved_at
FROM [SWPV20].[dbo].[claims]
ORDER BY created_at DESC;

-- 2. Xem claim CỤ THỂ theo claim_id
SELECT 
    claim_id,
    dealer_id,
    agreement_id,
    period,
    amount,
    status,                    -- <-- Trạng thái
    created_at,
    resolved_at
FROM [SWPV20].[dbo].[claims]
WHERE claim_id = 3;           -- Thay đổi claim_id ở đây

-- 3. Xem claims theo STATUS cụ thể
SELECT 
    claim_id,
    dealer_id,
    agreement_id,
    period,
    amount,
    status,
    created_at,
    resolved_at
FROM [SWPV20].[dbo].[claims]
WHERE status = 'Pending'      -- Có thể thay: 'Pending', 'Processing', 'Paid', 'Approved', 'Rejected'
ORDER BY created_at DESC;

-- 4. Xem TẤT CẢ các status KHÁC NHAU đang có trong database
SELECT DISTINCT status
FROM [SWPV20].[dbo].[claims]
ORDER BY status;

-- 5. Đếm số lượng claims theo từng status
SELECT 
    status,
    COUNT(*) as count
FROM [SWPV20].[dbo].[claims]
GROUP BY status
ORDER BY count DESC;

-- 6. Xem claim kèm thông tin SETTLEMENTS (thanh toán)
SELECT 
    c.claim_id,
    c.dealer_id,
    c.agreement_id,
    c.period,
    c.amount as claim_amount,
    c.status,
    c.created_at,
    c.resolved_at,
    s.settlement_id,
    s.paid_amount,
    s.paid_at,
    s.reference_no,
    -- Tính tổng đã thanh toán
    ISNULL(SUM(s.paid_amount) OVER (PARTITION BY c.claim_id), 0) as total_paid,
    -- Tính số tiền còn lại
    c.amount - ISNULL(SUM(s.paid_amount) OVER (PARTITION BY c.claim_id), 0) as remaining_amount
FROM [SWPV20].[dbo].[claims] c
LEFT JOIN [SWPV20].[dbo].[settlements] s ON c.claim_id = s.claim_id
WHERE c.claim_id = 3          -- Thay đổi claim_id ở đây
ORDER BY s.paid_at DESC;

-- 7. Kiểm tra status và settlement để hiểu logic update status
SELECT 
    c.claim_id,
    c.amount as claim_amount,
    c.status as current_status,
    -- Tổng đã thanh toán (chỉ tính settlement có reference_no - đã thanh toán thành công)
    ISNULL(SUM(CASE WHEN s.reference_no IS NOT NULL THEN s.paid_amount ELSE 0 END), 0) as total_paid_with_ref,
    -- Tổng tất cả settlement (kể cả chưa có reference_no)
    ISNULL(SUM(s.paid_amount), 0) as total_all_settlements,
    -- Số tiền còn lại
    c.amount - ISNULL(SUM(CASE WHEN s.reference_no IS NOT NULL THEN s.paid_amount ELSE 0 END), 0) as remaining,
    -- Status nên là gì (theo logic)
    CASE 
        WHEN ISNULL(SUM(CASE WHEN s.reference_no IS NOT NULL THEN s.paid_amount ELSE 0 END), 0) >= c.amount 
            THEN 'Paid'
        WHEN ISNULL(SUM(CASE WHEN s.reference_no IS NOT NULL THEN s.paid_amount ELSE 0 END), 0) > 0 
            THEN 'Processing'
        ELSE 'Pending'
    END as expected_status,
    c.created_at,
    c.resolved_at
FROM [SWPV20].[dbo].[claims] c
LEFT JOIN [SWPV20].[dbo].[settlements] s ON c.claim_id = s.claim_id
WHERE c.claim_id = 3          -- Thay đổi claim_id ở đây
GROUP BY c.claim_id, c.amount, c.status, c.created_at, c.resolved_at;

-- 8. Xem chi tiết claim kèm agreement info
SELECT 
    c.claim_id,
    c.dealer_id,
    d.name as dealer_name,
    c.agreement_id,
    a.code as agreement_code,
    c.period,
    c.amount,
    c.status,
    c.created_at,
    c.resolved_at
FROM [SWPV20].[dbo].[claims] c
LEFT JOIN [SWPV20].[dbo].[dealers] d ON c.dealer_id = d.dealer_id
LEFT JOIN [SWPV20].[dbo].[dealer_agreements] a ON c.agreement_id = a.agreement_id
WHERE c.claim_id = 3;         -- Thay đổi claim_id ở đây

-- ============================================
-- CÁC STATUS VALUES CÓ THỂ CÓ:
-- ============================================
-- 1. "Pending"    - Chờ xử lý (claim mới được tạo)
-- 2. "Processing" - Đang xử lý (đã thanh toán một phần)
-- 3. "Paid"       - Đã thanh toán đầy đủ
-- 4. "Approved"   - Đã được approve (nếu có flow approve)
-- 5. "Rejected"   - Đã bị từ chối/reject

-- ============================================
-- LOGIC UPDATE STATUS:
-- ============================================
-- 1. Khi tạo claim mới: status = "Pending"
-- 2. Khi thanh toán thành công lần đầu:
--    - Nếu total_paid >= claim_amount → status = "Paid"
--    - Nếu total_paid > 0 nhưng < claim_amount → status = "Processing"
-- 3. Khi thanh toán đầy đủ: status = "Paid", resolved_at = DateTime.UtcNow

