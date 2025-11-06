
using backend.Common.Paging;
using MediatR;

namespace backend.Feartures.Branches.GetListBranch
{
    public sealed class GetListBranchQuery : IRequest<PagedResult<GetListBranchDto>>
    {
        public string? Status { get; set; }
        public long? DealerId { get; set; }
        public string? SearchTerm { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }

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
