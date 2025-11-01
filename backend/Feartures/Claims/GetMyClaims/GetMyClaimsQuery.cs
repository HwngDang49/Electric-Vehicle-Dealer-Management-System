using backend.Common.Paging;
using MediatR;

namespace backend.Feartures.Claims.GetMyClaims
{
    public sealed class GetMyClaimsQuery : IRequest<PagedResult<GetMyClaimDto>>
    {
        public long? AgreementId { get; set; } // Optional: filter by agreement
        public string? Period { get; set; } // Optional: filter by period (YYYY-MM)
        public string? Status { get; set; } // Optional: filter by status (Pending, Approved, Rejected)
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public sealed class GetMyClaimDto
    {
        public long ClaimId { get; set; }
        public long? AgreementId { get; set; }
        public string? AgreementCode { get; set; }
        public string? Period { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public decimal? SettledAmount { get; set; } // Amount từ Settlement nếu đã được thanh toán
    }
}

