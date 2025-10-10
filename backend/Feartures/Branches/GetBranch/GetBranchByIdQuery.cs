using Ardalis.Result;
using backend.Domain.Entities;
using MediatR;

namespace backend.Feartures.Branches.GetBranch
{
    public record GetBranchByIdQuery(long BranchId) : IRequest<Result<GetBranchDetailDto>>;

    public class GetBranchDetailDto
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
