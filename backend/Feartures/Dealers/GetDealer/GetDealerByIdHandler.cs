using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Dealers.GetDealer
{
    public class GetDealerByIdHandler : IRequestHandler<GetDealerByIdQuery, Result<GetDealerDetailDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetDealerByIdHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<GetDealerDetailDto>> Handle(GetDealerByIdQuery request, CancellationToken ct)
        {
            var dealer = await _db.Dealers
                .Where(d => d.DealerId == request.DealerId)
                .ProjectTo<GetDealerDetailDto>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync();

            if (dealer == null)
            {
                return Result.NotFound($"Dealer with id {request.DealerId} not found.");
            }

            return Result.Success(dealer);
        }
    }
}
