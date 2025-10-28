    -- =====================================================
-- Migration: Refactor Promotion Columns
-- Date: 2025-10-22
-- Description: 
--   - Remove oem_discount_applied from quote_items & order_items
--   - Change line_promo from computed to regular column
--   - Update line_total computed formula
-- =====================================================

USE [SWPV20];
GO

BEGIN TRANSACTION;

-- =====================================================
-- 1. QUOTE_ITEMS
-- =====================================================

PRINT 'Updating quote_items...';

-- Step 1: Drop computed columns (phải drop line_total trước vì nó depend on line_promo)
ALTER TABLE quote_items DROP COLUMN line_total;
ALTER TABLE quote_items DROP COLUMN line_promo;

-- Step 2: Drop oem_discount_applied
ALTER TABLE quote_items DROP COLUMN oem_discount_applied;

-- Step 3: Add line_promo as regular column (lưu tổng promotion amount)
ALTER TABLE quote_items ADD line_promo DECIMAL(18, 2) NOT NULL DEFAULT 0;
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Tổng số tiền giảm giá từ tất cả promotions được áp dụng cho line item này', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'quote_items',
    @level2type = N'COLUMN', @level2name = N'line_promo';

-- Step 4: Add line_total back as computed column (new formula)
-- New: line_total = (unit_price * qty) - line_promo
ALTER TABLE quote_items ADD line_total AS ((unit_price * qty) - line_promo) PERSISTED;

PRINT 'quote_items updated successfully.';

-- =====================================================
-- 2. ORDER_ITEMS
-- =====================================================

PRINT 'Updating order_items...';

-- Step 1: Drop computed columns
ALTER TABLE order_items DROP COLUMN line_total;
ALTER TABLE order_items DROP COLUMN line_promo;

-- Step 2: Drop oem_discount_applied
ALTER TABLE order_items DROP COLUMN oem_discount_applied;

-- Step 3: Add line_promo as regular column
ALTER TABLE order_items ADD line_promo DECIMAL(18, 2) NOT NULL DEFAULT 0;
EXEC sp_addextendedproperty 
    @name = N'MS_Description', 
    @value = N'Tổng số tiền giảm giá từ tất cả promotions được áp dụng cho line item này', 
    @level0type = N'SCHEMA', @level0name = N'dbo',
    @level1type = N'TABLE',  @level1name = N'order_items',
    @level2type = N'COLUMN', @level2name = N'line_promo';

-- Step 4: Add line_total back as computed column
ALTER TABLE order_items ADD line_total AS ((unit_price * qty) - line_promo) PERSISTED;

PRINT 'order_items updated successfully.';

-- =====================================================
-- 3. VERIFY CHANGES
-- =====================================================

PRINT 'Verifying schema changes...';

SELECT 
    'quote_items' AS table_name,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('quote_items'), COLUMN_NAME, 'IsComputed') AS is_computed
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'quote_items'
    AND COLUMN_NAME IN ('unit_price', 'qty', 'line_promo', 'line_total')
ORDER BY ORDINAL_POSITION;

SELECT 
    'order_items' AS table_name,
    COLUMN_NAME,
    DATA_TYPE,
    IS_NULLABLE,
    COLUMNPROPERTY(OBJECT_ID('order_items'), COLUMN_NAME, 'IsComputed') AS is_computed
FROM INFORMATION_SCHEMA.COLUMNS
WHERE TABLE_NAME = 'order_items'
    AND COLUMN_NAME IN ('unit_price', 'qty', 'line_promo', 'line_total')
ORDER BY ORDINAL_POSITION;

-- =====================================================
-- COMMIT OR ROLLBACK
-- =====================================================

-- Review output above. If everything looks good:
COMMIT TRANSACTION;
PRINT 'Migration completed successfully!';

-- If there are errors:
-- ROLLBACK TRANSACTION;
-- PRINT 'Migration rolled back.';

GO

