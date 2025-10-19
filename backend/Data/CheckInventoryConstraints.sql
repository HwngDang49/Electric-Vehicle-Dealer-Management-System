-- =============================================
-- Script kiểm tra CHECK constraint của bảng inventory
-- =============================================

-- 1. Kiểm tra CHECK constraint hiện tại
SELECT 
    cc.name AS ConstraintName,
    cc.definition AS ConstraintDefinition
FROM sys.check_constraints cc
INNER JOIN sys.tables t ON cc.parent_object_id = t.object_id
WHERE t.name = 'inventory' AND cc.name LIKE '%owner_type%';

-- 2. Kiểm tra các giá trị owner_type hiện có trong database
SELECT DISTINCT 
    owner_type,
    COUNT(*) as Count
FROM inventory 
GROUP BY owner_type
ORDER BY owner_type;

-- 3. Kiểm tra các giá trị owner_type trong seed data
SELECT DISTINCT owner_type FROM (
    VALUES 
    ('Dealer'),
    ('Customer'),
    ('Manufacturer'),
    ('Distributor')
) AS ValidTypes(owner_type);

-- 4. Test các giá trị có thể hợp lệ
SELECT 
    'Dealer' as TestValue,
    CASE 
        WHEN 'Dealer' IN (SELECT DISTINCT owner_type FROM inventory) 
        THEN '✅ Có trong database'
        ELSE '❌ Không có trong database'
    END as Status
UNION ALL
SELECT 
    'Customer' as TestValue,
    CASE 
        WHEN 'Customer' IN (SELECT DISTINCT owner_type FROM inventory) 
        THEN '✅ Có trong database'
        ELSE '❌ Không có trong database'
    END as Status;
