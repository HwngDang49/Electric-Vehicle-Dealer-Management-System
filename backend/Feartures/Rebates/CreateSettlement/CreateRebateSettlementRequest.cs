namespace backend.Feartures.Rebates.CreateSettlement
{
    public class CreateRebateSettlementRequest
    {
        public long ClaimId { get; set; }
        public decimal PaidAmount { get; set; }
        public string? ReferenceNo { get; set; } // Số tham chiếu thanh toán
    }
}

