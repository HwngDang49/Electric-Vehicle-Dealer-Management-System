using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Feartures.PurchaseOrders.GetPo;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.PurchaseOrders.GetPoDetail
{

    public class GetPoDetailHandler : IRequestHandler<GetPoDetailQuery, Result<GetPoDetailDto>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetPoDetailHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<GetPoDetailDto>> Handle(GetPoDetailQuery request, CancellationToken ct)
        {

            var po = await _db.PurchaseOrders
                                    .AsNoTracking() //read-only
                                    .Where(p => p.PoId == request.PoId)
                                    .ProjectTo<GetPoDetailDto>(_mapper.ConfigurationProvider)
                                    .FirstOrDefaultAsync(ct);

            if (po is null) return Result.NotFound($"PO {request.PoId} not found.");
            return Result.Success(po);
        }
    }
}
