using Ardalis.Result;
using backend.Common.Markers;
using backend.Domain.Enums;
using MediatR;

namespace backend.Feartures.Dealers.Create
{
    public sealed class CreateDealerCommand : IRequest<Result<CreateDealerResponse>>, ITransactionalRequest
    {
        public string Code { get; set; } = default!;
        public string Name { get; set; } = default!;
        public string? LegalName { get; set; }
        public string? TaxId { get; set; }
        public DealerStatus? Status { get; set; }
        public decimal CreditLimit { get; set; }

    }

}

