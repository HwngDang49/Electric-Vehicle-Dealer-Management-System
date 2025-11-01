-- Kiểm tra CHECK constraint cho claims.status
SELECT 
    cc.name AS ConstraintName,
    cc.definition AS ConstraintDefinition,
    OBJECT_NAME(cc.parent_object_id) AS TableName,
    COL_NAME(cc.parent_object_id, cc.parent_column_id) AS ColumnName
FROM sys.check_constraints cc
WHERE cc.name = 'CK_claims_status';
