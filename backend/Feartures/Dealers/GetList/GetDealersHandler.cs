using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.GetList
{
    public class GetDealersHandler : IRequestHandler<GetDealersQuery, Result<List<GetDealersDto>>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetDealersHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<List<GetDealersDto>>> Handle(GetDealersQuery query, CancellationToken ct)
        {
            var dealers = await _db.Dealers
                .OrderBy(d => d.Name)
                .ProjectTo<GetDealersDto>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result.Success(dealers);
        }
    }
}
