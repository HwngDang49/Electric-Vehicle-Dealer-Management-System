using Ardalis.Result;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;


namespace backend.Feartures.Dealers.GetList
{
    public class GetDealersHandler : IRequestHandler<GetDealersQuery, Result<List<GetDealersDto>>>
    {
        private readonly EVDmsDbContext _db;

        public GetDealersHandler(EVDmsDbContext db)
        {
            _db = db;
        }

        public async Task<Result<List<GetDealersDto>>> Handle(GetDealersQuery query, CancellationToken ct)
        {
            var dealers = await _db.Dealers
                .OrderBy(d => d.Name)
                .Select(d => new GetDealersDto
                {
                    Id = d.DealerId,
                    Code = d.Code,
                    Name = d.Name,
                    LegalName = d.LegalName,
                    TaxId = d.TaxId,
                    CreditLimit = d.CreditLimit,
                    CreateAt = d.CreatedAt
                })
                .ToListAsync(ct);

            return Result.Success(dealers);
        }
    }
}
