using Ardalis.Result;
using MediatR;
namespace backend.Feartures.Dealers.GetDealer
{
    public sealed class GetDealerByIdQuery : IRequest<Result<GetDealerDetailDto>>
    {
        public long DealerId { get; set; }
    }

    public class GetDealerDetailDto
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
