using backend.Domain.Enums;

namespace backend.Feartures.Dealers.Create
{
    public class CreateDealerResponse
    {
        public long DealerId { get; set; }
        public string Status { get; set; } = DealerStatus.Onboarding.ToString();
        public DateTime CreatedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; }
    }
}
