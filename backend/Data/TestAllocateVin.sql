-- =============================================
-- Script SQL để tạo dữ liệu test cho Allocate VIN
-- =============================================

-- 1. Tạo Customer mẫu nếu chưa có
IF NOT EXISTS (SELECT 1 FROM customers WHERE customer_id = 1)
BEGIN
    INSERT INTO customers (customer_id, dealer_id, name, email, phone, address, status, created_at, updated_at)
    VALUES (1, 1, 'Nguyễn Văn A', 'nguyenvana@email.com', '0123456789', '123 Đường ABC, Hà Nội', 'Active', GETUTCDATE(), GETUTCDATE());
END

-- 2. Tạo Order mẫu nếu chưa có
IF NOT EXISTS (SELECT 1 FROM orders WHERE order_id = 1)
BEGIN
    INSERT INTO orders (order_id, dealer_id, customer_id, order_number, status, total_amount, created_at, updated_at)
    VALUES (1, 1, 1, 'ORD-001', 'Confirmed', 1000000000.00, GETUTCDATE(), GETUTCDATE());
END

-- 3. Tạo OrderItem mẫu nếu chưa có
IF NOT EXISTS (SELECT 1 FROM order_items WHERE order_item_id = 1)
BEGIN
    INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price, total_price, created_at, updated_at)
    VALUES (1, 1, 1, 1, 1000000000.00, 1000000000.00, GETUTCDATE(), GETUTCDATE());
END

-- 4. Kiểm tra dữ liệu
SELECT 'CUSTOMERS' as TableName, COUNT(*) as Count FROM customers WHERE dealer_id = 1
UNION ALL
SELECT 'ORDERS' as TableName, COUNT(*) as Count FROM orders WHERE dealer_id = 1
UNION ALL
SELECT 'ORDER_ITEMS' as TableName, COUNT(*) as Count FROM order_items oi INNER JOIN orders o ON oi.order_id = o.order_id WHERE o.dealer_id = 1
UNION ALL
SELECT 'INVENTORY' as TableName, COUNT(*) as Count FROM inventory WHERE dealer_id = 1 AND branch_id = 1 AND status = 'InStock';

-- 5. Hiển thị chi tiết Order để test
SELECT 
    o.order_id,
    o.customer_id,
    o.status as order_status,
    c.name as customer_name,
    c.email as customer_email
FROM orders o
INNER JOIN customers c ON o.customer_id = c.customer_id
WHERE o.order_id = 1;

-- 6. Hiển thị VIN có sẵn để test
SELECT TOP 5
    vin,
    product_id,
    status,
    owner_type,
    owner_id
FROM inventory 
WHERE dealer_id = 1 AND branch_id = 1 AND status = 'InStock'
ORDER BY created_at;
