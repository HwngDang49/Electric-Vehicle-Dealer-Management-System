namespace backend.Feartures.Dealers.GetDealerCredit
{
    public class DealerCreditDto
    {
        public long DealerId { get; set; }
        public decimal CreditLimit { get; set; }
        public decimal CreditUsed { get; set; }
        public decimal CreditAvailable { get; set; }
        public decimal WalletBalance { get; set; }
        public string DealerName { get; set; } = string.Empty;
    }
}
