using Ardalis.Result;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.GetDealer
{
    public class GetDealerByIdHandler : IRequestHandler<GetDealerByIdQuery, Result<GetDealerDetailDto>>
    {
        private readonly EVDmsDbContext _db;

        public GetDealerByIdHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<GetDealerDetailDto>> Handle(GetDealerByIdQuery request, CancellationToken ct)
        {
            var dealer = await _db.Dealers
                .Where(d => d.DealerId == request.DealerId)
                .Select(d => new GetDealerDetailDto
                {
                    DealerId = d.DealerId,
                    Code = d.Code,
                    Name = d.Name,
                    LegalName = d.LegalName,
                    TaxId = d.TaxId,
                    Status = d.StatusEnum,
                    CreditLimit = d.CreditLimit,
                    CreatedAt = d.CreatedAt,
                    UpdatedAt = d.UpdatedAt
                })
                .FirstOrDefaultAsync(ct);

            if (dealer == null)
            {
                return Result.NotFound($"Dealer with id {request.DealerId} not found.");
            }

            return Result.Success(dealer);
        }
    }
}
