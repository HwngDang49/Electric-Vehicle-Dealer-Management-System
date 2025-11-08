-- ============================================
-- THÊM "Processing" và "Paid" VÀO INVOICE STATUS CONSTRAINT
-- Giữ nguyên các giá trị cũ
-- ============================================

-- Bước 1: Xem constraint hiện tại
SELECT 
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE TABLE_NAME = 'invoices' AND CONSTRAINT_NAME LIKE '%status%';

-- Bước 2: Drop constraint cũ
ALTER TABLE invoices 
DROP CONSTRAINT CK_invoices_status;

-- Bước 3: Thêm constraint mới với TẤT CẢ giá trị:
-- - Pending (giữ từ cũ)
-- - Processing (MỚI - đang xử lý thanh toán)
-- - Paid (MỚI - đã thanh toán)
-- - Settled (giữ từ cũ - đã đối soát)
-- - Cancelled (giữ từ cũ - đã hủy)
ALTER TABLE invoices
ADD CONSTRAINT CK_invoices_status 
CHECK (status IN ('Pending', 'Processing', 'Paid', 'Settled', 'Cancelled'));

-- Bước 4: Verify constraint mới
SELECT 
    CONSTRAINT_NAME,
    CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE TABLE_NAME = 'invoices' AND CONSTRAINT_NAME = 'CK_invoices_status';

-- Bước 5: Kiểm tra các giá trị hiện có trong bảng
SELECT 
    status, 
    COUNT(*) as count,
    CASE 
        WHEN status IN ('Pending', 'Processing', 'Paid', 'Settled', 'Cancelled') 
        THEN 'Valid ✅' 
        ELSE 'Invalid ❌' 
    END as validation_status
FROM invoices
GROUP BY status
ORDER BY status;

PRINT '✅ Constraint đã được cập nhật thành công!';
PRINT 'Invoice status hiện hỗ trợ: Pending, Processing, Paid, Settled, Cancelled';

