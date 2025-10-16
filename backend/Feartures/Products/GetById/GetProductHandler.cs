using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.Get
{
    public record GetProductCommand(long productId) : IRequest<Result<GetProductQuery>>;
    public class GetProductHandler : IRequestHandler<GetProductCommand, Result<GetProductQuery>>
    {
        private readonly EVDmsDbContext _db;
        private readonly IMapper _mapper;

        public GetProductHandler(EVDmsDbContext db, IMapper mapper)
        {
            _db = db;
            _mapper = mapper;
        }

        public async Task<Result<GetProductQuery>> Handle(GetProductCommand request, CancellationToken ct)
        {
            var exists = await _db.Products.
                                Where(p => p.ProductId == request.productId)
                                .ProjectTo<GetProductQuery>(_mapper.ConfigurationProvider)
                                //PrọectTo mapping đúng chính xác sản phẩm dó luôn
                                .FirstOrDefaultAsync(ct);

            if (exists == null)
            {
                return Result.Error($"ProductId {request.productId} not found");
            }

            return Result.Success(exists);
        }
    }
}
