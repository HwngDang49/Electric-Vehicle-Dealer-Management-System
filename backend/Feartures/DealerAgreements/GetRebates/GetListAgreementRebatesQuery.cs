using MediatR;

namespace backend.Feartures.DealerAgreements.GetRebates
{
    public sealed class GetListAgreementRebatesQuery : IRequest<List<GetAgreementRebateDto>>
    {
        public long AgreementId { get; set; }
        public string? Period { get; set; } // Optional filter by Period
    }

    public sealed class GetAgreementRebateDto
    {
        public long RebateId { get; set; }
        public long AgreementId { get; set; }
        public string Period { get; set; } = default!;
        public int TierQty { get; set; }
        public decimal RebatePerUnit { get; set; }
        public decimal? CapAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

