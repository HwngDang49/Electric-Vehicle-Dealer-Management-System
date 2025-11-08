-- ============================================
-- KIỂM TRA INVOICE STATUS CONSTRAINT
-- ============================================

-- 1. Kiểm tra constraint hiện tại
SELECT 
    CONSTRAINT_NAME,
    CHECK_CLAUSE,
    TABLE_NAME
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_NAME LIKE '%invoices_status%'
   OR TABLE_NAME = 'invoices';

-- 2. Xem tất cả constraints của bảng invoices
SELECT 
    tc.CONSTRAINT_NAME,
    tc.CONSTRAINT_TYPE,
    cc.CHECK_CLAUSE
FROM INFORMATION_SCHEMA.TABLE_CONSTRAINTS tc
LEFT JOIN INFORMATION_SCHEMA.CHECK_CONSTRAINTS cc 
    ON tc.CONSTRAINT_NAME = cc.CONSTRAINT_NAME
WHERE tc.TABLE_NAME = 'invoices';

-- 3. Xem các giá trị status hiện có trong invoices
SELECT DISTINCT status, COUNT(*) as count
FROM invoices
GROUP BY status
ORDER BY status;

-- 4. TEST: Thử update một invoice sang "Processing" (KHÔNG COMMIT - chỉ test)
-- Uncomment dòng dưới để test (nhớ rollback sau)
/*
BEGIN TRANSACTION;
UPDATE invoices 
SET status = 'Processing' 
WHERE invoice_id = (SELECT TOP 1 invoice_id FROM invoices WHERE status = 'Pending');
-- Nếu thành công = constraint đã fix
-- Nếu lỗi = constraint chưa fix
ROLLBACK; -- Rollback để không thay đổi data thật
*/

