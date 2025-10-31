using backend.Common.Paging;
using MediatR;

namespace backend.Feartures.Rebates.GetSettlements
{
    public sealed class GetRebateSettlementsQuery : IRequest<PagedResult<GetRebateSettlementDto>>
    {
        public long? AgreementId { get; set; } // Optional: filter theo AgreementId
        public string? Period { get; set; } // Optional: filter theo Period (YYYY-MM)
        public string? ClaimStatus { get; set; } // Optional: filter theo Claim Status (Pending, Resolved, etc.)
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public sealed class GetRebateSettlementDto
    {
        public long ClaimId { get; set; }
        public long DealerId { get; set; }
        public long? AgreementId { get; set; }
        public string? Period { get; set; }
        public decimal ClaimAmount { get; set; }
        public string ClaimStatus { get; set; } = default!;
        public DateTime ClaimCreatedAt { get; set; }
        public DateTime? ClaimResolvedAt { get; set; }
        public List<SettlementDetailDto> Settlements { get; set; } = new();
        public decimal TotalSettledAmount { get; set; } // Tổng đã thanh toán
    }

    public sealed class SettlementDetailDto
    {
        public long SettlementId { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime PaidAt { get; set; }
        public string? ReferenceNo { get; set; }
    }
}

