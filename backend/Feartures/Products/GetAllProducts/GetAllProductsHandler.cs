using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.GetAllProducts
{
    public sealed class GetAllProductsHandler : IRequestHandler<GetAllProductsCommand, Result<List<GetAllProductsQuery>>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public GetAllProductsHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Result<List<GetAllProductsQuery>>> Handle(GetAllProductsCommand cmd, CancellationToken ct)
        {
            var products = await _dbContext.Products
                .OrderBy(p => p.Status) // Sắp xếp theo status để dễ quản lý
                .ThenBy(p => p.ProductId)
                .ProjectTo<GetAllProductsQuery>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result.Success(products);
        }
    }
}
