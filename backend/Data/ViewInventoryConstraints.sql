-- =============================================
-- Script xem chi tiết CHECK constraint của bảng inventory
-- =============================================

-- 1. Xem tất cả CHECK constraints của bảng inventory
SELECT 
    t.name AS TableName,
    cc.name AS ConstraintName,
    cc.definition AS ConstraintDefinition,
    cc.is_disabled AS IsDisabled
FROM sys.check_constraints cc
INNER JOIN sys.tables t ON cc.parent_object_id = t.object_id
WHERE t.name = 'inventory'
ORDER BY cc.name;

-- 2. Xem chi tiết cột owner_type
SELECT 
    c.name AS ColumnName,
    c.max_length,
    c.is_nullable,
    c.column_default,
    t.name AS DataType
FROM sys.columns c
INNER JOIN sys.types t ON c.user_type_id = t.user_type_id
INNER JOIN sys.tables tb ON c.object_id = tb.object_id
WHERE tb.name = 'inventory' AND c.name = 'owner_type';

-- 3. Xem các giá trị owner_type hiện có
SELECT 
    owner_type,
    COUNT(*) as Count,
    MIN(created_at) as FirstCreated,
    MAX(created_at) as LastCreated
FROM inventory 
GROUP BY owner_type
ORDER BY owner_type;

-- 4. Test các giá trị có thể
DECLARE @TestValues TABLE (TestValue VARCHAR(20));
INSERT INTO @TestValues VALUES 
('Dealer'),
('Customer'), 
('Manufacturer'),
('Distributor'),
('OEM'),
('Factory');

SELECT 
    tv.TestValue,
    CASE 
        WHEN tv.TestValue IN (SELECT DISTINCT owner_type FROM inventory) 
        THEN '✅ Có trong database'
        ELSE '❌ Không có trong database'
    END as InDatabase,
    CASE 
        WHEN tv.TestValue = 'Dealer'
        THEN '✅ Default value'
        ELSE ''
    END as IsDefault
FROM @TestValues tv;
