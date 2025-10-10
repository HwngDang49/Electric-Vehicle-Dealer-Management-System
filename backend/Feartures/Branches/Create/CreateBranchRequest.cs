using backend.Domain.Enums;

namespace backend.Feartures.Branches.Create
{
    public class CreateBranchRequest
    {
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Address { get; set; }
        public BranchStatus Status { get; set; }
        public int DealerId { get; set; }
    }
}
