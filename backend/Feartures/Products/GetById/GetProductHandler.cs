using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Common.Helpers;
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
            var product = await _db.Products
                .AsNoTracking()
                .Where(p => p.ProductId == request.productId)
                .ProjectTo<GetProductQuery>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (product == null)
            {
                return Result.NotFound($"Product with id {request.productId} not found.");
            }

            // Convert to Vietnam time
            product.CreateAt = DateTimeHelper.ToVietnamTime(product.CreateAt);
            if (product.UpdatedAt.HasValue)
            {
                product.UpdatedAt = DateTimeHelper.ToVietnamTime(product.UpdatedAt.Value);
            }

            return Result.Success(product);
        }
    }
}
