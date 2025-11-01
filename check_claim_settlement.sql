-- Kiểm tra claim và settlements
SELECT 
    c.claim_id,
    c.status as claim_status,
    c.amount as claim_amount,
    s.settlement_id,
    s.paid_amount,
    s.reference_no,
    s.paid_at,
    CASE 
        WHEN s.reference_no IS NOT NULL THEN 'Đã thanh toán'
        ELSE 'Chưa thanh toán'
    END as settlement_status,
    ISNULL(SUM(CASE WHEN s2.reference_no IS NOT NULL THEN s2.paid_amount ELSE 0 END), 0) as total_paid_with_ref,
    c.amount - ISNULL(SUM(CASE WHEN s2.reference_no IS NOT NULL THEN s2.paid_amount ELSE 0 END), 0) as remaining_amount
FROM claims c
LEFT JOIN settlements s ON c.claim_id = s.claim_id
LEFT JOIN settlements s2 ON c.claim_id = s2.claim_id
WHERE c.claim_id = 3
GROUP BY c.claim_id, c.status, c.amount, s.settlement_id, s.paid_amount, s.reference_no, s.paid_at
ORDER BY s.settlement_id;
