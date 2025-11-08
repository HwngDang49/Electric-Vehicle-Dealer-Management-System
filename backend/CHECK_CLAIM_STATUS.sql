-- Kiểm tra tại sao Claim vẫn Pending sau khi thanh toán

-- 1. Kiểm tra Claim
SELECT 
    claim_id,
    dealer_id,
    agreement_id,
    period,
    amount as claim_amount,
    status,
    created_at,
    resolved_at
FROM [SWPV20].[dbo].[claims]
WHERE claim_id = 3;

-- 2. Kiểm tra Settlements của Claim này
SELECT 
    s.settlement_id,
    s.claim_id,
    s.paid_amount,
    s.paid_at,
    s.reference_no,  -- Quan trọng: Nếu NULL thì thanh toán chưa thành công
    CASE 
        WHEN s.reference_no IS NOT NULL THEN 'Đã thanh toán thành công'
        ELSE 'Chưa thanh toán thành công (Pending)'
    END as settlement_status
FROM [SWPV20].[dbo].[settlements] s
WHERE s.claim_id = 3;

-- 3. Tính tổng đã thanh toán (chỉ tính settlement có ReferenceNo)
SELECT 
    c.claim_id,
    c.amount as claim_amount,
    c.status as current_status,
    -- Tổng đã thanh toán (chỉ tính settlement có ReferenceNo)
    ISNULL(SUM(CASE WHEN s.reference_no IS NOT NULL THEN s.paid_amount ELSE 0 END), 0) as total_paid_with_ref,
    -- Tổng tất cả settlement
    ISNULL(SUM(s.paid_amount), 0) as total_all_settlements,
    -- Số tiền còn lại
    c.amount - ISNULL(SUM(CASE WHEN s.reference_no IS NOT NULL THEN s.paid_amount ELSE 0 END), 0) as remaining_amount,
    -- Status nên là gì (theo logic)
    CASE 
        WHEN ISNULL(SUM(CASE WHEN s.reference_no IS NOT NULL THEN s.paid_amount ELSE 0 END), 0) >= c.amount 
            THEN 'Paid'
        WHEN ISNULL(SUM(CASE WHEN s.reference_no IS NOT NULL THEN s.paid_amount ELSE 0 END), 0) > 0 
            THEN 'Processing'
        ELSE 'Pending'
    END as expected_status
FROM [SWPV20].[dbo].[claims] c
LEFT JOIN [SWPV20].[dbo].[settlements] s ON c.claim_id = s.claim_id
WHERE c.claim_id = 3
GROUP BY c.claim_id, c.amount, c.status;

-- 4. Xem chi tiết từng settlement
SELECT 
    settlement_id,
    claim_id,
    paid_amount,
    paid_at,
    reference_no,
    'Có ReferenceNo' = CASE WHEN reference_no IS NOT NULL THEN 'YES' ELSE 'NO' END
FROM [SWPV20].[dbo].[settlements]
WHERE claim_id = 3
ORDER BY paid_at DESC;

