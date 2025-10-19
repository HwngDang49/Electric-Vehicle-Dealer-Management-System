-- =============================================
-- Script SQL đơn giản để tạo dữ liệu VIN mẫu
-- Chỉ tạo dữ liệu cần thiết, không tạo Products/Dealer/Branch
-- =============================================

-- Xóa dữ liệu cũ nếu có (để tránh trùng lặp)
DELETE FROM inventory WHERE dealer_id = 1 AND branch_id = 1;

-- Tạo dữ liệu VIN mẫu cho Dealer 1, Branch 1, Status InStock
-- Giả sử đã có Products với ID 1-10, Dealer ID 1, Branch ID 1

INSERT INTO inventory (
    vin, 
    owner_type, 
    owner_id, 
    location_type, 
    location_id, 
    dealer_id, 
    branch_id, 
    product_id, 
    status, 
    received_at, 
    order_id, 
    created_at
) VALUES 
-- Tesla Model 3 Standard - Đen (5 VIN)
('1HGBH41JXMN109186', 'Dealer', 1, 'Branch', 1, 1, 1, 1, 'InStock', DATEADD(day, -30, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN109187', 'Dealer', 1, 'Branch', 1, 1, 1, 1, 'InStock', DATEADD(day, -25, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN109188', 'Dealer', 1, 'Branch', 1, 1, 1, 1, 'InStock', DATEADD(day, -20, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN109189', 'Dealer', 1, 'Branch', 1, 1, 1, 1, 'InStock', DATEADD(day, -15, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN109190', 'Dealer', 1, 'Branch', 1, 1, 1, 1, 'InStock', DATEADD(day, -10, GETUTCDATE()), NULL, GETUTCDATE()),

-- Tesla Model 3 Long Range - Trắng (4 VIN)
('1HGBH41JXMN209186', 'Dealer', 1, 'Branch', 1, 1, 1, 2, 'InStock', DATEADD(day, -28, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN209187', 'Dealer', 1, 'Branch', 1, 1, 1, 2, 'InStock', DATEADD(day, -22, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN209188', 'Dealer', 1, 'Branch', 1, 1, 1, 2, 'InStock', DATEADD(day, -18, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN209189', 'Dealer', 1, 'Branch', 1, 1, 1, 2, 'InStock', DATEADD(day, -12, GETUTCDATE()), NULL, GETUTCDATE()),

-- Tesla Model 3 Performance - Xanh dương (3 VIN)
('1HGBH41JXMN309186', 'Dealer', 1, 'Branch', 1, 1, 1, 3, 'InStock', DATEADD(day, -26, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN309187', 'Dealer', 1, 'Branch', 1, 1, 1, 3, 'InStock', DATEADD(day, -19, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN309188', 'Dealer', 1, 'Branch', 1, 1, 1, 3, 'InStock', DATEADD(day, -14, GETUTCDATE()), NULL, GETUTCDATE()),

-- Tesla Model Y Standard - Đỏ (4 VIN)
('1HGBH41JXMN409186', 'Dealer', 1, 'Branch', 1, 1, 1, 4, 'InStock', DATEADD(day, -24, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN409187', 'Dealer', 1, 'Branch', 1, 1, 1, 4, 'InStock', DATEADD(day, -21, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN409188', 'Dealer', 1, 'Branch', 1, 1, 1, 4, 'InStock', DATEADD(day, -16, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN409189', 'Dealer', 1, 'Branch', 1, 1, 1, 4, 'InStock', DATEADD(day, -11, GETUTCDATE()), NULL, GETUTCDATE()),

-- Tesla Model Y Long Range - Bạc (3 VIN)
('1HGBH41JXMN509186', 'Dealer', 1, 'Branch', 1, 1, 1, 5, 'InStock', DATEADD(day, -27, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN509187', 'Dealer', 1, 'Branch', 1, 1, 1, 5, 'InStock', DATEADD(day, -23, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN509188', 'Dealer', 1, 'Branch', 1, 1, 1, 5, 'InStock', DATEADD(day, -17, GETUTCDATE()), NULL, GETUTCDATE()),

-- Tesla Model S Plaid - Đen (2 VIN)
('1HGBH41JXMN609186', 'Dealer', 1, 'Branch', 1, 1, 1, 6, 'InStock', DATEADD(day, -29, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN609187', 'Dealer', 1, 'Branch', 1, 1, 1, 6, 'InStock', DATEADD(day, -13, GETUTCDATE()), NULL, GETUTCDATE()),

-- Tesla Model X Plaid - Trắng (2 VIN)
('1HGBH41JXMN709186', 'Dealer', 1, 'Branch', 1, 1, 1, 7, 'InStock', DATEADD(day, -31, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN709187', 'Dealer', 1, 'Branch', 1, 1, 1, 7, 'InStock', DATEADD(day, -9, GETUTCDATE()), NULL, GETUTCDATE()),

-- VinFast VF8 Plus - Xanh lá (3 VIN)
('1HGBH41JXMN809186', 'Dealer', 1, 'Branch', 1, 1, 1, 8, 'InStock', DATEADD(day, -33, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN809187', 'Dealer', 1, 'Branch', 1, 1, 1, 8, 'InStock', DATEADD(day, -7, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN809188', 'Dealer', 1, 'Branch', 1, 1, 1, 8, 'InStock', DATEADD(day, -5, GETUTCDATE()), NULL, GETUTCDATE()),

-- VinFast VF9 Plus - Xám (2 VIN)
('1HGBH41JXMN909186', 'Dealer', 1, 'Branch', 1, 1, 1, 9, 'InStock', DATEADD(day, -35, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMN909187', 'Dealer', 1, 'Branch', 1, 1, 1, 9, 'InStock', DATEADD(day, -3, GETUTCDATE()), NULL, GETUTCDATE()),

-- BMW iX3 M Sport - Đen (2 VIN)
('1HGBH41JXMNA09186', 'Dealer', 1, 'Branch', 1, 1, 1, 10, 'InStock', DATEADD(day, -37, GETUTCDATE()), NULL, GETUTCDATE()),
('1HGBH41JXMNA09187', 'Dealer', 1, 'Branch', 1, 1, 1, 10, 'InStock', DATEADD(day, -1, GETUTCDATE()), NULL, GETUTCDATE());

-- Hiển thị kết quả
SELECT 
    'Tổng số VIN đã tạo: ' + CAST(COUNT(*) AS VARCHAR(10)) AS Result
FROM inventory 
WHERE dealer_id = 1 AND branch_id = 1 AND status = 'InStock';

-- Hiển thị chi tiết VIN theo sản phẩm (nếu có bảng products)
SELECT 
    'Product ID: ' + CAST(product_id AS VARCHAR(10)) AS ProductInfo,
    COUNT(vin) AS VINCount,
    MIN(received_at) AS OldestReceived,
    MAX(received_at) AS NewestReceived
FROM inventory
WHERE dealer_id = 1 AND branch_id = 1 AND status = 'InStock'
GROUP BY product_id
ORDER BY product_id;
