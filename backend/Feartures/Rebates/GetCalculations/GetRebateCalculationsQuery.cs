using backend.Common.Paging;
using MediatR;

namespace backend.Feartures.Rebates.GetCalculations
{
    public sealed class GetRebateCalculationsQuery : IRequest<PagedResult<GetRebateCalculationDto>>
    {
        public long? AgreementId { get; set; } // Optional: filter theo AgreementId
        public string? Period { get; set; } // Optional: filter theo Period (YYYY-MM)
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public sealed class GetRebateCalculationDto
    {
        public long AgreementId { get; set; }
        public long DealerId { get; set; }
        public string Period { get; set; } = default!;
        public int? UnitsDelivered { get; set; }
        public int? EffectiveTierQty { get; set; }
        public decimal? RebatePerUnit { get; set; }
        public decimal? CapAmount { get; set; }
        public decimal? GrossRebateAmount { get; set; }
        public decimal? PayableRebateAmount { get; set; }
    }
}

