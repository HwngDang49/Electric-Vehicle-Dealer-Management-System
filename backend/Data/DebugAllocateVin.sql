-- =============================================
-- Script debug lỗi Allocate VIN
-- =============================================

-- Thay đổi các giá trị này theo test case của bạn
DECLARE @OrderId BIGINT = 1;
DECLARE @VinCode VARCHAR(30) = '1HGBH41JXMN109186';

PRINT '=== KIỂM TRA DỮ LIỆU TEST ===';

-- 1. Kiểm tra Order
PRINT '1. Kiểm tra Order:';
SELECT 
    order_id,
    customer_id,
    status,
    dealer_id,
    CASE 
        WHEN customer_id IS NULL THEN '❌ CustomerId NULL'
        ELSE '✅ CustomerId OK'
    END as CustomerCheck
FROM orders 
WHERE order_id = @OrderId;

-- 2. Kiểm tra Customer
PRINT '2. Kiểm tra Customer:';
SELECT 
    c.customer_id,
    c.name,
    c.email,
    c.dealer_id,
    CASE 
        WHEN c.customer_id IS NULL THEN '❌ Customer không tồn tại'
        ELSE '✅ Customer OK'
    END as CustomerExists
FROM customers c
INNER JOIN orders o ON c.customer_id = o.customer_id
WHERE o.order_id = @OrderId;

-- 3. Kiểm tra VIN
PRINT '3. Kiểm tra VIN:';
SELECT 
    vin,
    status,
    owner_type,
    owner_id,
    order_id,
    dealer_id,
    product_id,
    CASE 
        WHEN status != 'InStock' THEN '❌ VIN không ở trạng thái InStock'
        WHEN order_id IS NOT NULL THEN '❌ VIN đã được gán cho order khác'
        ELSE '✅ VIN sẵn sàng'
    END as VinStatus
FROM inventory 
WHERE vin = @VinCode;

-- 4. Kiểm tra Order Items
PRINT '4. Kiểm tra Order Items:';
SELECT 
    oi.order_item_id,
    oi.order_id,
    oi.product_id,
    oi.quantity,
    p.name as product_name
FROM order_items oi
LEFT JOIN products p ON oi.product_id = p.product_id
WHERE oi.order_id = @OrderId;

-- 5. Kiểm tra Product của VIN
PRINT '5. Kiểm tra Product của VIN:';
SELECT 
    i.vin,
    i.product_id,
    p.name as product_name,
    oi.order_item_id,
    CASE 
        WHEN oi.order_item_id IS NULL THEN '❌ Không có OrderItem phù hợp'
        ELSE '✅ Có OrderItem phù hợp'
    END as ProductMatch
FROM inventory i
LEFT JOIN products p ON i.product_id = p.product_id
LEFT JOIN order_items oi ON i.product_id = oi.product_id AND oi.order_id = @OrderId
WHERE i.vin = @VinCode;

-- 6. Kiểm tra Dealer consistency
PRINT '6. Kiểm tra Dealer consistency:';
SELECT 
    'Order Dealer' as Source,
    o.dealer_id
FROM orders o
WHERE o.order_id = @OrderId
UNION ALL
SELECT 
    'VIN Dealer' as Source,
    i.dealer_id
FROM inventory i
WHERE i.vin = @VinCode;

PRINT '=== KẾT LUẬN ===';
PRINT 'Nếu có ❌ thì đó là nguyên nhân gây lỗi!';
