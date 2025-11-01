using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Claims.GetClaimDetail
{
    public sealed class GetClaimDetailQuery : IRequest<Result<GetClaimDetailDto>>
    {
        public long ClaimId { get; set; }
    }

    public sealed class GetClaimDetailDto
    {
        public long ClaimId { get; set; }
        public long DealerId { get; set; }
        public string? DealerName { get; set; }
        public long? AgreementId { get; set; }
        public string? AgreementCode { get; set; }
        public string? Period { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
        public List<SettlementDto> Settlements { get; set; } = new();
        public decimal TotalPaid { get; set; }
        public decimal RemainingAmount { get; set; }
    }

    public sealed class SettlementDto
    {
        public long SettlementId { get; set; }
        public decimal PaidAmount { get; set; }
        public DateTime PaidAt { get; set; }
        public string? ReferenceNo { get; set; }
    }
}

