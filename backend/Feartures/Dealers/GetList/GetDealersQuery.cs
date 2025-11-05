using backend.Common.Paging;
using MediatR;

namespace backend.Feartures.Dealers.GetList
{
    public sealed class GetDealersQuery : IRequest<PagedResult<GetDealersDto>>
    {
        public string? Status { get; set; }   // "Onboarding" | "Live" | "Suspended" | "Closed"
        public string? SearchTerm { get; set; }        // search code/name/legalName
        public int Page { get; set; } = 1;    // 1-based
        public int PageSize { get; set; } = 20;
    }

    public class GetDealersDto
    {
        public long DealerId { get; set; }
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? LegalName { get; set; }
        public string? TaxId { get; set; }
        public string Status { get; set; } = default!;
        public decimal CreditLimit { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
