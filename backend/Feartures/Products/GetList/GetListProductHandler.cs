using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Feartures.Branches.GetListBranch;
using backend.Feartures.Products.NewFolder;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Products.GetList
{
    public record GetListProductCommand : IRequest<Result<List<GetListProductQuery>>>;
    public class GetListProductHandler
        : IRequestHandler<GetListProductCommand, Result<List<GetListProductQuery>>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public GetListProductHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Result<List<GetListProductQuery>>> Handle(GetListProductCommand cmd, CancellationToken ct)
        {
            var products = await _dbContext.Products
                .OrderBy(b => b.ProductId)
                .ProjectTo<GetListProductQuery>(_mapper.ConfigurationProvider)
                .ToListAsync(ct);

            return Result.Success(products);
        }
    }
}
