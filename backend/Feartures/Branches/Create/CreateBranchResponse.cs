using backend.Domain.Enums;

namespace backend.Feartures.Branches.Create
{
    public class CreateBranchResponse
    {
        public long BranchId { get; set; }

        public long DealerId { get; set; }

        public string Code { get; set; } = null!;

        public string Name { get; set; } = null!;

        public string? Address { get; set; }

        public string Status { get; set; } = BranchStatus.Inactive.ToString();

        public DateTime CreatedAt { get; set; }

        public DateTime UpdatedAt { get; set; }

    }
}
