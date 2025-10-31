using backend.Common.Paging;
using MediatR;

namespace backend.Feartures.DealerAgreements.GetList
{
    public sealed class GetListDealerAgreementsQuery : IRequest<PagedResult<GetListDealerAgreementsDto>>
    {
        public long? DealerId { get; set; } // Optional: Admin có thể filter, Dealer lấy từ token
        public string? Status { get; set; } // Optional filter: "Active", "Expired", "Inactive"
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public sealed class GetListDealerAgreementsDto
    {
        public long AgreementId { get; set; }
        public long DealerId { get; set; }
        public string Code { get; set; } = default!;
        public string Title { get; set; } = default!;
        public DateOnly StartDate { get; set; }
        public DateOnly? EndDate { get; set; }
        public string Status { get; set; } = default!;
        public DateTime CreatedAt { get; set; }
    }
}

