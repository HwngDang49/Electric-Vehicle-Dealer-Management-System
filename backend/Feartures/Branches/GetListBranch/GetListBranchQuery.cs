using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Branches.GetListBranch
{
    public record GetListBranchQuery : IRequest<Result<List<GetListBranchDto>>>;

    public class GetListBranchDto
    {
        public long BranchId { get; set; }
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? Address { get; set; }
        public string Status { get; set; } = default!;
        public long DealerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
