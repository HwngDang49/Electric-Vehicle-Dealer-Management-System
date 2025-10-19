using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Agreements.GetDealerAgreement
{
    public sealed class GetDealerAgreementCommand : IRequest<Result<GetDealerAgreementQuery>>
    {
        // Command không cần parameters, sẽ lấy Agreement của dealer hiện tại
    }

    public sealed class GetDealerAgreementQuery
    {
        public long AgreementId { get; set; }
        public string Code { get; set; } = default!;
        public string Title { get; set; } = default!;
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string? PaymentTerms { get; set; }
        public string Status { get; set; } = default!;
        public string? FileUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<GetRebateRuleQuery> RebateRules { get; set; } = new();
    }

    public sealed class GetRebateRuleQuery
    {
        public long RebateId { get; set; }
        public string Period { get; set; } = default!;
        public int TierQty { get; set; }
        public decimal RebatePerUnit { get; set; }
        public decimal? CapAmount { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
