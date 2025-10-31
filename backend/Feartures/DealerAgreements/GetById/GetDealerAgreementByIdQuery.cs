using Ardalis.Result;
using MediatR;

namespace backend.Feartures.DealerAgreements.GetById
{
    public record GetDealerAgreementByIdQuery(long AgreementId) : IRequest<Result<GetDealerAgreementByIdResponse>>;

    public class GetDealerAgreementByIdResponse
    {
        public long AgreementId { get; set; }
        public long DealerId { get; set; }
        public string Code { get; set; } = default!;
        public string Title { get; set; } = default!;
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string? PaymentTerms { get; set; }
        public string Status { get; set; } = default!;
        public string? FileUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<AgreementRebateDto> AgreementRebates { get; set; } = new();
    }

    public class AgreementRebateDto
    {
        public long RebateId { get; set; }
        public string Period { get; set; } = default!;
        public int TierQty { get; set; }
        public decimal RebatePerUnit { get; set; }
        public decimal? CapAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}

