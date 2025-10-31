namespace backend.Feartures.DealerAgreements.Update
{
    public class UpdateDealerAgreementRequest
    {
        public string? Code { get; set; }
        public string? Title { get; set; }
        public DateOnly? StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string? PaymentTerms { get; set; }
        public string? FileUrl { get; set; }
        public string? Status { get; set; } // "Active", "Expired", "Inactive"
    }
}

