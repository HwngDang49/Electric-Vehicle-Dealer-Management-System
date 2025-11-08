-- Fix Invoice Status CHECK Constraint to include "Processing"
-- Run this SQL in your database

-- 1. Drop existing constraint
ALTER TABLE invoices 
DROP CONSTRAINT IF EXISTS CK_invoices_status;

-- 2. Add new constraint with "Processing" included
ALTER TABLE invoices
ADD CONSTRAINT CK_invoices_status 
CHECK (status IN ('Pending', 'Processing', 'Paid', 'Settled', 'Cancelled'));

-- Verify
SELECT CONSTRAINT_NAME, CHECK_CLAUSE
FROM INFORMATION_SCHEMA.CHECK_CONSTRAINTS
WHERE CONSTRAINT_NAME = 'CK_invoices_status';

