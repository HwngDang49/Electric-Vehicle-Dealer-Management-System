using Ardalis.Result;
using MediatR;

namespace backend.Feartures.Dealers.GetList
{
    public record GetDealersQuery : IRequest<Result<List<GetDealersDto>>>;
    public class GetDealersDto
    {
        public long Id { get; set; }
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? LegalName { get; set; }
        public string? TaxId { get; set; }
        public decimal CreditLimit { get; set; }
        public DateTime CreateAt { get; set; }
    }
}
