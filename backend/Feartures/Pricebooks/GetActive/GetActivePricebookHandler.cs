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

            // Build DTO including items (products + prices)
            var result = new GetActivePricebookQuery
            {
                PricebookId = activePricebook.PricebookId,
                Name = activePricebook.Name,
                EffectiveFrom = activePricebook.EffectiveFrom,
                EffectiveTo = activePricebook.EffectiveTo,
                Status = activePricebook.Status,
                CreatedAt = activePricebook.CreatedAt,
                Items = activePricebook.PricebookItems.Select(pi => new GetActivePricebookItemQuery
                {
                    PricebookItemId = pi.PricebookItemId,
                    ProductId = pi.ProductId,
                    ProductName = pi.Product.Name,
                    ModelCode = pi.Product.ModelCode!,
                    VariantCode = pi.Product.VariantCode!,
                    MsrpPrice = pi.MsrpPrice,
                    FloorPrice = pi.FloorPrice,
                    OemDiscountAmount = pi.OemDiscountAmount,
                    OemDiscountPercent = pi.OemDiscountPercent
                }).ToList()
            };

            return Result.Success(result);
        }
    }
}
