using backend.Domain.Enums;

namespace backend.Feartures.Dealers.Create
{
    public class CreateDealerRequest
    {
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? LegalName { get; set; }
        public string? TaxId { get; set; }
        public DealerStatus Status { get; set; } = DealerStatus.Onboarding;
        public decimal CreditLimit { get; set; }
    }
}
