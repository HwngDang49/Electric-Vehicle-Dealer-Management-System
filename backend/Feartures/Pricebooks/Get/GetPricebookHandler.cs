using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.Get
{
    public class GetPricebookHandler
    : IRequestHandler<GetPricebookCommand, Result<GetPricebookQuery>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public GetPricebookHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Result<GetPricebookQuery>> Handle(GetPricebookCommand request, CancellationToken ct)
        {
            var pricebook = await _dbContext.Pricebooks
                .Where(pb => pb.PricebookId == request.pricebookId)
                .ProjectTo<GetPricebookQuery>(_mapper.ConfigurationProvider)
                .FirstOrDefaultAsync(ct);

            if (pricebook == null)
            {
                return Result.Error("Pricebook does not exist");
            }
            return Result.Success(pricebook);
        }
    }
}