namespace backend.Feartures.Dealers.Update
{
    public class UpdateDealerRequest
    {
        public string? Code { get; set; }
        public string? Name { get; set; }
        public string? LegalName { get; set; }
        public string? TaxId { get; set; }
        public decimal? CreditLimit { get; set; }
    }
}
