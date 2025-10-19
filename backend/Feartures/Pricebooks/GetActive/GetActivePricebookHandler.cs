using Ardalis.Result;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using backend.Infrastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace backend.Feartures.Pricebooks.GetActive
{
    public sealed class GetActivePricebookHandler : IRequestHandler<GetActivePricebookCommand, Result<GetActivePricebookQuery>>
    {
        private readonly EVDmsDbContext _dbContext;
        private readonly IMapper _mapper;

        public GetActivePricebookHandler(EVDmsDbContext dbContext, IMapper mapper)
        {
            _dbContext = dbContext;
            _mapper = mapper;
        }

        public async Task<Result<GetActivePricebookQuery>> Handle(GetActivePricebookCommand cmd, CancellationToken ct)
        {
            var today = DateOnly.FromDateTime(DateTime.UtcNow);

            var activePricebook = await _dbContext.Pricebooks
                .Include(pb => pb.PricebookItems)
                    .ThenInclude(pi => pi.Product)
                .Where(pb => pb.Status == "Active" &&
                           pb.EffectiveFrom <= today &&
                           (pb.EffectiveTo == null || pb.EffectiveTo >= today))
                .OrderByDescending(pb => pb.EffectiveFrom)
                .FirstOrDefaultAsync(ct);

            if (activePricebook == null)
            {
                return Result.Error("Không có pricebook nào đang active hiện tại.");
            }

            var result = _mapper.Map<GetActivePricebookQuery>(activePricebook);
            return Result.Success(result);
        }
    }
}
