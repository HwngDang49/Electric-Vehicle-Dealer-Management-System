using backend.Common.Paging;
using MediatR;

namespace backend.Feartures.SalesDocuments.Orders.AllocateVin
{
    public class GetAvailableVinsQuery : IRequest<PagedResult<AvailableVinDto>>
    {
        public long? ProductId { get; set; }
        public long? BranchId { get; set; }
        public string? Status { get; set; } = "InStock";
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class AvailableVinDto
    {
        public string Vin { get; set; } = string.Empty;
        public long ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty;
        public string? ColorName { get; set; }
        public long? BranchId { get; set; }
        public string? BranchName { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? ReceivedAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
